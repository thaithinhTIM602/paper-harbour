import { CASEBOOK } from "./cases.mjs";
import { money, claimed, disputed, documents, normalDraft, settlement, unitLoss, audit, allowedToFile, entitlements } from "./office.mjs";
import { marker, path, next, pair, imagePlate, filed, folio } from "./press.mjs";

import { returnDesk } from "./post.mjs";
import { apparatus } from "./exhibits.mjs";

const leaves=[["table","Light table"],["evidence","Evidence"],["ruling","Ruling"]];
export function caseRoom(state,file,step,docId="exhibit",whatIf=false,setting={}) {
  const entry=filed(state,file.id);
  const draft=normalDraft(file,entry?.draft||state.drafts[file.id]);
  if(entry && !["table","evidence"].includes(step))step="receipt";
  if(!entry && step==="receipt")step="ruling";
  const label={table:"Light table",evidence:"Evidence",ruling:"Ruling",receipt:"Filed ruling"}[step];
  const href=file.wire?"#wire":"#register";
  const nav=leaves.map(([id,title],i)=>{
    const target=id==="ruling"&&entry?"receipt":id;
    return `<a href="${path(file,target)}" ${step===target?'aria-current="step"':""}><span>${["I","II","III"][i]}</span>${id==="ruling"&&entry?"Filed ruling":title}</a>`;
  }).join("");
  let body;
  if(step==="receipt")body=receipt(state,file,entry,whatIf);
  else if(step==="evidence")body=evidence(file,draft,docId,Boolean(entry),setting);
  else if(step==="ruling")body=ruling(file,draft);
  else body=lightTable(file,draft,Boolean(entry));
  return `<section class="case-room wrap" aria-label="${label}">
    <a class="backlink" href="${href}">← ${file.wire?"Wire room":"Case register"}</a>
    <div class="file-heading"><div><p class="eyeline">${marker(file)} · ${file.vessel}</p><h1>${file.title}</h1></div>
      <div class="folder-tag"><span>${file.claimant}</span><b>${file.berth}</b></div></div>
    <nav class="file-tabs" aria-label="File sections">${nav}</nav>
    ${body}</section>`;
}
function jacket(f,d){
  return `<aside class="jacket"><p class="eyeline">From the case jacket</p>${imagePlate(f)}
    <h3>The merchant’s letter</h3><p>${f.note}</p><dl>${pair("Filed by",f.claimant)}${pair("Claim presented",money(claimed(f)))}${pair("Sailed from",f.origin)}</dl>
    <p class="jacket-question">${f.question}</p></aside>`;
}
function lightTable(f,d,locked){
  const offset=locked?0:d.offset, aligned=offset===0;
  return `<div class="workspread"><section class="workarea">
    <div class="work-title"><p class="eyeline">Comparison of original records</p><h2>The light table</h2>
    <p>Line up the red and blue crosses. Compare the cargo marks, then clip the rows you need.</p></div>
    <div class="table-frame">
      <div class="instrument-head"><span>Departure manifest</span><span>Quay tally</span></div>
      <div class="register-chart" id="register-chart" style="--shift:${offset*14}px">
        <div class="sheet-back"><div class="chart-label"><span>Cargo mark</span><span>Loaded</span></div>
          ${f.lots.map(l=>`<div class="record-row"><b>${l.mark}</b><span>${l.loaded}</span></div>`).join("")}
        </div>
        <div class="cross back-cross" aria-hidden="true">⊕</div>
        <div class="sheet-front"><div class="chart-label"><span>Mark</span><span>Landed</span><span>Held</span></div>
          ${f.lots.map(l=>`<div class="record-row"><b>${l.mark}</b><span>${l.loaded-l.missing}</span><span>${l.held}</span></div>`).join("")}
          <div class="cross front-cross" aria-hidden="true">⊕</div>
        </div>
      </div>
      ${!locked?`<div class="alignment-tools"><div class="slider-line"><label for="register-offset">Sheet position</label><input type="range" id="register-offset" min="-3" max="3" step="1" value="${offset}" aria-valuetext="${aligned?"Aligned":Math.abs(offset)+" marks away"}">
        <button class="square-button" data-action="square">Square the sheets</button></div>
        <div class="alignment-note"><button class="sheet-grip" type="button" data-action="grip" aria-label="Drag vertically to align the tally, or press to square it">↕ <span>Drag tally</span></button>
        <output id="register-status" for="register-offset">${aligned?"Crosses aligned":"Crosses apart"}</output></div></div>`:""}
    </div><p class="instrument-caption">Held units are included in the landed count. They are waiting for inspection.</p>
    <div id="compare-notes">${comparisons(f,d,aligned,locked)}</div>
    <a class="primary stage-next" href="${path(f,"evidence")}">Open the evidence ${next}</a>
    </section>${jacket(f,d)}</div>`;
}
export function comparisons(f,d,aligned,locked) {
  return `<div class="clip-head"><h3>Comparison slip</h3><span>${d.marks.length} clipped</span></div>
    ${aligned?`<div class="comparison-rows">${f.lots.map(l=>{
      const has=d.marks.includes(l.mark);
      return `<div class="comparison-row"><b>${l.mark}</b><span>${l.name}<small>${l.missing} short · ${l.held} held</small></span>
      ${locked?`<span class="clipped-status">${has?"Clipped":"Filed"}</span>`:`<button class="clip-button ${has?"clipped":""}" data-action="mark" data-value="${l.mark}" aria-pressed="${has}" aria-label="${has?"Unclip":"Clip"} comparison ${l.mark}">${has?"✓ Clipped":"+ Clip"}</button>`}</div>`;
    }).join("")}</div>`:`<p class="quiet-note">The rows can be clipped when the crosses meet.</p>`}`;
}
function valueTable(f){
  return `<div class="table-scroll"><table class="record-table"><caption>Values in pounds, per cargo unit</caption><thead><tr><th>Mark</th><th>Invoice</th><th>Declared</th><th>Scrap</th><th>Repair</th></tr></thead><tbody>
    ${f.lots.map(l=>`<tr><th>${l.mark}</th><td>${money(100*l.invoice)}</td><td>${money(100*l.declared)}</td><td>${money(100*l.salvage)}</td><td>${l.repair?money(100*l.repair):"None"}</td></tr>`).join("")}
  </tbody></table></div>`;
}
function clipInventory(f,d){
  let parts=[];
  d.marks.forEach(m=>parts.push(`<li><b>${m}</b> · Manifest and quay tally</li>`));
  documents(f).forEach(doc=>doc.lines.forEach((line,i)=>{if(d.facts.includes(line.id))parts.push(`<li><b>${doc.title} §${i+1}</b><br>${line.text}</li>`);}));
  return `<details class="terms clip-inventory"><summary>Read your clip <span>${parts.length} items</span></summary>${parts.length?`<ul>${parts.join("")}</ul>`:"<p>Clip a cargo row or an excerpt to keep it here.</p>"}</details>`;
}
function evidence(f,d,id,locked,setting){
  const docs=documents(f),current=docs.find(a=>a.id===id)||docs[0];
  return `<div class="workspread"><section class="workarea">
    <div class="work-title"><p class="eyeline">Enclosures to the claim</p><h2>The evidence tray</h2><p>Examine the physical exhibit or read the papers. Clip up to four findings, including the policy wording.</p></div>
    <nav class="document-tabs" aria-label="Evidence papers">${docs.map(doc=>`<a ${doc.id===current.id?'aria-current="page"':""} href="${path(f,"evidence")}/${doc.id}">${doc.title}</a>`).join("")}</nav>
    <article class="document-leaf"><div class="doc-livery"><span>${current.title}</span><span>${marker(f)}</span></div><h3>${current.heading}</h3><p class="signed">${current.by}</p>
    ${current.id==="account"?valueTable(f):""}
    ${current.id==="exhibit"?apparatus(f,d,setting,locked):`<div class="passages">${current.lines.map((line,i)=>{
      const pinned=d.facts.includes(line.id);
      return `<div class="passage ${pinned?"pinned":""}"><div><span class="section-sign">§${i+1}</span><p>${line.text}</p></div>
        ${locked?`<span class="clipped-status">${pinned?"✓ Clipped":""}</span>`:`<button class="clip-button ${pinned?"clipped":""}" aria-label="${pinned?"Unclip":"Clip"} ${current.title} passage ${i+1}" aria-pressed="${pinned}" data-action="fact" data-value="${line.id}">${pinned?"✓ Clipped":"+ Clip"}</button>`}</div>`;
    }).join("")}</div>`}</article>
    <div class="clip-counter">${d.facts.length} of 4 excerpts clipped</div>${clipInventory(f,d)}
    <a class="primary stage-next" href="${path(f,locked?"receipt":"ruling")}">${locked?"Read the filed ruling":"Write the ruling"} ${next}</a></section>${jacket(f,d)}</div>`;
}
function totals(f,calculation) {
  const c=calculation;
  return `<dl class="calc-lines">
    ${pair("Allowable cargo loss",money(c.total))}
    ${f.policy.credit?pair("Prior contribution",`− ${money(c.credit)}`):""}
    ${pair(`Owner’s deductible (up to ${money(f.policy.deductible*100)})`,`− ${money(c.deductible)}`)}
    ${pair(`Mutual’s ${f.policy.share}% share`,money(c.shared))}
    ${pair(`Policy limit`,money(f.policy.cap*100))}
    ${c.capped?pair("Amount above limit",`− ${money(c.capped)}`):""}
    ${pair("Payment to merchant",money(c.payable),"total")}</dl>`;
}
export function valuation(f,d){return totals(f,settlement(f,d.counts));}
function ruling(f,d) {
  const cal=settlement(f,d.counts);
  return `<div class="workspread"><section class="workarea">
    <div class="work-title"><p class="eyeline">Adjustment of claim</p><h2>Your ruling</h2><p>Enter how many units you allow on each cargo mark. Leave a mark at zero to decline that part of the claim.</p></div>
    <div class="ruling-sheet"><div class="doc-livery"><span>Allowance sheet</span><span>${marker(f)}</span></div>
    ${f.lots.map(l=>{
      const unit=unitLoss(l),cap=disputed(l);
      return `<div class="allow-row"><div><b>${l.mark} <span>${l.name}</span></b><small>${cap} claimed · ${money(unit.amount)} per allowed unit${unit.method==="repair"?" (repair)":""}</small></div>
      <label><span class="visually-hidden">Allowed units for ${l.mark}</span>
        <input class="count" type="number" inputmode="numeric" min="0" max="${cap}" step="1" value="${d.counts[l.mark]||0}" data-mark="${l.mark}" ${cap===0?"disabled":""}></label></div>`;
    }).join("")}
    <details class="sheet-terms"><summary>Read the slip and unit prices</summary><p>${f.policy.wording}</p>${valueTable(f)}</details>
    <div id="ruling-totals">${totals(f,cal)}</div></div>
    <div class="seal-area"><button class="stamp-button" data-action="review-ruling">Review &amp; stamp ${next}</button>
      <span>${allowedToFile(d)?"Ready for your signature":"Needs one cargo comparison and one excerpt"}</span></div>
    </section><aside class="jacket plain"><p class="eyeline">Supporting record</p><h3>The file clip</h3><p>A ruling should account for each disputed cargo mark, both material findings and the cover on the signed slip.</p>
    ${clipInventory(f,d)}<a class="underlink" href="${path(f,"evidence")}">Return to the evidence</a></aside></div>`;
}
export function rehearsal(f,alternate) {
  const p=alternate?{...f.policy,wording:f.baseWording,covered:f.otherCovered}:f.policy;
  const copy={...f,policy:p};
  const truth=entitlements(copy),due=settlement(copy,truth);
  return `<p>${p.wording}</p><div class="trial-out"><span>Entitlement under this wording</span><b>${money(due.payable)}</b></div>
    <p class="small-print">${copy.lots.map(l=>`${l.mark} · ${truth[l.mark]} units`).join(" &nbsp; / &nbsp; ")}</p>`;
}
function receipt(state,f,entry,whatIf){
  const a=audit(f,entry.draft),nextFile=CASEBOOK.find(c=>!filed(state,c.id));
  const b=CASEBOOK.find(c=>c.id===f.baseId);
  const alternative={...f,baseWording:f.wire&&f.rider?b.policy.wording:b.policy.rider,
    otherCovered:f.wire&&f.rider?b.policy.covered:b.policy.alternate};
  const docMap=documents(f).filter(doc=>["survey","log"].includes(doc.id));
  return `<div class="workspread"><section class="workarea">
    <div class="receipt-top"><div><p class="eyeline">Return from the audit clerk</p><h2>The filed ruling</h2></div><span class="rubber-seal">Filed</span></div>
    <div class="receipt-amounts"><div><span>You stamped</span><b>${money(a.written.payable)}</b></div><div><span>Policy owed</span><b>${money(a.right.payable)}</b></div></div>
    <p class="receipt-message">${a.appeal?`The merchant is owed another ${money(a.appeal)}. ${f.wire?"In the main book an appeal would also cost £45.":"The next post carries the balance and a £45 handling bill."}`:a.excess?`The merchant keeps the extra ${money(a.excess)}. The mutual bears that excess itself.`:"The merchant received exactly what the slip requires."} ${a.review?"The office assesses £20 for an incomplete evidence clip.":""}</p>
    <h3 class="ruled-heading">What the papers establish</h3>
    <div class="finding-list">${f.lots.map((l,i)=>`<div><b>${l.mark}</b><p>${f.reasons[i]} <strong>${a.truth[l.mark]} of ${disputed(l)} allowed.</strong></p></div>`).join("")}</div>
    <details class="terms"><summary>Audit the arithmetic</summary>${totals(f,a.right)}</details>
    <details class="terms"><summary>Check your evidence <span>${a.checks.filter(c=>c.ok).length}/4</span></summary><ul class="checks">${a.checks.map(c=>`<li><b>${c.ok?"✓":"○"} ${c.name}</b><small>${c.detail}</small></li>`).join("")}</ul>
      <p class="small-print">Read ${docMap[0].title.toLowerCase()}, ${docMap[1].title.toLowerCase()} and the coverage clause on the slip.</p></details>
    ${clipInventory(f,entry.draft)}
    ${returnDesk(state,f,entry.draft)}
    <div class="stage-actions"><a class="primary" href="${f.wire?"#wire":nextFile?path(nextFile):"#ledger"}">${f.wire?"Return to the wire room":nextFile?"Pull the next file":"Close the book"} ${next}</a><button class="underlink" data-action="print">Print ruling</button></div></section>
    <aside class="jacket counterfactual"><p class="eyeline">Underwriting room</p><h3>Change one clause</h3><p>Replace the signed wording and see how the same evidence changes the payout.</p>
    <div class="wording-switch" role="group" aria-label="Test policy wording"><button data-action="trial" data-value="original" aria-pressed="${!whatIf}">As filed</button><button data-action="trial" data-value="rider" aria-pressed="${whatIf}">Other wording</button></div>
    ${rehearsal(alternative,whatIf)}<small>This desk experiment leaves your filed ruling intact.</small></aside></div>`;
}

