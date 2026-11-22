import { CASEBOOK } from "./cases.mjs";
import { TREATIES, OPENING_CASH, money, ledger, claimed, resolveFile, audit, documents } from "./office.mjs";
import { sectionTitle, pair, path, next, filed, folio } from "./press.mjs";

export function ledgerRoom(s){
  const book=ledger(s),frozen=book.rows.length>0;
  return `<section class="room wrap">${sectionTitle("Tide Mutual · Cash office","The office ledger",`<span class="type-note">${book.rows.length} of 6 rulings entered</span>`)}
    <p class="room-intro">The cash book follows the six summer files. Payments leave the drawer when you stamp. Appeals and recoveries arrive with the next post.</p>
    <div class="ledger-spread"><section class="ledger-body">
      <div class="cash-leaf"><div class="doc-livery"><span>Cash reconciliation</span><span>Summer 1962</span></div>
      <dl>${pair("Opening reserve",money(OPENING_CASH))}${pair("Reinsurance fee",`− ${money(book.fee)}`)}${pair("Cash in the drawer",money(book.cash),"cash-present")}
      ${pair("Recovery in the post",`+ ${money(book.pendingIn)}`)}${pair("Appeals and fees in the post",`− ${money(book.pendingOut)}`)}
      ${pair("Balance after the post",money(book.closing),"total")}</dl>
      ${book.hasMail?`<button class="primary" data-action="post">Open the return post ${next}</button>`:`<p class="small-print">All due mail is posted.</p>`}</div>
      <div class="register-head"><h2>Entries</h2></div>
      ${book.rows.length?book.rows.map(r=>`<details class="journal-entry"><summary><span>${r.title}</span><b>${money(r.write)} paid</b></summary>
        <dl>${pair("Policy entitlement",money(r.correct))}${pair("Claimant’s top up",money(r.appeal))}${pair("Overpayment retained by claimant",money(r.overpay))}
        ${pair("Handling and evidence review",money(r.fees))}${pair("Reinsurance recovery",money(r.reimbursement))}${pair("Return post",r.posted?"Posted":r.reimbursement||r.appeal||r.fees?"Outstanding":"Nothing due")}</dl>
        <a class="underlink" href="${path(resolveFile(r.id),"receipt")}">Read the filed ruling</a></details>`).join(""):`<p class="empty-line">Your first stamped ruling opens the claims journal.</p>`}
      ${book.complete?`<a class="primary stage-next" href="#gazette">Read the closing edition ${next}</a>`:`<a class="underlink" href="#register">Back to the case register</a>`}</section>
      <aside class="treaty-note"><p class="eyeline">Underwriter’s memorandum</p><h2>Share the risk</h2><p>Before your first summer ruling, choose whether another insurer helps carry the book. Its payments come through the post.</p>
        <fieldset ${frozen?"disabled":""}><legend>${frozen?"Treaty bound at first ruling":"Choose a treaty for the six files"}</legend>${Object.entries(TREATIES).map(([key,t])=>`<label class="treaty-choice"><input type="radio" name="treaty" value="${key}" ${s.treaty===key?"checked":""}><span><strong>${t.name}</strong><small>${t.description}</small></span></label>`).join("")}</fieldset>
      </aside></div></section>`;
}
export function wireRoom(s,packet,feedback=""){
  const generated=packet?.wire?packet:null;
  const known=s.loose.map(id=>resolveFile(id)).filter(Boolean).reverse();
  return `<section class="room wrap">${sectionTitle("Ledgerwick cable office","The wire room")}
    <p class="room-intro">Send a friend the same sealed case. The cable clerk varies the cargo counts, prices and policy terms. Each player opens a separate desk. Exchange return slips after filing to compare the two rulings.</p>
    <div class="wire-spread"><section class="wire-form"><div class="doc-livery"><span>Outbound telegram</span><span>Tide Mutual</span></div>
      <h2>Make up a shipment</h2><label for="wire-type">Subject of the claim</label><select id="wire-type">${CASEBOOK.map(f=>`<option value="${f.id}" ${generated?.baseId===f.id?"selected":""}>${f.cargo}</option>`).join("")}</select>
      <button class="primary" data-action="generate">Seal a fresh file ${next}</button>
      ${generated?`<div class="wire-ticket" id="ready-wire"><p class="eyeline">Sealed dispatch</p><h3>${generated.title}</h3>
        <p>${generated.vessel} · ${generated.cargo}</p><div class="wire-code">PH ${generated.id}</div>
        <div class="stage-actions"><a class="primary" href="${path(generated,filed(s,generated.id)?"receipt":"table")}">${filed(s,generated.id)?"Read your ruling":"Open this wire"} ${next}</a><button class="underlink" data-action="copy-wire" data-value="${generated.id}">Copy link</button></div>
        <label for="wire-url" class="small-print">Shareable address</label><input id="wire-url" class="share-url" type="url" readonly value="" aria-label="Shareable address">
      </div>`:""}</section>
      <aside class="incoming"><p class="eyeline">Incoming telegram</p><h2>Have a wire code?</h2>
        <form id="receive-wire" novalidate><label for="wire-input">Code printed on the dispatch</label><input id="wire-input" type="text" placeholder="PH 100000O" maxlength="20" spellcheck="false" autocapitalize="characters">
        <button type="submit" class="flat-button">Find the dispatch ${next}</button><p id="wire-error" role="alert">${feedback}</p></form>
        <p class="small-print">Wire cases have individual rulings. The mutual’s six summer files keep a separate cash book.</p>
      </aside></div>
    ${known.length?`<div class="register-head"><h2>Your cable file</h2></div><div class="wire-history">${known.map(f=>`<a href="#wire/${f.id}"><code>PH ${f.id}</code><span>${f.title}</span><b>${filed(s,f.id)?"Filed":"Open"}</b>${next}</a>`).join("")}</div>`:""}</section>`;
}
export function gazette(s){
  const b=ledger(s);
  if(!b.complete)return ledgerRoom(s);
  const due=b.rows.reduce((n,r)=>n+r.correct,0),excess=b.rows.reduce((n,r)=>n+r.overpay,0),appeals=b.rows.filter(r=>r.appeal).length;
  const headline=b.perfect===6?"A clean book on North Quay":appeals>=3?"Merchants return to the claims counter":excess?"Extra pounds leave the harbour office":"Summer claims book closes";
  const word=appeals===1?"appeal":"appeals";
  return `<section class="room wrap gazette"><p class="eyeline">Port of Ledgerwick · Closing edition</p><h1>The Shipping Gazette</h1>
    <div class="edition"><span>Saturday, 14 July 1962</span><span>Claims special</span><span>Town edition</span></div>
    <div class="news-lead"><div><h2>${headline}</h2><p>Across six voyages this summer, Tide Mutual’s cargo policies owed merchants ${money(due)}. The office closed ${b.perfect} of the six files with a fully evidenced ruling.</p>
    <p>The returns show ${appeals} ${word}, ${money(excess)} in excess payments and ${money(b.credits)} recoverable from the mutual’s insurer. The final balance after all post is ${money(b.closing)}.</p>
    <button class="primary" data-action="print">Print the bound casebook ${next}</button></div>
    <figure class="news-photo"><img src="./media/cover.webp" alt="Ledgerwick’s cargo quay at sunset"><figcaption>North Quay at the close of the summer book.</figcaption></figure></div>
    <div class="register-head"><h2>Summer rulings</h2></div><div class="edition-entries">${b.rows.map(r=>`<a href="${path(resolveFile(r.id),"receipt")}"><span>${r.title}</span><strong>${money(r.write)}</strong></a>`).join("")}</div>
    <a class="underlink" href="#ledger">Return to the cash book</a>
    <div class="print-annex">${s.rulings.filter(e=>CASEBOOK.some(x=>x.id===e.id)).map(e=>{
      const f=resolveFile(e.id),a=audit(f,e.draft);
      return `<article><p>${f.vessel} · ${f.date} 1962</p><h2>File ${folio(f.number)}. ${f.title}</h2><p>${f.note}</p><h3>Judgment</h3><p>${f.policy.wording}</p><p>Claim submitted ${money(claimed(f))}. Stamped ${money(a.written.payable)}. Entitlement ${money(a.right.payable)}.</p>
      <ul>${f.lots.map((l,i)=>`<li>${l.mark} · ${f.reasons[i]} You allowed ${e.draft.counts[l.mark]} units. The audit allowed ${a.truth[l.mark]}.</li>`).join("")}</ul>
      <h3>Evidence on file</h3><p>Clipped cargo marks: ${e.draft.marks.join(", ")||"None"}</p>${documents(f).map(doc=>doc.lines.filter(line=>e.draft.facts.includes(line.id)).map(l=>`<p><b>${doc.title}.</b> ${l.text}</p>`).join("")).join("")}
      </article>`;}).join("")}</div></section>`;
}

