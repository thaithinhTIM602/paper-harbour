import test from "node:test";
import assert from "node:assert/strict";
import { CASEBOOK } from "../cases.mjs";
import { newOffice, resolveFile, wireCode, makeReturn, readReturn, normalDraft, fileRuling, readOffice, audit, disputed } from "../office.mjs";
import { returnRoom, returnDesk } from "../post.mjs";
const f=resolveFile(wireCode("radio",8714));
const sender=normalDraft(f,{marks:["R31","R34"],facts:["exhibit.1","log.0","policy.cover"],counts:{R31:1,R34:1}});
const token=makeReturn(f,sender);

test("sealed return preserves the exact quantities and citations, with no names or free text",()=>{
  assert.match(token,/^A[0-9A-Z]{11}$/);const received=readReturn(f,token);
  assert.deepEqual(received.counts,sender.counts);assert.deepEqual(received.marks,sender.marks);
  assert.deepEqual(new Set(received.facts),new Set(sender.facts));assert.equal(makeReturn(f,received),token);
  assert.equal(audit(f,received).written.payable,audit(f,sender).written.payable);
  assert.equal(makeReturn(resolveFile("radio"),sender),null);assert.equal(makeReturn(f,{}),null);
});
test("a return appears closed before filing and reveals both desks after an independent ruling",()=>{
  const s=newOffice();const closed=returnRoom(s,f.id,token);
  assert.match(closed,/figures stay folded/);assert.doesNotMatch(closed,/Returned payment|Allowed cargo units|exhibit reading|£/);
  const mine=normalDraft(f,{marks:["R34"],facts:["log.1"],counts:{}});fileRuling(s,f,mine);
  const open=returnRoom(s,f.id,token);assert.match(open,/Two rulings, one cargo/);assert.match(open,/Returned payment/);assert.match(open,/Compare the evidence clips/);
  assert.match(returnDesk(s,f,mine),/Copy return slip/);
});
test("stored returns survive export and reject corrupt or duplicate slips",()=>{
  const s=newOffice();s.returns[f.id]=[token,token,"not-a-slip"];s.returns.coffee=[token];
  const clean=readOffice(s);assert.deepEqual(clean.returns,{[f.id]:[token]});
  const broken=token.slice(0,-1)+(token.endsWith("X")?"Y":"X");
  assert.equal(readReturn(f,broken),null);assert.equal(readReturn(f,token.toLowerCase()),null);
  assert.match(returnRoom(s,f.id,broken),/return slip is incomplete/);
});
test("1,200 independent return journeys round trip generated counts, clips and cash exactly",()=>{
  for(let i=0;i<200;i++)for(const b of CASEBOOK){
    const file=resolveFile(wireCode(b.id,i*43421)),half=file.lots.map(l=>[l.mark,Math.floor(disputed(l)/2)]);
    const d=normalDraft(file,{marks:[file.lots[i%3].mark],facts:["survey.0","policy.cover"],counts:Object.fromEntries(half)});
    const t=makeReturn(file,d),r=readReturn(file,t);
    assert.equal(makeReturn(file,r),t);assert.deepEqual(d.counts,r.counts);
    assert.equal(audit(file,d).written.payable,audit(file,r).written.payable);
  }
});

