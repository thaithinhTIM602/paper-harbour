import { resolveFile, money, audit, documents, makeReturn, readReturn } from "./office.mjs";
import { path, next, filed, marker, sectionTitle } from "./press.mjs";

export function returnDesk(state,f,d){
  if(!f.wire)return "";
  const token=makeReturn(f,d),saved=state.returns?.[f.id]||[];
  return `<section class="return-mail"><p class="eyeline">Reply cable</p><h3>Send your ruling back</h3>
    <p>The recipient can compare your quantities and evidence after filing their own ruling on this shipment.</p>
    <label class="visually-hidden" for="return-address">Return slip address</label><input id="return-address" class="share-url" type="url" readonly data-return-token="${token}">
    <button class="flat-button" data-action="copy-return">Copy return slip</button>
    ${saved.length?`<div class="received-slips">${saved.map((t,i)=>`<a class="underlink" href="#return/${f.id}/${t}">Compare received slip ${i+1} ${next}</a>`).join("")}</div>`:""}</section>`;
}
export function returnRoom(state,code,token){
  const f=resolveFile(code),other=readReturn(f,token);
  if(!other)return `<section class="wrap room">${sectionTitle("Undelivered cable","The return slip is incomplete")}<p class="room-intro">The printed figures do not balance. Use the complete address from the other adjuster.</p><a class="primary" href="#wire">Go to the wire room ${next}</a></section>`;
  const own=filed(state,f.id);
  if(!own)return `<section class="room wrap narrow-room">${sectionTitle("Incoming · Sealed return","A ruling in the post")}
    <div class="closed-mail"><p class="eyeline">${marker(f)}</p><h2>${f.title}</h2><p>Another adjuster has filed this shipment. Their figures stay folded until you sign yours.</p>
    <button class="primary" data-action="keep-return">Keep the slip and open my file ${next}</button></div></section>`;
  const mine=audit(f,own.draft),theirs=audit(f,other),docs=documents(f);
  const cites=d=>docs.flatMap(doc=>doc.lines.flatMap((l,i)=>d.facts.includes(l.id)?[`${doc.title} §${i+1}`]:[])).join(" · ");
  return `<section class="room wrap narrow-room">${sectionTitle("Unfolded return · "+marker(f),"Two rulings, one cargo")}
    <p class="room-intro">Both desks worked ${f.vessel}’s ${f.cargo.toLowerCase()} on the same written terms.</p>
    <div class="carbon-compare"><div class="receipt-amounts"><div><span>Your stamped payment</span><b>${money(mine.written.payable)}</b></div><div><span>Returned payment</span><b>${money(theirs.written.payable)}</b></div></div>
    <p>The policy owed <b>${money(mine.right.payable)}</b>.</p>
    <table class="record-table"><caption>Allowed cargo units on each signed slip</caption><thead><tr><th>Mark</th><th>Yours</th><th>Theirs</th><th>Audit</th></tr></thead><tbody>
    ${f.lots.map(l=>`<tr><th>${l.mark}</th><td>${own.draft.counts[l.mark]}</td><td>${other.counts[l.mark]}</td><td>${mine.truth[l.mark]}</td></tr>`).join("")}</tbody></table>
    <details class="terms"><summary>Compare the evidence clips</summary><p><b>Your desk.</b> ${own.draft.marks.join(", ")}. ${cites(own.draft)}.</p><p><b>Returned slip.</b> ${other.marks.join(", ")}. ${cites(other)}.</p></details></div>
    <div class="stage-actions"><a class="primary" href="${path(f,"receipt")}">Read my audit ${next}</a>
    ${(state.returns?.[f.id]||[]).includes(token)?"":'<button class="underlink" data-action="keep-return">Keep this return slip</button>'}</div></section>`;
}

