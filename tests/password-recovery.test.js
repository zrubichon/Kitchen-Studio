import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const user={id:'verified-recovery-user',email:'test@example.com',user_metadata:{name:'Test'}};
function harness({hash='',stored=null,session={access_token:'recovery-token',user},event='PASSWORD_RECOVERY',updateError=null}={}){
  const nodes=new Map(),storage=new Map(),order=[],updates=[],authEvents=[],listeners=new Map();
  if(stored)storage.set('misePasswordRecoveryUser',stored);
  function element(){return {open:false,disabled:false,value:'',hidden:false,textContent:'',listeners:{},classList:{toggle(){}},addEventListener(name,fn){this.listeners[name]=fn},showModal(){this.open=true},close(){this.open=false;this.listeners.close?.()},focus(){},reset(){nodes.get('#newRecoveryPassword').value='';nodes.get('#confirmRecoveryPassword').value=''},set innerHTML(s){this.textContent=s},get innerHTML(){return this.textContent}}}
  for(const id of ['passwordRecoveryModal','passwordRecoveryForm','newRecoveryPassword','confirmRecoveryPassword','passwordRecoverySubmit','passwordRecoveryStatus','passwordRecoveryCancel','cloudAuthStatus','cloudSignOut','accountDisplayName','accountDisplayEmail','accountAvatar'])nodes.set('#'+id,element());
  let callback;
  const auth={
    onAuthStateChange(fn){order.push('subscribe');callback=fn;return {data:{subscription:{unsubscribe(){}}}}},
    async getSession(){order.push('getSession');if(event)callback?.(event,session);return {data:{session},error:null}},
    async updateUser(payload){updates.push(payload);if(updateError)return {error:{message:updateError}};callback?.('USER_UPDATED',session);return {data:{user},error:null}},
    async signOut(){callback?.('SIGNED_OUT',null);return {error:null}}
  };
  const document={querySelector:s=>nodes.get(s)||null,querySelectorAll:s=>s==='dialog[open]'?[...nodes].filter(([k,n])=>k.endsWith('Modal')&&n.open).map(([,n])=>n):[],createElement:element,head:{appendChild(){}},dispatchEvent:e=>{authEvents.push(e);for(const fn of listeners.get(e.type)||[])fn(e)},addEventListener:(type,fn)=>listeners.set(type,[...(listeners.get(type)||[]),fn])};
  const window={location:{hash,pathname:'/',search:''},supabase:{createClient:()=>({auth,from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:{message:'skip fixture data load'}})})})})})}};
  const ctx=vm.createContext({window,document,URLSearchParams,Headers,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},localStorage:{getItem:()=>null,setItem(){}},fetch:async()=>({json:async()=>({configured:true,url:'https://example.test',key:'public'})}),console:{warn(){}},history:{replaceState(){}},setTimeout,clearTimeout,CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts?.detail}},openModal:d=>d.showModal(),closeModal:d=>d.close(),toast(){},navigate(){}});
  vm.runInContext(fs.readFileSync(new URL('../cloud-sync.js',import.meta.url),'utf8'),ctx);
  return {window,nodes,storage,order,updates,authEvents,callback:(e,s)=>callback(e,s)};
}
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
async function submit(h,password='NewPassword123!',confirmation=password){
  h.nodes.get('#newRecoveryPassword').value=password;h.nodes.get('#confirmRecoveryPassword').value=confirmation;
  await h.nodes.get('#passwordRecoveryForm').listeners.submit({preventDefault(){}});
}

test('listener exists before SDK initializes recovery; form precedes normal account UI',async()=>{
  const h=harness({hash:'#access_token=recovery-token&type=recovery'});await settle();
  assert.deepEqual(h.order.slice(0,2),['subscribe','getSession']);
  assert.equal(h.nodes.get('#passwordRecoveryModal').open,true);assert.equal(h.nodes.get('#passwordRecoverySubmit').disabled,false);
  assert.equal(h.authEvents.filter(e=>e.type==='mise:auth').length,0);assert.equal(h.updates.length,0);
  assert.equal(h.window.KitchenCloud.recovering,true);
});
test('URL intent opens form even when SDK emitted recovery before listener',async()=>{
  const h=harness({hash:'#access_token=recovery-token&type=recovery',event:null});await settle();
  assert.equal(h.nodes.get('#passwordRecoveryModal').open,true);assert.equal(h.nodes.get('#passwordRecoverySubmit').disabled,false);
});
test('new password is saved only after confirmation, then account UI opens',async()=>{
  const h=harness({hash:'#access_token=recovery-token&type=recovery'});await settle();
  await submit(h,'short');await submit(h,'NewPassword123!','DifferentPassword');assert.equal(h.updates.length,0);
  await submit(h);assert.deepEqual(JSON.parse(JSON.stringify(h.updates)),[{password:'NewPassword123!'}]);
  assert.equal(h.window.KitchenCloud.recovering,false);assert.equal(h.nodes.get('#passwordRecoveryModal').open,false);
  assert.equal(h.storage.has('misePasswordRecoveryUser'),false);assert.ok(h.authEvents.some(e=>e.type==='mise:auth'&&e.detail.user.id===user.id));
});
test('server rejection preserves recovery form and allows correcting the password',async()=>{
  const h=harness({hash:'#access_token=recovery-token&type=recovery',updateError:'Password should differ from old password'});await settle();await submit(h);
  assert.equal(h.window.KitchenCloud.recovering,true);assert.equal(h.nodes.get('#passwordRecoveryModal').open,true);assert.equal(h.nodes.get('#passwordRecoverySubmit').disabled,false);
  assert.match(h.nodes.get('#passwordRecoveryStatus').textContent,/differ/);
});
test('expired or mismatched recovery links cannot change a saved account password',async()=>{
  for(const opts of [{hash:'#error=access_denied&error_description=Expired',event:null,session:null},{hash:'#access_token=invalid-token&type=recovery',event:null}]){
    const h=harness(opts);await settle();assert.equal(h.nodes.get('#passwordRecoverySubmit').disabled,true);await submit(h);assert.equal(h.updates.length,0);
  }
});
test('refresh resumes a pending recovery only for the same user',async()=>{
  const h=harness({stored:user.id,event:'INITIAL_SESSION'});await settle();assert.equal(h.nodes.get('#passwordRecoveryModal').open,true);
  const other=harness({stored:'another-user',event:'INITIAL_SESSION'});await settle();assert.equal(other.window.KitchenCloud.recovering,false);assert.equal(other.nodes.get('#passwordRecoveryModal').open,false);assert.equal(other.storage.has('misePasswordRecoveryUser'),false);
});
test('regular login and signup confirmation do not open password reset form',async()=>{
  for(const hash of ['', '#access_token=recovery-token&type=signup']){
    const h=harness({hash,event:'SIGNED_IN'});await settle();assert.equal(h.nodes.get('#passwordRecoveryModal').open,false);assert.equal(h.window.KitchenCloud.recovering,false);
  }
});
test('cancel recovery returns to connection without modifying the password',async()=>{
  const h=harness({hash:'#access_token=recovery-token&type=recovery'});await settle();
  await h.nodes.get('#passwordRecoveryCancel').listeners.click();await settle();
  assert.equal(h.window.KitchenCloud.recovering,false);assert.equal(h.nodes.get('#passwordRecoveryModal').open,false);assert.equal(h.updates.length,0);
});
