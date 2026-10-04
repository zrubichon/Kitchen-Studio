import test from 'node:test';
import assert from 'node:assert/strict';
import {accessForUser, requirePremium, OWNER_EMAIL, OWNER_USER_ID} from '../lib/access.js';
import commerce from '../api/commerce-config.js';
import generate from '../api/generate-plan.js';

const owner={id:OWNER_USER_ID,email:OWNER_EMAIL,email_confirmed_at:'2026-09-28T19:23:44Z'};
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(d){this.data=d;return this},end(){return this}};}
function mockAuth(t,user=owner){t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify(user),{status:200}));}

test('free access cannot be elevated with copied email or editable metadata',()=>{
  for(const user of [null,{id:'another-user',email:OWNER_EMAIL,email_confirmed_at:'yes',user_metadata:{premium:true,owner:true}}, {...owner,email:'other@example.com'}, {...owner,email_confirmed_at:null}]){
    assert.deepEqual(accessForUser(user),{owner:false,premium:false,studentPack:false,source:'free'});
  }
  assert.deepEqual(accessForUser(owner),{owner:true,premium:true,studentPack:true,source:'owner'});
});
test('all paid APIs reject unauthenticated requests before contacting AI',async t=>{
  let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;throw new Error('Must not call AI')});
  for(const name of ['generate-plan','adapt-cooking','analyze-manual','recognize-appliance','research-appliance','wellness-note']){
    const {default:handler}=await import('../api/'+name+'.js');const res=response();
    await handler({method:'POST',headers:{},body:{email:OWNER_EMAIL,owner:true}},res);
    assert.equal(res.code,401,name);assert.equal(res.data.code,'auth_required');
  }
  assert.equal(calls,0);
});
test('forged or expired bearer tokens do not grant owner access',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('{}',{status:401}));
  const res=response();await requirePremium({headers:{authorization:'Bearer fake-token'}},res);
  assert.equal(res.code,401);
});
test('a verified nonowner is denied even if they submit the owner email',async t=>{
  mockAuth(t,{...owner,id:'other-user'});const res=response();
  await requirePremium({headers:{authorization:'Bearer mock-session'},body:{email:OWNER_EMAIL}},res);
  assert.equal(res.code,403);assert.equal(res.data.code,'premium_required');
});
test('owner previews reduce privileges without altering their entitlement',async t=>{
  mockAuth(t);
  for(const preview of ['all','premium','free','student-pack']){
    const res=response();const result=await requirePremium({headers:{authorization:'Bearer mock-session','x-mise-preview':preview}},res);
    assert.equal(Boolean(result),['all','premium'].includes(preview));
  }
  assert.equal(accessForUser(owner).studentPack,true);
});
test('membership uses live authenticated identity and disables caching',async t=>{
  mockAuth(t);const res=response();await commerce({method:'GET',headers:{authorization:'Bearer mock-session'}},res);
  assert.equal(res.data.access.owner,true);assert.match(res.headers['Cache-Control'],/no-store/);
  assert.equal(res.headers.Vary,'Authorization');
  const anon=response();await commerce({method:'GET',headers:{}},anon);assert.equal(anon.data.access.owner,false);
});
test('only owner can run AI diagnostic and billing refusal is explicit',async t=>{
  t.mock.method(globalThis,'fetch',async url=>url.includes('/auth/v1/user')?new Response(JSON.stringify(owner)):new Response(JSON.stringify({error:{type:'customer_verification_required',message:'credit card on file required'}}),{status:403}));
  const previous=process.env.AI_GATEWAY_API_KEY;process.env.AI_GATEWAY_API_KEY='mock-key';t.after(()=>{if(previous===undefined)delete process.env.AI_GATEWAY_API_KEY;else process.env.AI_GATEWAY_API_KEY=previous;});
  const denied=response();await commerce({method:'GET',headers:{},query:{checkAi:'1'}},denied);assert.equal(denied.code,403);
  const res=response();await commerce({method:'GET',headers:{authorization:'Bearer mock-session'},query:{checkAi:'1'}},res);
  assert.equal(res.data.ai.state,'blocked');assert.equal(res.data.ai.code,'ai_billing_required');
});
test('planning accepts new catalog recipes and rejects unknown or wrong meal slots',async t=>{
  const previous=process.env.AI_GATEWAY_API_KEY;process.env.AI_GATEWAY_API_KEY='mock-key';t.after(()=>{if(previous===undefined)delete process.env.AI_GATEWAY_API_KEY;else process.env.AI_GATEWAY_API_KEY=previous;});
  const catalog=[{id:'student-breakfast',slot:'breakfast'},{id:'student-lunch',slot:'lunch'},{id:'student-dinner',slot:'dinner'}];
  let plan=Array.from({length:7},()=>catalog.map(x=>x.id));
  t.mock.method(globalThis,'fetch',async url=>url.includes('/auth/v1/user')?new Response(JSON.stringify(owner)):new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({plan})}}]})));
  const req={method:'POST',headers:{authorization:'Bearer mock-session'},body:{recipeCatalog:catalog}};
  const good=response();await generate(req,good);assert.equal(good.code,200);assert.equal(good.data.plan.length,7);
  for(const invalid of ['not-a-recipe','student-dinner']){
    plan[0][0]=invalid;const res=response();await generate(req,res);assert.equal(res.code,500);
  }
});
