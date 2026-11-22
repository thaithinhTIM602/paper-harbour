import { CASEBOOK } from "./cases.mjs";
import { claimed, money, ledger, resolveFile } from "./office.mjs";

export const folio=n=>String(n).padStart(2,"0");
export const marker=file=>file.wire?`Wire ${file.id}`:`File ${folio(file.number)}`;
export const arrow='<span class="arrow" aria-hidden="true">↗</span>';
export const next='<span class="arrow" aria-hidden="true">→</span>';
export function path(file,step="table"){return `#file/${file.id}/${step}`;}
export function imagePlate(f,cls=""){return `<figure class="case-plate ${cls}"><img src="./media/${f.image}.webp" alt="${f.plate.split(". ").slice(1).join(". ")}" width="508" height="508"><figcaption>${f.plate}</figcaption></figure>`;}
export const sectionTitle=(small,title,aside="")=>`<div class="section-title"><div><p class="eyeline">${small}</p><h1>${title}</h1></div>${aside}</div>`;
export const pair=(a,b,cls="")=>`<div class="sum-row ${cls}"><dt>${a}</dt><dd>${b}</dd></div>`;
export const filed=(s,id)=>s.rulings.find(r=>r.id===id);
export function indexRows(s) {
  return CASEBOOK.map((base,i)=>{
    const f=resolveFile(base.id),closed=filed(s,f.id),begun=Boolean(s.drafts[f.id]);
    return `<a class="index-row" href="${path(f,closed?"receipt":"table")}"><span class="index-no">${folio(i+1)}</span>
      <img src="./media/${f.image}.webp" alt="" width="74" height="56" loading="lazy">
      <span class="index-name"><b>${f.title}</b><small>${f.cargo} · ${f.vessel}</small></span>
      <span class="index-date">${f.date} 1962</span><span class="index-state ${closed?"filed":""}">${closed?"Filed":begun?"On the desk":"Open file"}</span>${next}</a>`;
  }).join("");
}
export function cover(s) {
  const b=ledger(s),work=CASEBOOK.find(f=>s.drafts[f.id]&&!filed(s,f.id))||CASEBOOK.find(f=>!filed(s,f.id));
  const cta=!work?"Read the closing book":s.drafts[work.id]?"Resume your file":b.rows.length?"Open the next file":"Open the first file";
  return `<div class="cover wrap">
    <div class="cover-headingline"><span>PORT OF LEDGERWICK</span><span>SUMMER REGISTER <b>1962</b></span></div>
    <section class="cover-spread">
      <div class="cover-type"><div class="issue"><i></i><span>The marine claims casebook</span></div>
        <h1><span>Paper</span> <em>Harbour<span>.</span></em></h1>
        <p class="hook">Every cargo has a paper trail.<br>Decide who pays when it goes wrong.</p>
        <a class="primary large" href="${work?path(resolveFile(work.id)):"#ledger"}">${cta}${next}</a>
        <a class="underlink" href="#guide">How the desk works</a>
      </div>
      <figure class="cover-art"><div class="cover-print"><img src="./media/cover.webp" alt="A cobalt cargo steamer turns past dockworkers and vermilion warehouses at sunset." width="1536" height="1024" fetchpriority="high"></div>
        <figcaption><span><b>Plate I.</b> North Quay, from the water.</span><span>Ledgerwick, 1962</span></figcaption>
      </figure>
    </section>
    <section class="register-block"><div class="register-head"><h2>The case register</h2><span>${b.rows.length} of 6 filed</span></div>
      <p class="intro-line">Six voyages came before the mutual this summer. Pull a file in any order.</p>
      <div class="index-list">${indexRows(s)}</div>
    </section></div>`;
}
export function caseIndex(s) {
  return `<section class="room wrap">${sectionTitle("Tide Mutual · Filing room","The case register",`<span class="type-note">${ledger(s).rows.length} of 6 filed</span>`)}
    <p class="room-intro">Each file holds the ship’s account, the quay tally and the papers that decide the claim. A filed case keeps its ruling and evidence.</p>
    <div class="index-list">${indexRows(s)}</div>
    <div class="inline-route"><span>For a fresh shipment with different figures and terms</span><a href="#wire">Visit the wire room ${next}</a></div></section>`;
}
export function guide() {
  return `<section class="room wrap narrow-room">${sectionTitle("Desk copy · Instructions to the adjuster","How the desk works")}
    <p class="room-intro">You work for Tide Mutual, a group of merchants who pool money to insure their cargo. Your job is to find the loss their written agreement actually covers.</p>
    <div class="manual">
      <article><span>I</span><div><h2>Square the sheets</h2><p>The manifest says what sailed. The quay tally says what landed and how many landed units were held for inspection. “Held” is part of “landed.” Slide the blue sheet until its crosses meet the red crosses, or use the <b>Square the sheets</b> button. Clip each disputed mark.</p></div></article>
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

