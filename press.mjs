import { CASEBOOK } from "./cases.mjs";
import { ledger, resolveFile } from "./office.mjs";

import { BERTHS, chartDrawing } from "./chart.mjs";

export const folio=n=>String(n).padStart(2,"0");
export const marker=file=>file.wire?`Wire ${file.id}`:`File ${folio(file.number)}`;
export const arrow='<span class="arrow" aria-hidden="true">↗</span>';
export const next='<span class="arrow" aria-hidden="true">→</span>';
export function path(file,step="table"){return `#file/${file.id}/${step}`;}
export function imagePlate(f,cls=""){return `<figure class="case-plate ${cls}"><button class="plate-button" data-action="photograph" data-value="${f.id}" aria-label="Inspect the photograph for ${f.title}"><img src="./media/${f.image}.webp" alt="${f.plate.split(". ").slice(1).join(". ")}" width="508" height="508"><span aria-hidden="true"><i class="lens-mark"></i></span></button><figcaption>${f.plate}</figcaption></figure>`;}
export const sectionTitle=(small,title,aside="")=>`<div class="section-title"><div><p class="eyeline">${small}</p><h1>${title}</h1></div>${aside}</div>`;
export const pair=(a,b,cls="")=>`<div class="sum-row ${cls}"><dt>${a}</dt><dd>${b}</dd></div>`;
export const filed=(s,id)=>s.rulings.find(r=>r.id===id);
export function indexRows(s) {
  return CASEBOOK.map((base,i)=>{
    const f=resolveFile(base.id),closed=filed(s,f.id),begun=Boolean(s.drafts[f.id]);
    return `<a class="index-row" href="${path(f,closed?"receipt":"table")}"><span class="index-no">${folio(i+1)}</span>
      <span class="index-contact"><img src="./media/${f.image}.webp" alt="" width="110" height="74" loading="lazy"></span>
      <span class="index-name"><b>${f.title}</b><small>${BERTHS[base.id].name} · ${f.cargo}</small></span>
      <span class="index-date">${f.date} 1962</span><span class="index-state ${closed?"filed":""}">${closed?"Filed":begun?"On the desk":"Open file"}</span>${next}</a>`;
  }).join("");
}
export function selectedFile(s,id) {
  const choice=CASEBOOK.find(f=>f.id===id);
  const unfinished=CASEBOOK.filter(f=>!filed(s,f.id));
  return resolveFile((choice||unfinished.find(f=>s.drafts[f.id])||unfinished[0]||CASEBOOK[0]).id);
}
export function chartDocket(s,f){
  const closed=Boolean(filed(s,f.id)),draft=Boolean(s.drafts[f.id]),automatic=selectedFile(s);
  let verb="Open this file";
  if(closed)verb="Read filed ruling";
  else if(draft)verb="Resume your file";
  else if(f.id===automatic.id)verb=ledger(s).rows.length?"Open the next file":"Open the first file";
  const room=BERTHS[f.baseId||f.id];
  return `<div class="ticket-code" aria-hidden="true"><span>File</span><b>${folio(f.number)}</b></div>
    <div class="ticket-photo"><img src="./media/${f.image}.webp" width="508" height="508" alt=""></div>
    <div class="ticket-brief"><small><i style="background:${room.color}"></i>${room.name} <span>/</span> ${f.vessel}</small>
      <h2>${f.title}</h2><p>${f.lead}</p></div>
    <a class="ticket-action" href="${path(f,closed?"receipt":"table")}">${verb}</a>`;
}

export function cover(s,id){
  const f=selectedFile(s,id),book=ledger(s),closedIds=book.rows.map(row=>row.id);
  return `<div class="flight-deck wrap">
    <section class="shift-stage" aria-label="Night shift aboard Relay Nine">
      <div class="shift-intro">
        <div class="station-id"><i aria-hidden="true"></i> Relay Nine <span>/</span> Cargo station</div>
        <h1><span>Night</span> <strong>Shift<span class="title-period">.</span></strong></h1>
        <p class="shift-copy">Six cargo mysteries from Earth sit in the station archive. Choose a bay, examine the evidence and decide what the merchant is owed.</p>
        <button class="spool-contact" type="button" data-action="ask-spool"><img src="./media/spool.webp" width="720" height="480" alt=""><span><small>Deck mechanic</small><b>Ask Spool</b></span><i class="comms-icon" aria-hidden="true"></i></button>
      </div>
      <div class="deck-board"><div class="board-rail"><h2><i aria-hidden="true"></i>Station map</h2><span>Choose a bay</span></div>
        ${chartDrawing(f.id,closedIds)}
        <div class="board-controls"><div class="map-legend"><i aria-hidden="true"></i>Spool’s route${closedIds.length?'<span class="filed-key">✓ Filed</span>':""}</div>
          <div class="bay-switch"><button type="button" data-action="cycle-bay" data-value="previous" aria-label="Previous station bay"><i aria-hidden="true"></i></button>
            <output id="bay-readout" aria-label="Selected bay">Bay ${folio(f.number)} / 06</output><button type="button" data-action="cycle-bay" data-value="next" aria-label="Next station bay"><i aria-hidden="true"></i></button></div></div>
      </div>
    </section>
    <section class="assignment-ticket" id="chart-docket" aria-label="Selected case" aria-live="polite" aria-atomic="true">${chartDocket(s,f)}</section>
    <div class="shift-log"><div><span class="shift-meter" aria-hidden="true">${CASEBOOK.map(c=>`<i class="${closedIds.includes(c.id)?"logged":""}"></i>`).join("")}</span><span>${book.rows.length} of six claims filed</span></div>
      <a href="${book.complete?"#ledger":"#register"}">${book.complete?"Read the closing book":"Browse case files"}</a>
      <button type="button" data-action="photograph" data-value="archive">Liverpool archive print</button></div>
    </div>`;
}

