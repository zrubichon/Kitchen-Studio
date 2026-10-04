import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// DOM fixtures test the actual preview controller without a signed-in browser.
function harness(access){
  const nodes=new Map(),events=new Map(),saved=new Map();
  function node(){return {hidden:false,value:'',disabled:false,dataset:{},textContent:'',listeners:{},classList:{toggle(){}},setAttribute(){},addEventListener(name,fn){this.listeners[name]=fn},insertAdjacentElement(_where,el){nodes.set('#'+el.id,el)},remove(){nodes.delete('#'+this.id)},querySelector(){return node()},set innerHTML(html){for(const id of html.matchAll(/id="([^"]+)"/g))nodes.set('#'+id[1],node())}}}
  const fields=[node(),node()];const cards=Array.from({length:8},()=>node());
  for(const sel of ['#premiumGoalCard','#premiumProfileLock','#premiumStatus','#page-profile .page-head','#page-planner .hero-row','.account-summary','#languageSelect'])nodes.set(sel,node());
  const document={querySelector:s=>nodes.get(s)||null,querySelectorAll:s=>s.includes('#premiumFields')?fields:s==='#recipeGrid [data-recipe]'?cards:[],createElement:()=>node(),addEventListener:(name,fn)=>{events.set(name,[...(events.get(name)||[]),fn])},dispatchEvent:e=>{for(const fn of events.get(e.type)||[])fn(e)}};
  const window={scrollTo(){},__recipeCategory:'student-budget',KitchenCloud:{user:{id:'fixture'},request:async()=>({ok:true,json:async()=>({access,links:{},ready:false})})}};
  const ctx=vm.createContext({document,window,state:{profile:{language:'fr'}},renderRecipes(){},toast(){},navigate(){},sessionStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},setTimeout,clearTimeout});
  vm.runInContext(fs.readFileSync(new URL('../app-v15.js',import.meta.url),'utf8'),ctx);
  return {window,nodes,fields,cards,document,setAccess:value=>{access=value}};
}
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));

test('owner can preview all three offers and restore full access',async()=>{
  const h=harness({owner:true,premium:true,studentPack:true,source:'owner'});await settle();
  assert.equal(h.window.MiseAccess.owner,true);assert.equal(h.window.MiseAccess.premium,true);assert.equal(h.window.MiseAccess.studentPack,true);
  const select=h.nodes.get('#ownerPreviewSelect');assert.ok(select);
  for(const [value,premium,pack] of [['free',false,false],['premium',true,false],['student-pack',false,true],['all',true,true]]){
    select.value=value;select.listeners.change({target:select});await settle();
    assert.equal(h.window.MiseAccess.premium,premium,value);assert.equal(h.window.MiseAccess.studentPack,pack,value);
    assert.equal(h.fields[0].disabled,!premium,value);assert.equal(h.cards[7].dataset.packLocked,pack?'0':'1',value);
    assert.equal(h.window.MiseAccess.owner,true);
  }
});
test('sign-out immediately clears owner controls and both paid grants',async()=>{
  const h=harness({owner:true,premium:true,studentPack:true,source:'owner'});await settle();
  h.setAccess({owner:false,premium:false,studentPack:false,source:'free'});h.document.dispatchEvent({type:'mise:auth',detail:{user:null}});
  assert.equal(h.window.MiseAccess.owner,false);assert.equal(h.window.MiseAccess.premium,false);assert.equal(h.nodes.has('#ownerAccessPanel'),false);
  await settle();assert.equal(h.window.MiseAccess.studentPack,false);
});
