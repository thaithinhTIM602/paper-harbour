import { CASEBOOK, findBase } from "./cases.mjs";

import { exhibitDocument, PROOF } from "./exhibits.mjs";

export const OPENING_CASH = 850000;
export const TREATIES = {
  own:{name:"Own account", fee:0, description:"Keep each loss in the mutual. No fee and no recovery."},
  excess:{name:"Excess cover", fee:42000, description:"Pay £420 for the book. Recover 75% of the part of each audited claim above £600, up to £650 per file and £1,400 in total."},
  quota:{name:"One third share", fee:65000, description:"Pay £650 for the book. Recover one third of each audited claim, up to £1,900 across the book."}
};
const wholePounds = new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0});
const withPence = new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",minimumFractionDigits:2,maximumFractionDigits:2});
export const money = pence => (pence%100 ? withPence : wholePounds).format(pence / 100);
export const disputed = lot => lot.missing + lot.held;
export const claimed = file => file.lots.reduce((sum,lot)=>sum+100*lot.declared*disputed(lot),0);
const bounded = (n, max) => Number.isSafeInteger(n) ? Math.max(0,Math.min(max,n)) : 0;
const uniq = values => [...new Set(values)];
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function checksum(text) {
  let sum=7;
  for (const ch of text) sum=(sum*17+alphabet.indexOf(ch))%36;
  return alphabet[sum];
}
export function wireCode(baseId, seed) {
  const index=CASEBOOK.findIndex(f=>f.id===baseId);
  if(index<0 || !Number.isSafeInteger(seed) || seed<0 || seed>=36**5) throw new RangeError("Invalid wire");
  const body=String(index+1)+seed.toString(36).toUpperCase().padStart(5,"0");
  return body+checksum(body);
}
export function parseCode(raw) {
  const code=String(raw??"").trim().toUpperCase().replace(/^PH[\s-]{0,}/,"").replace(/[\s-]/g,"");
  if(!/^[1-6][0-9A-Z]{6}$/.test(code)||checksum(code.slice(0,-1))!==code.at(-1)) return null;
  return {code,base:CASEBOOK[Number(code[0])-1],seed:parseInt(code.slice(1,6),36)};
}
function random(seed) {
  let state=seed>>>0;
  return n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);};
}
export function resolveFile(id) {
  const base=findBase(id);
  if(base) return {...base,baseId:base.id,wire:false,number:CASEBOOK.indexOf(base)+1};
  const parsed=parseCode(id);
  if(!parsed) return null;
  const b=parsed.base, r=random(parsed.seed+CASEBOOK.indexOf(b)*8191);
  const rider=r(2)===1;
  const lots=b.lots.map(lot=>{
    const scale=q=>q ? Math.max(1,q + r(5)-2) : 0;
    const missing=scale(lot.missing),held=scale(lot.held);
    return {...lot,missing,held,loaded:Math.max(held+missing+1,lot.loaded+r(7)-2),
      invoice:Math.max(1,lot.invoice+5*(r(9)-4)),declared:Math.max(1,lot.declared+5*(r(7)-3)),
      salvage:lot.salvage?Math.max(1,lot.salvage+r(9)-4):0,repair:lot.repair?lot.repair+5*(r(9)-4):0};
  });
  const policy={...b.policy,covered:rider?b.policy.alternate:b.policy.covered,wording:rider?b.policy.rider:b.policy.wording,
    deductible:25+25*r(7),share:[75,80,90,100][r(4)],cap:Math.max(250,b.policy.cap+100*(r(9)-4)),
    credit:b.policy.credit?450+50*r(8):0};
  return {...b,id:parsed.code,baseId:b.id,number:CASEBOOK.indexOf(b)+1,wire:true,rider,lots,policy,lead:b.question,date:"By wire"};
}
export function expand(file, str) {
  return str.replace(/\{(held|missing)(\d)\}|\{credit\}/g,(full,field,index)=>
    full==="{credit}"?money(file.policy.credit*100):String(file.lots[Number(index)][field]));
}
export function documents(file) {
  const signed=(id,parts)=>({id,title:parts[0],by:parts[1],heading:parts[2],lines:parts.slice(3).map((txt,i)=>({id:`${id}.${i}`,text:expand(file,txt)}))});
  const p=file.policy;
  return [exhibitDocument(file),signed("survey",file.survey),signed("log",file.log),
    {id:"policy",title:"Policy slip",by:"Tide Mutual, underwriting room",heading:"Terms for this voyage",lines:[
      {id:"policy.cover",text:p.wording},
      {id:"policy.value",text:"For each unit take the lower of invoice and declared value, less what the remains will sell for. If a certified repair costs less, use the repair alone."},
      {id:"policy.share",text:`Credit prior contributions first. Leave the first ${money(100*p.deductible)} with the owner. The mutual pays ${p.share}% of the rest, up to ${money(100*p.cap)} for this file.`}]},
    {id:"account",title:"Valuation sheet",by:"Signed by the merchant and the dock valuer",heading:"Agreed unit prices",lines:[
      {id:"account.values",text:"The invoice, declared value and binding scrap bid below are per unit. A blank repair column means no certified repair was offered."}]}];
}
export function unitLoss(lot) {
  const value=100*Math.min(lot.invoice,lot.declared),salvage=100*lot.salvage;
  const replacement=Math.max(0,value-salvage);
  const useRepair=lot.repair>0 && 100*lot.repair<replacement;
  return {value,salvage,replacement,amount:useRepair?100*lot.repair:replacement,method:useRepair?"repair":"replacement"};
}
export function settlement(file,counts={}) {
  const lines=file.lots.map(lot=>{
    const count=bounded(counts[lot.mark],disputed(lot)),basis=unitLoss(lot);
    return {mark:lot.mark,count,basis,loss:count*basis.amount};
  });
  const total=lines.reduce((sum,line)=>sum+line.loss,0);
  const credit=Math.min(total,file.policy.credit*100);
  const deductible=Math.min(total-credit,file.policy.deductible*100);
  const shared=Math.round((total-credit-deductible)*file.policy.share/100);
  const payable=Math.min(shared,file.policy.cap*100);
  return {lines,total,credit,deductible,shared,payable,capped:shared-payable};
}
export function entitlements(file) {
  return Object.fromEntries(file.lots.map(l=>[l.mark,file.policy.covered.includes(l.cause)?disputed(l):0]));
}
export const emptyDraft=()=>({offset:2,marks:[],facts:[],counts:{}});
export function normalDraft(file,input) {
  const d=input&&typeof input==="object"?input:{}, defaults=emptyDraft();
  const allowed=new Set(documents(file).flatMap(doc=>doc.lines.map(line=>line.id)));
  const marks=Array.isArray(d.marks)?d.marks:[], facts=Array.isArray(d.facts)?d.facts:[];
  return {
    offset:Number.isInteger(d.offset)?Math.min(3,Math.max(-3,d.offset)):defaults.offset,
    marks:uniq(marks.filter(m=>file.lots.some(l=>l.mark===m))),
    facts:uniq(facts.filter(f=>allowed.has(f))).slice(0,4),
    counts:Object.fromEntries(file.lots.map(l=>[l.mark,bounded(d.counts?.[l.mark],disputed(l))]))
  };
}
export function audit(file,draft) {
  const d=normalDraft(file,draft),truth=entitlements(file),written=settlement(file,d.counts),right=settlement(file,truth);
  const proof=PROOF[file.baseId||file.id];
  const checks=[
    {name:"Cargo quantities",ok:file.lots.every(l=>d.counts[l.mark]===truth[l.mark]),detail:"Allow the evidenced units only on the marks the slip covers."},
    {name:"Cargo comparison",ok:file.lots.filter(l=>disputed(l)>0).every(l=>d.marks.includes(l.mark)),detail:"Clip the tally comparison for every disputed cargo mark."},
    {name:"Cause of loss",ok:proof.groups.every(group=>group.some(id=>d.facts.includes(id))),detail:proof.detail},
    {name:"Policy wording",ok:d.facts.includes("policy.cover"),detail:"Attach the coverage wording that decides this voyage."}
  ];
  const difference=written.payable-right.payable;
  const appeal=Math.max(0,-difference),excess=Math.max(0,difference);
  const review=checks.slice(1).some(c=>!c.ok)?2000:0;
  const delayFee=appeal?4500:0;
  return {written,right,truth,checks,appeal,excess,review,delayFee,perfect:checks.every(c=>c.ok)&&difference===0};
}
export function allowedToFile(draft) {return draft.marks.length>=1&&draft.facts.length>=1;}
export function newOffice(){return {version:1,treaty:"own",drafts:{},rulings:[],lastMail:"",loose:[],returns:{}};}
export function readOffice(raw) {
  let value;
  try{value=typeof raw==="string"?JSON.parse(raw):raw;}catch{return newOffice();}
  if(!value||value.version!==1) return newOffice();
  const s=newOffice();if(Object.hasOwn(TREATIES,value.treaty))s.treaty=value.treaty;
  if(Array.isArray(value.loose))s.loose=uniq(value.loose.map(id=>parseCode(id)?.code).filter(Boolean));
  for(const [id,d] of Object.entries(value.drafts??{})){const f=resolveFile(id);if(f)s.drafts[f.id]=normalDraft(f,d);}
  if(Array.isArray(value.rulings))for(const entry of value.rulings){
    const f=resolveFile(entry?.id);
    if(!f||s.rulings.some(r=>r.id===f.id))continue;
    const draft=normalDraft(f,entry.draft);
    if(allowedToFile(draft))s.rulings.push({id:f.id,draft});
  }
  for(const [code,tokens] of Object.entries(value.returns??{})){
    const file=resolveFile(code);if(!file?.wire||!Array.isArray(tokens))continue;
    const valid=uniq(tokens.filter(t=>readReturn(file,t)));
    if(valid.length)s.returns[file.id]=valid;
  }
  s.lastMail=typeof value.lastMail==="string"?value.lastMail:"";
  return s;
}
export function fileRuling(state,file,draft) {
  const d=normalDraft(file,draft);
  if(state.rulings.some(e=>e.id===file.id)||!allowedToFile(d))return false;
  state.rulings.push({id:file.id,draft:d});state.drafts[file.id]=d;
  if(file.wire&&!state.loose.includes(file.id))state.loose.push(file.id);
  return true;
}
export function treatyRecovery(name,correct,booked) {
  if(name==="quota")return Math.max(0,Math.min(Math.round(correct/3),190000-booked));
  if(name==="excess")return Math.max(0,Math.min(Math.round(Math.max(0,correct-60000)*0.75),65000,140000-booked));
  return 0;
}
export function ledger(state) {
  const entries=state.rulings.filter(e=>findBase(e.id));
  const fee=TREATIES[state.treaty].fee;
  let cash=OPENING_CASH-fee, credits=0,pendingIn=0,pendingOut=0;
  const rows=entries.map((entry,index)=>{
    const f=resolveFile(entry.id),a=audit(f,entry.draft);
    const reimbursement=treatyRecovery(state.treaty,a.right.payable,credits);credits+=reimbursement;
    const outgoing=a.appeal+a.review+a.delayFee, posted=index<entries.length-1||state.lastMail===entry.id;
    cash-=a.written.payable;
    if(posted)cash+=reimbursement-outgoing;
    else{pendingIn+=reimbursement;pendingOut+=outgoing;}
    return {id:f.id,title:f.title,write:a.written.payable,correct:a.right.payable,appeal:a.appeal,overpay:a.excess,fees:a.review+a.delayFee,reimbursement,posted,perfect:a.perfect};
  });
  return {rows,fee,cash,credits,pendingIn,pendingOut,closing:cash+pendingIn-pendingOut,hasMail:rows.some(r=>!r.posted&&(r.reimbursement||r.appeal||r.fees)),
    complete:rows.length===CASEBOOK.length,perfect:rows.filter(r=>r.perfect).length};
}