export function caseIndex(s){
  return `<section class="room wrap register-room"><div class="register-mast"><div><p class="eyeline">Relay Nine / Earth archive / Summer 1962</p><h1>The case register</h1></div><span class="type-note">${ledger(s).rows.length} of 6 filed</span></div>
    <p class="register-intro">Six shipments, six workbenches. Open a file to compare the paperwork and examine its cargo.</p>
    <div class="index-list">${indexRows(s)}</div>
    <div class="inline-route"><a href="#cover">Return to the station map</a></div></section>`;
}
export function photograph(file,back=false){
  const archive=!file;
  const title=archive?"Alongside the Vigilant":file.title;
  const description=archive?"The crew receives a gas buoy beside a dockside crane in Liverpool.":file.plate.split(". ").slice(1).join(". ");
  const source=archive?`<p>Herculaneum Dock, Liverpool. A shoreside crane lowers a gas buoy onto the <em>Vigilant</em>.</p>
    <p>The Mersey Docks and Harbour Board supplied the photograph for E. Keble Chatterton’s <em>Steamships and Their Story</em>, published by Cassell in 1910.</p>
    <a class="underlink" href="https://www.gutenberg.org/cache/epub/72045/pg72045-images.html#il_102" target="_blank" rel="noopener noreferrer">View the original plate ↗</a>`:
    `<p>${file.note}</p><dl>${pair("Cargo",file.cargo)}${pair("Berth",file.berth)}${pair("Merchant",file.claimant)}</dl><p class="print-signature">${file.vessel}</p><p class="plate-origin">Illustrated survey plate from the fictional Ledgerwick casebook.</p>`;
  return `<div class="photo-mount"><div class="mount-tools"><span>${archive?"Archive photograph":marker(file)+" · Survey plate"}</span><button aria-label="Close photograph" data-action="close-dialog">Close <i aria-hidden="true">×</i></button></div>
    <h2 id="dialog-title">${title}</h2>
    ${back?`<article class="plate-reverse"><h3>${archive?"Photograph record":"On the reverse"}</h3>${source}</article>`:`<figure><div class="print-surface ${archive?"archival":""}" aria-label="Photograph detail" tabindex="-1"><img src="./media/${archive?"vigilant-quay":file.image}.webp" alt="${description}"><span class="optical-lens" aria-hidden="true"></span></div><figcaption>${archive?"Herculaneum Dock, Liverpool. Published in 1910.":file.plate}</figcaption></figure>`}
    <div class="print-controls">${back?"":'<button class="magnifier-toggle" data-action="magnifier" aria-pressed="false"><i class="lens-mark" aria-hidden="true"></i> Magnify detail</button>'}<button class="flip-print" data-action="flip-print" aria-pressed="${back}">${back?"Show photograph":archive?"Turn over for the credit":"Turn over for the case note"}</button></div></div>`;
}


export function guide() {
  return `<section class="room wrap narrow-room">${sectionTitle("Relay Nine / Field guide","Working the night shift")}
    <p class="room-intro">Relay Nine is an orbital archive. Its six bays reconstruct cases from Tide Mutual, a fictional marine insurance office in 1962. Each merchant wants payment for a shipment. You decide how much the written agreement covers. Ask Spool at any workbench for a lead.</p>
    <div class="manual">
      <article><span>I</span><div><h2>Square the sheets</h2><p>The manifest says what sailed. The quay tally says what landed and how many landed units were held for inspection. “Held” is part of “landed.” Drag the blue tally until its cross meets the red one, or press <b>Square the sheets</b>. Select a mark on the manifest to clip it. The comparison slip lists the same marks.</p></div></article>
      <article><span>II</span><div><h2>Build an evidence clip</h2><p>Work the physical exhibit, then read the survey, ship’s papers, policy and valuation. Clip up to four readings or passages. Aim to document both material findings and the coverage wording. A wet or missing parcel can have more than one explanation.</p></div></article>
      <article><span>III</span><div><h2>Write the allowance</h2><p>Enter how many units the mutual should recognise for each mark. The desk works out the money using the agreed prices. Your draft stays open until you press the stamp a second time to file it.</p></div></article>
      <article><span>IV</span><div><h2>Read the return post</h2><p>The audit shows the ruling beside the original evidence. A short payment is topped up by post with a £45 handling cost. An overpayment stays with the merchant. An incomplete evidence clip costs the office £20 for review.</p></div></article>
    </div><details class="terms"><summary>What the money terms mean</summary><dl>
      ${pair("Declared value","The unit price written on the insurance slip. The desk uses the lower of this and the purchase invoice.")}
      ${pair("Salvage","The money the owner can still receive for damaged goods. A certified repair is a separate possible remedy.")}
      ${pair("Deductible","The first part of an eligible loss that the owner must bear.")}
      ${pair("Share and limit","The mutual pays the stated percentage after deductions, up to the maximum in that file.")}
      ${pair("Reinsurance","Cover bought by the mutual for part of its own payments. The merchant’s entitlement stays the same.")}
    </dl></details>
    <p class="small-print">Ledgerwick, its people and its policies are fictional. All amounts are game pounds. Your desk is saved in this browser. A wire shares the shipment and terms with another player, who keeps a separate ruling.</p>
    <a class="primary" href="#register">Pull a file ${next}</a></section>`;
}

