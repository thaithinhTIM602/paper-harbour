import { CASEBOOK } from "./cases.mjs";
import { resolveFile, newOffice, readOffice, normalDraft, allowedToFile, fileRuling, wireCode, parseCode, documents, money, settlement, ledger, TREATIES, disputed, readReturn } from "./office.mjs";
import { cover, caseIndex, guide, filed, path, marker, chartDocket, photograph, selectedFile, folio } from "./press.mjs";
import { caseRoom, comparisons, valuation } from "./desk.mjs";
import { ledgerRoom, wireRoom, gazette } from "./rooms.mjs";

import { installMagnifier } from "./magnifier.mjs";
import { BERTHS, dispatchAcross } from "./chart.mjs";
import { crewPanel } from "./spool.mjs";
import { returnRoom } from "./post.mjs";

const KEY="paper-harbour.office.v1",SOUND="paper-harbour.sounds";
const main=document.querySelector("#main-desk"),dialog=document.querySelector("#office-dialog");
installMagnifier(dialog);
let state=newOffice(), durable=true, sound=false, queue=Promise.resolve(), audio=null, messageTimer, pendingImport=null;
try{state=readOffice(localStorage.getItem(KEY));sound=localStorage.getItem(SOUND)==="on";}catch{durable=false;}
let view={},lastAddress="",trial=false, instrument={index:0,used:false};
function currentState(){
  if(durable){try{return readOffice(localStorage.getItem(KEY));}catch{durable=false;}}
  return state;
}
function persist(s){
  state=s;
  if(durable){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{durable=false;notice("This browser could not save the desk. A desk copy is available in the ledger.");}}
}
function update(change,redraw=true){
  const run=async()=>{
    const work=()=>{
      const s=currentState();change(s);persist(s);
      if(redraw)render(false);
    };
    if(navigator.locks?.request)await navigator.locks.request(KEY,work);
    else work();
  };
  queue=queue.then(run,run).catch(()=>notice("The desk could not complete that change. Try again."));
  return queue;
}
function notice(text){
  const n=document.querySelector("#announcement");
  clearTimeout(messageTimer);n.textContent=text;
  messageTimer=setTimeout(()=>{n.textContent="";},4200);
}
function here(){
  const raw=location.hash.slice(1)||"cover";
  const [room,id,step,doc]=raw.split("/");
  if(room==="cover")return {room,berth:Object.hasOwn(BERTHS,id)?id:null};
  if(room==="file"){
    const file=resolveFile(id);
    if(!file)return {room:"missing"};
    return {room,file,step:["table","evidence","ruling","receipt"].includes(step)?step:"table",doc:doc||"exhibit"};
  }
  if(room==="return")return {room,code:id,token:step};
  if(room==="wire")return {room,packet:id?resolveFile(id):null,bad:Boolean(id&&!parseCode(id))};
  return {room:["cover","register","ledger","guide","gazette"].includes(room)?room:"missing"};
}
function grabFocus(){
  const el=document.activeElement;
  if(!el||!main.contains(el))return null;
  for(const attr of ["id","data-mark","data-action","href","name"]){
    const val=el.getAttribute(attr);
    if(val){let s=`[${attr}="${CSS.escape(val)}"]`;if(el.dataset.value)s+=`[data-value="${CSS.escape(el.dataset.value)}"]`;if(el.type==="radio")s+=`[value="${CSS.escape(el.value)}"]`;return s;}
  }
  return null;
}
function deskCopies(){
  return `<details class="terms desk-copies"><summary>Desk copies and a fresh book</summary><p>Carry your progress to another browser with a desk copy. It includes all rulings, draft evidence, wire cases and treaty terms.</p>
    <div class="stage-actions"><button class="flat-button" data-action="export">Download desk copy</button><label class="flat-button import-control">Open a desk copy<input id="import-desk" type="file" accept="application/json,.json"></label><button class="underlink" data-action="reset-prompt">Start a fresh book</button></div></details>`;
}
function render(moving=true){
  const v=here(),old=view, focus=!moving?grabFocus():null,oldAddress=lastAddress;
  if(location.hash!==oldAddress){trial=false;instrument={index:0,used:false};}
  lastAddress=location.hash;view=v;
  let html,title;
  switch(v.room){
    case "cover":html=cover(state,v.berth);title="Night Shift";break;
    case "register":html=caseIndex(state);title="Case register";break;
    case "guide":html=guide();title="Field guide";break;
    case "ledger":html=ledgerRoom(state)+`<div class="wrap">${deskCopies()}</div>`;title="Office ledger";break;
    case "gazette":html=gazette(state);title=ledger(state).complete?"The Shipping Gazette":"Office ledger";break;
    case "wire":html=wireRoom(state,v.packet?.wire?v.packet:null,v.bad?"That address does not contain a valid wire code. Check the printed code.":"");title="Station comms";break;
    case "return":html=returnRoom(state,v.code,v.token);title="Return cable";break;
    case "file":html=caseRoom(state,v.file,v.step,v.doc,trial,instrument);title=v.file.title;break;
    default:html='<section class="wrap room"><h1>That file is missing.</h1><p>Return to the register to pull a summer claim.</p><a class="primary" href="#register">Open the register →</a></section>';title="File not found";
  }
  main.dataset.room=v.room;main.innerHTML=html;
  document.title=`${title} · Paper Harbour`;
  for(const link of document.querySelectorAll(".mast nav a, .manual-link")){
    const selected=link.hash===`#${v.room}`||(v.room==="file"&&link.hash===(v.file.wire?"#wire":"#register"))||(v.room==="gazette"&&link.hash==="#ledger");
    if(selected)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
  }
  const soundButton=document.querySelector("#sound-toggle");soundButton.setAttribute("aria-pressed",String(sound));soundButton.textContent=`Station audio ${sound?"on":"off"}`;
  const share=document.querySelector("#wire-url");if(share)share.value=wireURL(v.packet.id);
  const returnAddress=document.querySelector("#return-address");
  if(returnAddress){const u=new URL(location.href);u.hash=`return/${v.file.id}/${returnAddress.dataset.returnToken}`;returnAddress.value=u.href;}
  if(focus)main.querySelector(focus)?.focus({preventScroll:true});
  const sameTray=moving&&old.file?.id&&old.file.id===v.file?.id&&old.step==="evidence"&&v.step==="evidence";
  if(sameTray)main.querySelector('.document-tabs [aria-current]')?.focus({preventScroll:true});
  else if(moving){window.scrollTo({top:0,behavior:"instant"});main.focus({preventScroll:true});}
}
function wireURL(code){const u=new URL(location.href);u.hash=`wire/${code}`;return u.href;}
function aclick(kind){
  if(!sound)return;
  try{
    audio||=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==="suspended")audio.resume().catch(()=>{});
    const t=audio.currentTime,osc=audio.createOscillator(),vol=audio.createGain();
    const low=kind==="stamp";osc.type=low?"triangle":"sine";osc.frequency.setValueAtTime(low?150:kind==="radio"?392:660,t);osc.frequency.exponentialRampToValueAtTime(low?48:kind==="radio"?587:460,t+0.065);
    vol.gain.setValueAtTime(low?0.09:0.035,t);vol.gain.exponentialRampToValueAtTime(0.0001,t+0.085);osc.connect(vol);vol.connect(audio.destination);osc.start(t);osc.stop(t+0.09);
  }catch{}
}
function editDraft(file,callback,redraw=true){
  return update(s=>{
    if(filed(s,file.id))return;
    const d=normalDraft(file,s.drafts[file.id]);callback(d);s.drafts[file.id]=normalDraft(file,d);
    if(file.wire&&!s.loose.includes(file.id))s.loose.push(file.id);
  },redraw);
}
function toggle(list,val){if(list.includes(val))list.splice(list.indexOf(val),1);else list.push(val);}
function setDialog(title,body,action,label){
  dialog.innerHTML=`<div class="dialog-paper"><p class="eyeline">Tide Mutual · Clerk’s desk</p><h2 id="dialog-title">${title}</h2>${body}<div class="stage-actions"><button data-action="${action}" class="stamp-button">${label}</button><button class="underlink" data-action="close-dialog">Go back</button></div></div>`;
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('[data-action="close-dialog"]').focus();
}
function registration(offset){
  const f=view.file,slider=document.querySelector("#register-offset");
  if(!f||!slider)return;
  const d=normalDraft(f,state.drafts[f.id]);d.offset=offset;slider.value=String(offset);
  slider.setAttribute("aria-valuetext",offset===0?"Aligned":`${Math.abs(offset)} marks away`);
  const frame=document.querySelector(".table-frame");frame.dataset.aligned=String(offset===0);
  for(const row of frame.querySelectorAll(".mark-row"))row.disabled=offset!==0;
  document.querySelector("#register-chart").style.setProperty("--shift",`${offset*14}px`);
  document.querySelector("#register-status").textContent=offset===0?"Crosses aligned":"Crosses apart";
  document.querySelector("#compare-notes").innerHTML=comparisons(f,d,offset===0,false);
}
function selectBerth(id){
  if(view.room!=="cover"||!Object.hasOwn(BERTHS,id))return;
  const file=resolveFile(id);
  const previous=main.querySelector(".berth-point[aria-pressed=true]")?.dataset.value;
  for(const pin of main.querySelectorAll(".berth-point"))pin.setAttribute("aria-pressed",String(pin.dataset.value===id));
  dispatchAcross(main.querySelector(".station-plan"),previous,id);
  document.querySelector("#bay-readout").textContent=`Bay ${folio(file.number)} / 06`;
  document.querySelector("#chart-docket").innerHTML=chartDocket(state,file);
  history.replaceState(null,"",`#cover/${id}`);view=here();lastAddress=location.hash;
  aclick("click");
}
document.addEventListener("keydown",e=>{
  const current=e.target.closest(".berth-point");
  if(!current)return;
  const points=[...main.querySelectorAll(".berth-point")],i=points.indexOf(current);
  const next={ArrowRight:(i+1)%points.length,ArrowDown:(i+1)%points.length,ArrowLeft:(i+points.length-1)%points.length,ArrowUp:(i+points.length-1)%points.length,Home:0,End:points.length-1}[e.key];
  if(next===undefined)return;
  e.preventDefault();points[next].focus({preventScroll:true});selectBerth(points[next].dataset.value);
});
function showCrew(file,step,detail=false){
  if(!file)return;
  const closed=filed(state,file.id);
  dialog.classList.add("crew-dialog");dialog.dataset.crewFile=file.id;dialog.dataset.crewStep=step;
  dialog.innerHTML=crewPanel(file,step,closed?.draft||state.drafts[file.id],Boolean(closed),detail);
  aclick("radio");
  if(!dialog.open){
    dialog.showModal();
    dialog.querySelector('[data-action="close-dialog"]').focus();
  }else{
    dialog.querySelector('[data-action="spool-more"]').focus({preventScroll:true});
  }
}
dialog.addEventListener("close",()=>{
  if(dialog.open)return;
  dialog.classList.remove("photo-dialog","crew-dialog");
  delete dialog.dataset.photo;delete dialog.dataset.crewFile;delete dialog.dataset.crewStep;
});
let grip=null;
document.addEventListener("pointerdown",e=>{
  const el=e.target.closest(".sheet-grip, .table-frame[data-adjustable=true] .sheet-front");if(!el||e.button!==0||!e.isPrimary)return;
  const slider=document.querySelector("#register-offset");
  grip={id:e.pointerId,el,y:e.clientY,start:Number(slider.value),moved:false};
  el.classList.add("moving-sheet");
  el.setPointerCapture(e.pointerId);
});
document.addEventListener("pointermove",e=>{
  if(!grip||e.pointerId!==grip.id)return;
  const change=Math.round((e.clientY-grip.y)/14);
  if(change)grip.moved=true;
  if(grip.moved)registration(Math.max(-3,Math.min(3,grip.start+change)));
});
function endGrip(e){
  if(!grip||grip.id!==e.pointerId)return;
  const el=grip.el;el.classList.remove("moving-sheet");
  if(e.type==="pointercancel"){registration(grip.start);grip=null;return;}
  if(grip.moved){
    el.dataset.dragged="1";const n=Number(document.querySelector("#register-offset").value);
    editDraft(view.file,d=>d.offset=n,false);
    setTimeout(()=>{delete el.dataset.dragged;},350);
  }
  grip=null;
}
document.addEventListener("pointerup",endGrip);
document.addEventListener("pointercancel",endGrip);

