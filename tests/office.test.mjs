import test from "node:test";
import assert from "node:assert/strict";
import { CASEBOOK } from "../cases.mjs";
import { exhibit, exhibitDocument, apparatus, PROOF } from "../exhibits.mjs";
import { resolveFile, documents, money, unitLoss, claimed, disputed, normalDraft, entitlements,
  settlement, audit, wireCode, parseCode, newOffice, fileRuling, readOffice, ledger, treatyRecovery } from "../office.mjs";
import { caseRoom } from "../desk.mjs";
import { cover, caseIndex, guide } from "../press.mjs";
import { ledgerRoom, wireRoom, gazette } from "../rooms.mjs";

const fixtures=[
  ["coffee",{K12:6,K14:0,K16:0},186000,91200,81200,["exhibit.0","exhibit.1"]],
  ["radio",{R31:3,R34:0,R37:0},131000,84000,60800,["exhibit.0","exhibit.1"]],
  ["china",{P21:7,P24:0,P28:0},183500,115500,80000,["exhibit.1","exhibit.0"]],
  ["citrus",{O42:0,O43:0,O46:0},117000,0,0,["exhibit.2"]],
  ["tea",{T51:4,T53:2,T55:0},182000,158000,83000,["exhibit.0","exhibit.2"]],
  ["dynamo",{M61:2,M64:1,M66:0},293500,89000,67500,["exhibit.0","survey.1"]]
];
function perfect(file){
  const proof=fixtures.find(row=>row[0]===file.baseId)[5];
  return normalDraft(file,{offset:0,marks:file.lots.filter(l=>disputed(l)).map(l=>l.mark),facts:[...proof,"policy.cover"],counts:entitlements(file)});
}
const sample=resolveFile("coffee");
for(const [key,counts,demand,gross,net] of fixtures){
  test(`${key}: reconcile the signed tally, prices, policy and physical evidence`,()=>{
    const f=resolveFile(key),d=perfect(f),a=audit(f,d);
    assert.equal(claimed(f),demand);assert.deepEqual(entitlements(f),counts);
    assert.equal(a.right.total,gross);assert.equal(a.right.payable,net);
    assert.equal(a.perfect,true);assert.equal(a.review+a.appeal+a.excess+a.delayFee,0);
    assert.equal(documents(f).length,5);assert.equal(exhibitDocument(f).lines.length,3);
    for(const reading of exhibitDocument(f).lines)assert.ok(reading.text.length>24);
  });
}
test("repair and surrender are independent alternatives and cannot collect twice",()=>{
  const f=resolveFile("dynamo"),[housing,coils]=f.lots;
  assert.deepEqual(unitLoss(housing),{value:82000,salvage:28000,replacement:54000,amount:21500,method:"repair"});
  assert.equal(unitLoss(coils).amount,46000);
  assert.equal(unitLoss({...housing,repair:660}).amount,54000);
  assert.equal(unitLoss({...housing,salvage:900}).amount,0);
  assert.equal(unitLoss({...housing,declared:400}).value,40000);
});
test("credit, deductible, share and limit follow the printed order",()=>{
  const f=resolveFile("tea");
  const s=settlement({...f,policy:{...f.policy,share:80,cap:500}},entitlements(f));
  assert.deepEqual([s.total,s.credit,s.deductible,s.shared,s.capped,s.payable],[158000,70000,5000,66400,16400,50000]);
  const one=settlement(f,{T51:1});assert.equal(one.credit,29000);assert.equal(one.deductible,0);assert.equal(one.payable,0);
});
test("invalid, fractional and oversized quantities cannot create phantom cargo",()=>{
  for(const n of [-100,Number.NaN,Infinity,2.9,"2",null])assert.equal(settlement(sample,{K12:n}).payable,0);
  assert.equal(settlement(sample,{K12:1000}).lines[0].count,6);
  const d=normalDraft(sample,{marks:["K12","<x>","K12"],facts:["policy.cover","survey.0","survey.1","log.1","account.values","<x>"],offset:-400,counts:{K12:99}});
  assert.deepEqual(d.marks,["K12"]);assert.equal(d.facts.length,4);assert.equal(d.offset,-3);assert.equal(d.counts.K12,6);
});
test("a correct number cannot hide an unsupported cause or an incorrect allocation at the policy cap",()=>{
  const f=resolveFile("china"),d=perfect(f);d.counts.P21=6;d.facts=["policy.cover","log.2"];
  const a=audit(f,d);assert.equal(a.right.payable,a.written.payable);assert.equal(a.perfect,false);assert.equal(a.review,2000);
  assert.equal(a.checks.find(c=>c.name==="Cargo quantities").ok,false);
});
test("an operating temperature strip alone cannot prove the length of the fog closure",()=>{
  const f=resolveFile("citrus"),d=perfect(f);d.facts=["survey.0","survey.1","policy.cover"];
  assert.equal(audit(f,d).checks[2].ok,false);d.facts.push("log.0");assert.equal(audit(f,d).perfect,true);
});
test("a general comment cannot substitute for evidence of a prior pool payment",()=>{
  const f=resolveFile("tea"),d=perfect(f);d.facts=["survey.0","survey.1","policy.cover"];assert.equal(audit(f,d).perfect,false);
  d.facts.push("log.0");assert.equal(audit(f,d).perfect,true);
});
test("appeals and evidence costs travel by post and can be posted only once",()=>{
  const s=newOffice(),d=normalDraft(sample,{marks:["K12"],facts:["log.2"]});
  assert.ok(fileRuling(s,sample,d));let b=ledger(s);
  assert.deepEqual([b.cash,b.pendingIn,b.pendingOut,b.closing],[850000,0,87700,762300]);
  s.lastMail=sample.id;b=ledger(s);assert.deepEqual([b.cash,b.pendingOut,b.closing],[762300,0,762300]);assert.equal(b.hasMail,false);
  const other=resolveFile("citrus");fileRuling(s,other,perfect(other));assert.equal(ledger(s).closing,762300);
});
test("cash leaves now, legitimate reinsurance arrives later and gifts remain with the claimant",()=>{
  const s=newOffice();s.treaty="quota";const d=perfect(sample);d.counts.K14=4;
  fileRuling(s,sample,d);const b=ledger(s),r=b.rows[0];
  assert.equal(r.write,132400);assert.equal(r.overpay,51200);assert.equal(r.reimbursement,27067);
  assert.deepEqual([b.cash,b.pendingIn,b.closing],[652600,27067,679667]);
  s.lastMail=sample.id;assert.equal(ledger(s).cash,679667);
});
test("reinsurance obeys both single loss and whole book limits on every posting",()=>{
  assert.equal(treatyRecovery("excess",55000,0),0);assert.equal(treatyRecovery("excess",500000,0),65000);
  assert.equal(treatyRecovery("excess",500000,139600),400);assert.equal(treatyRecovery("quota",400000,189988),12);
  assert.equal(treatyRecovery("quota",400000,190010),0);assert.equal(treatyRecovery("own",500000,0),0);
});
test("a separate cable filing neither binds nor posts the summer ledger",()=>{
  const s=newOffice();s.treaty="excess";fileRuling(s,sample,perfect(sample));const before=ledger(s);
  const f=resolveFile(wireCode("citrus",20260));assert.ok(fileRuling(s,f,perfect(f)));
  assert.deepEqual(ledger(s),before);assert.ok(s.loose.includes(f.id));assert.equal(fileRuling(s,f,perfect(f)),false);
});
test("a ruling requires both kinds of evidence and retries are idempotent",()=>{
  const s=newOffice();assert.equal(fileRuling(s,sample,{}),false);
  assert.equal(fileRuling(s,sample,{marks:["K12"]}),false);assert.equal(fileRuling(s,sample,{facts:["log.0"]}),false);
  assert.equal(fileRuling(s,sample,perfect(sample)),true);const original=JSON.stringify(s);
  assert.equal(fileRuling(s,sample,{...perfect(sample),counts:{}}),false);assert.equal(JSON.stringify(s),original);
});
test("validated storage restores a desk, discards stale keys and deduplicates duplicate postings",()=>{
  const s=newOffice();s.treaty="quota";fileRuling(s,sample,perfect(sample));
  const f=resolveFile(wireCode("dynamo",80321));fileRuling(s,f,perfect(f));s.lastMail="coffee";
  assert.deepEqual(readOffice(JSON.stringify(s)),s);
  const contaminated=structuredClone(s);contaminated.rulings.push(s.rulings[0],{id:"unlisted"});contaminated.drafts.broken={};
  assert.deepEqual(readOffice(contaminated),s);
  for(const broken of ["{","null",null,{version:99}])assert.deepEqual(readOffice(broken),newOffice());
});
test("wire codes survive copying, case changes and spaces and reject mistyped check digits",()=>{
  for(const f of CASEBOOK)for(const n of [0,1,187,2**17,36**5-1]){
    const code=wireCode(f.id,n);
    assert.equal(parseCode(" ph "+code.toLowerCase()).code,code);
    assert.equal(parseCode(code).seed,n);assert.equal(parseCode(code).base.id,f.id);
    assert.equal(parseCode(code.slice(0,-1)+(code.endsWith("0")?"1":"0")),null);
    assert.deepEqual(resolveFile(code),resolveFile("PH "+code));
  }
  for(const bad of ["../coffee","145",null,"7AAAAAA","<script>","1000007"])assert.equal(parseCode(bad),null);
  assert.throws(()=>wireCode("no-file",0));assert.throws(()=>wireCode("citrus",36**5));
});
test("3,600 sealed variants reconcile to an independent integer calculation and contain no impossible tallies",()=>{
  for(const base of CASEBOOK){
    const riders=new Set(),amounts=new Set();
    for(let i=0;i<600;i++){
      const f=resolveFile(wireCode(base.id,(7919*i+1117)%(36**5)));riders.add(f.rider);
      let expected=0n;
      for(const l of f.lots){
        assert.ok(l.loaded>=l.held+l.missing&&l.held>=0&&l.missing>=0);
        if(!f.policy.covered.includes(l.cause))continue;
        const surrender=Math.max(0,Math.min(l.declared,l.invoice)-l.salvage);
        const unit=l.repair>0?Math.min(surrender,l.repair):surrender;
        expected+=BigInt(unit*100*(l.missing+l.held));
      }
      const balance=expected-BigInt((f.policy.credit+f.policy.deductible)*100);
      const shared=balance>0?(balance*BigInt(f.policy.share)+50n)/100n:0n;
      const net=Number(shared<BigInt(f.policy.cap*100)?shared:BigInt(f.policy.cap*100));
      const result=settlement(f,entitlements(f));assert.equal(result.payable,net);amounts.add(net);
      for(const doc of documents(f))for(const line of doc.lines)assert.doesNotMatch(line.text,/undefined|NaN|\{(held|missing|credit)/);
    }
    assert.equal(riders.size,2);assert.ok(amounts.size>12);
  }
});
function* permutations(items,chosen=[]){
  if(!items.length)yield chosen;
  else for(const [i,item] of items.entries())yield*permutations(items.filter((_,index)=>index!==i),[...chosen,item]);
}
test("each of 720 filing orders preserves the six-file closing reserve for all three treaties",()=>{
  const receipts=CASEBOOK.map(b=>{const f=resolveFile(b.id);return {id:b.id,draft:perfect(f)};});
  for(const entries of permutations(receipts)){
    const s=newOffice();s.rulings=entries;
    for(const [t,closing] of Object.entries({own:477500,excess:489875,quota:536668})){
      s.treaty=t;const b=ledger(s);
      assert.equal(b.complete,true);assert.equal(b.perfect,6);assert.equal(b.closing,closing);
      assert.equal(b.cash+b.pendingIn-b.pendingOut,closing);
      s.lastMail=entries.at(-1).id;assert.equal(ledger(s).cash,closing);s.lastMail="";
    }
  }
});
test("every case, exhibit position, leaf, receipt, alternate wording and bound edition renders",()=>{
  const s=newOffice();
  assert.match(cover(s),/Open the first file/);assert.match(guide(),/deductible/i);assert.match(caseIndex(s),/Wireless sets/);
  for(const b of CASEBOOK)for(const f of [resolveFile(b.id),resolveFile(wireCode(b.id,35267))]){
    const d=perfect(f),x=exhibit(f);
    assert.equal(x.choices.length,3);assert.equal(x.readings.length,3);
    for(let i=0;i<3;i++){
      const html=apparatus(f,d,{index:i,used:true});
      assert.ok(html.includes(x.readings[i]));assert.ok(html.includes('exhibit.'+i));assert.doesNotMatch(html,/NaN|undefined/);
    }
    const allIds=new Set(documents(f).flatMap(doc=>doc.lines.map(line=>line.id)));
    for(const group of PROOF[f.baseId].groups)assert.ok(group.every(id=>allIds.has(id)));
    for(const doc of documents(f)){assert.ok(caseRoom(s,f,"evidence",doc.id).includes(doc.heading));}
    assert.match(caseRoom(s,f,"ruling"),/Review &amp; stamp/);
    assert.match(caseRoom(s,f,"table"),/Square the sheets/);
    fileRuling(s,f,d);
    assert.match(caseRoom(s,f,"receipt"),/The filed ruling/);
    assert.match(caseRoom(s,f,"receipt","exhibit",true),/Other wording/);
    if(f.wire)assert.match(wireRoom(s,f),new RegExp(f.id));
  }
  assert.match(cover(s),/Read the closing book/);assert.match(ledgerRoom(s),/closing edition/);
  assert.equal((gazette(s).match(/<article>/g)||[]).length,6);assert.match(gazette(s),/A clean book/);
});
test("the currency printer distinguishes whole pounds from penny balances",()=>{
  assert.deepEqual([money(0),money(1200),money(1230),money(-5)],["£0","£12","£12.30","-£0.05"]);
});