// Version A preserves this field order in every shareable return address.
const returnFacts=["exhibit.0","exhibit.1","exhibit.2","survey.0","survey.1","survey.2","log.0","log.1","log.2","policy.cover","policy.value","policy.share","account.values"];
const digits=(n,width)=>n.toString(36).toUpperCase().padStart(width,"0");
const mask=(basis,selected)=>basis.reduce((total,key,i)=>selected.includes(key)?total+2**i:total,0);
export function makeReturn(file,input){
  if(!file?.wire)return null;
  const draft=normalDraft(file,input);
  if(!allowedToFile(draft))return null;
  const marks=file.lots.map(l=>l.mark);
  const body="A"+marks.map(m=>digits(draft.counts[m],2)).join("")+
    digits(mask(marks,draft.marks),1)+digits(mask(returnFacts,draft.facts),3);
  return body+checksum(file.id+body);
}
export function readReturn(file,token){
  if(!file?.wire||typeof token!=="string"||!/^A[0-9A-Z]{11}$/.test(token))return null;
  if(token.at(-1)!==checksum(file.id+token.slice(0,-1)))return null;
  const counts={},marks=[],factMask=parseInt(token.slice(8,11),36),markMask=parseInt(token[7],36);
  if(markMask>7||factMask>=2**returnFacts.length)return null;
  for(const [i,lot] of file.lots.entries()){
    const count=parseInt(token.slice(1+i*2,3+i*2),36);
    if(count>disputed(lot))return null;counts[lot.mark]=count;
    if(markMask&(1<<i))marks.push(lot.mark);
  }
  const facts=returnFacts.filter((_,i)=>factMask&(1<<i));
  if(!marks.length||!facts.length||facts.length>4)return null;
  return {offset:0,marks,facts,counts};
}