document.addEventListener("input",e=>{
  const el=e.target;
  if(el.id==="register-offset"){registration(Number(el.value));return;}
  if(!el.matches("input.count")||!view.file)return;
  const f=view.file,mark=el.dataset.mark,lot=f.lots.find(l=>l.mark===mark);
  if(!lot)return;
  const n=el.valueAsNumber,qty=Number.isInteger(n)?Math.min(disputed(lot),Math.max(0,n)):0;
  if(el.value!==""&&el.value!==String(qty))el.value=String(qty);
  const counts=Object.fromEntries([...main.querySelectorAll("input.count")].map(input=>[input.dataset.mark,Number(input.value)||0]));
  document.querySelector("#ruling-totals").innerHTML=valuation(f,{counts});
  editDraft(f,d=>d.counts[mark]=qty,false);
});
document.addEventListener("change",async e=>{
  const el=e.target;
  if(el.id==="register-offset"){const value=Number(el.value);await editDraft(view.file,d=>d.offset=value,false);return;}
  if(el.matches("input.count")&&el.value===""){el.value="0";return;}
  if(el.name==="treaty"){const key=el.value;await update(s=>{if(!ledger(s).rows.length&&Object.hasOwn(TREATIES,key))s.treaty=key;});aclick("click");return;}
  if(el.id==="import-desk"&&el.files?.length){
    const file=el.files[0];el.value="";
    try{
      if(file.size>4_000_000)throw new Error();
      const input=JSON.parse(await file.text());
      if(input.format!=="paper-harbour-desk"||input.desk?.version!==1||!Array.isArray(input.desk.rulings)||!input.desk.drafts||typeof input.desk.drafts!=="object")throw new Error();
      pendingImport=readOffice(input.desk);
      setDialog("Open this desk copy?",`<p>This copy contains ${pendingImport.rulings.length} filed rulings. It will replace the book currently on this device. Download the current book first if you want to keep both.</p>`,"import-confirm","Open this copy");
    }catch{notice("That file could not be read as a Paper Harbour desk copy.");}
  }
});
document.addEventListener("submit",e=>{
  if(e.target.id!=="receive-wire")return;
  e.preventDefault();const parsed=parseCode(document.querySelector("#wire-input").value);
  if(!parsed){document.querySelector("#wire-error").textContent="That code does not balance. Check all seven letters and digits.";return;}
  location.hash=`wire/${parsed.code}`;
});
document.addEventListener("click",async e=>{
  if(e.target.closest(".skip")){e.preventDefault();main.focus();main.scrollIntoView();return;}
  const btn=e.target.closest("[data-action]");if(!btn)return;
  const action=btn.dataset.action,value=btn.dataset.value;
  if(action==="grip"&&btn.dataset.dragged)return;
  if(action==="leave-crew"){if(dialog.open)dialog.close();return;}
  await queue;
  const f=view.file,d=f?normalDraft(f,state.drafts[f.id]):null;
  switch(action){
    case "floor":case "berth":selectBerth(value);break;
    case "cycle-bay":{
      const pins=[...main.querySelectorAll(".berth-point")];
      if(!pins.length)break;
      const current=pins.findIndex(p=>p.getAttribute("aria-pressed")==="true");
      selectBerth(pins[(current+(value==="previous"?-1:1)+pins.length)%pins.length].dataset.value);break;}
    case "ask-spool":{
      const file=f||(view.room==="cover"?selectedFile(state,view.berth):null);
      showCrew(file,view.step||"deck");break;}
    case "spool-more":{
      if(dialog.open&&dialog.dataset.crewFile)showCrew(resolveFile(dialog.dataset.crewFile),dialog.dataset.crewStep,value==="detail");
      break;}
    case "photograph":{
      const file=value==="archive"?null:resolveFile(value);
      if(value!=="archive"&&!file)break;
      dialog.dataset.photo=value;dialog.classList.add("photo-dialog");
      dialog.innerHTML=photograph(file);dialog.showModal();dialog.querySelector('[data-action="close-dialog"]').focus();
      break;}
    case "flip-print":{
      const id=dialog.dataset.photo;
      if(!dialog.open||!id)break;
      const back=btn.getAttribute("aria-pressed")!=="true";
      dialog.innerHTML=photograph(id==="archive"?null:resolveFile(id),back);
      dialog.querySelector(".flip-print").focus({preventScroll:true});aclick("click");break;}
    case "square":case "grip":
      if(f){registration(0);await editDraft(f,x=>x.offset=0,false);aclick("click");notice("The manifest and tally are aligned.");}break;
    case "mark":case "printed-mark":
      if(f&&d.offset===0){await editDraft(f,x=>toggle(x.marks,value));aclick("click");}break;
    case "fact":
      if(f){await editDraft(f,x=>{
        if(!x.facts.includes(value)&&x.facts.length===4){notice("The clip holds four excerpts. Unclip one to make room.");return;}
        toggle(x.facts,value);
      });aclick("click");}break;
    case "review-ruling":
      if(!f)return;
      if(!allowedToFile(d)){
        const destination=!d.marks.length?"table":"evidence";
        const title=destination==="table"?"Clip a cargo comparison first":"Clip some written evidence first";
        setDialog(title,`<p>${destination==="table"?"Square the sheets and clip one disputed row.":"Open the evidence and clip a passage that supports your ruling."}</p>`,"go-missing","Open "+(destination==="table"?"light table":"evidence"));
        dialog.dataset.to=destination;return;
      }
      dialog.dataset.file=f.id;dialog.dataset.draft=JSON.stringify(d);
      setDialog("Put the ruling on record?",`<p>${marker(f)} · ${f.title}</p><div class="stamp-amount">${money(settlement(f,d.counts).payable)}</div>
        <p>${settlement(f,d.counts).payable?"This is the payment to the merchant.":"This stamp declines the claim."} Your signed figures enter ${f.wire?"the cable file":"the cash book"}. The audit follows.</p>`,"seal","Stamp and file");break;
    case "go-missing":dialog.close();if(f)location.hash=path(f,dialog.dataset.to);break;
    case "seal":{
      if(!f||dialog.dataset.file!==f.id)return;
      const signed=dialog.dataset.draft;let success=false;
      await update(s=>{
        const current=normalDraft(f,s.drafts[f.id]);
        if(JSON.stringify(current)===signed)success=fileRuling(s,f,current);
      },false);
      dialog.close();if(success||filed(state,f.id)){aclick("stamp");location.hash=path(f,"receipt");}else{render(false);notice("The draft changed in another tab. Review the current figures and stamp again.");}break;}
    case "close-dialog":dialog.close();break;
    case "instrument-choose":instrument={index:Number(value),used:false};render(false);break;
    case "instrument-use":instrument.used=true;aclick("click");render(false);break;
    case "trial":trial=value==="rider";render(false);break;
    case "generate":{
      const base=document.querySelector("#wire-type").value;
      const seed=crypto.getRandomValues(new Uint32Array(1))[0]%(36**5),code=wireCode(base,seed);
      await update(s=>{if(!s.loose.includes(code))s.loose.push(code);},false);
      aclick("click");location.hash=`wire/${code}`;break;}
    case "copy-wire":{
      if(!parseCode(value))return;
      try{await navigator.clipboard.writeText(wireURL(value));notice("The sealed dispatch link is copied.");}
      catch{const field=document.querySelector("#wire-url");field.focus();field.select();notice("The dispatch address is selected for copying.");}break;}
    case "copy-return":{
      const addr=document.querySelector("#return-address");if(!addr)break;
      try{await navigator.clipboard.writeText(addr.value);notice("The return slip is copied.");}
      catch{addr.focus();addr.select();notice("The return address is selected for copying.");}break;}
    case "keep-return":{
      const file=resolveFile(view.code),token=view.token;
      if(!readReturn(file,token))break;
      await update(s=>{
        const returns=s.returns[file.id]||[];
        if(!returns.includes(token))s.returns[file.id]=[...returns,token];
        if(!s.loose.includes(file.id))s.loose.push(file.id);
      },false);
      if(filed(state,file.id)){render(false);notice("The return slip is in your cable file.");}
      else location.hash=path(file);
      break;}
    case "post":
      await update(s=>{const book=ledger(s);if(book.hasMail)s.lastMail=book.rows.at(-1).id;});aclick("stamp");notice("The return post is entered in the ledger.");break;
    case "print":window.print();break;
    case "sound":
      sound=!sound;try{localStorage.setItem(SOUND,sound?"on":"off");}catch{}aclick("click");render(false);break;
    case "export":{
      const file=new Blob([JSON.stringify({format:"paper-harbour-desk",desk:currentState()},null,2)],{type:"application/json"});
      const url=URL.createObjectURL(file);const a=document.createElement("a");a.href=url;a.download="Paper_Harbour_Desk.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);break;}
    case "reset-prompt":
      setDialog("Start a fresh book?",`<p>This clears the summer book and cable files on this device. Download a desk copy from the ledger first to keep your rulings.</p>`,"reset-confirm","Start a fresh book");break;
    case "reset-confirm":await update(s=>Object.assign(s,newOffice()),false);dialog.close();location.hash="cover";break;
    case "import-confirm":
      if(pendingImport){await update(s=>Object.assign(s,pendingImport),false);pendingImport=null;dialog.close();render(false);notice("The desk copy is open.");}break;
  }
});
let printDetails=[];
window.addEventListener("beforeprint",()=>{printDetails=[...main.querySelectorAll("details:not([open])")];for(const el of printDetails)el.open=true;});
window.addEventListener("afterprint",()=>{for(const el of printDetails)el.open=false;printDetails=[];});
window.addEventListener("hashchange",()=>{if(dialog.open)dialog.close();render();});
window.addEventListener("storage",e=>{if(e.key===KEY){state=currentState();render(false);}});
render();
if(!durable)notice("Progress is held in this tab. Download a desk copy in the ledger to keep it.");

