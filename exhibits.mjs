const whole=new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0});
const pounds=n=>whole.format(n);

export function exhibit(file){
  const [a,b,c]=file.lots;
  const type=file.baseId||file.id;
  const records={
    coffee:{
      title:"Assay tray",head:"Read the salt test",by:"Surveyor’s bench · Three numbered sample papers",
      prompt:"Select a swab and dip its test paper. The reference card identifies violet as a positive salt reading.",
      choices:[a.mark,b.mark,c.mark],action:"Dip the strip",
      readings:[`${a.mark} turns violet. The sample came from the white edge on the lower tier below the sprung hatch.`,
        `${b.mark} stays straw coloured. The fresh droplets were collected above the tide mark, where the roof was sweating.`,
        `${c.mark} has no water mark. It is the retained dry control.`]},
    radio:{
      title:"Bonded index",head:"Search the keeper’s drawer",by:"Transit Shed 2 · Counterfoil register",
      prompt:"Pull a cargo mark’s counterfoil. Match what the quay missed to what the keeper actually signed for.",
      choices:[a.mark,b.mark,c.mark],action:"Pull counterfoil",
      readings:[`No bonded receipt for the ${a.missing} absent ${a.mark} cases. The attached ship check records a forced wire before handover.`,
        `Receipt B/45 carries all ${b.missing} absent ${b.mark} cases. The keeper signed each numbered case into the annex.`,
        `${c.mark} went straight to its consignee. The quay sheet has a matching full receipt.`]},
    china:{
      title:"Shift clock",head:"Reconstruct the two lifts",by:"Crane 3 · Signed shift clock",
      prompt:"Set the clock to an entry and read its carbon docket. A different signature marks the beginning of discharge.",
      choices:["Loading","Under the hook","Release"],action:"Read entry",
      readings:[`${b.mark} was marked loose at 06.40 before loading. The packer noted thin straw and abrasion beneath the wraps.`,
        `At 14.12 the shore crane dropped ${a.mark} against the quay, twelve minutes after the 14.00 discharge signature.`,
        `${c.mark} was released undamaged at 15.05.`]},
    citrus:{
      title:"Recorder drum",head:"Wind the cold room recorder",by:"Engine room · Temperature paper and pilot stamps",
      prompt:"Turn the drum through the closure. The pale band is the engineer’s working range of 3 to 5 degrees Celsius.",
      choices:["Arrival at bar","Next day","Bar reopens"],action:"Read the trace",
      readings:["At the bar the trace reads 4.0°C. The recorded temperatures stay in the working band and the engineer reports continuous operation.",
        "After 24 hours the pilot stamp still reads closed. The cold room reads 4.2°C.",
        "At 72 hours the pilot stamps the bar open. The trace stays in its working band through all three days of delay."]},
    tea:{
      title:"Order carbon",head:"Lift the order carbons",by:"Bridge drawer · Ship’s duplicate set",
      prompt:"Lift a carbon by its corner. Read the authorising signature, the cargo marks and the pool receipt.",
      choices:["Master’s sheet","Mate’s sheet","Pool receipt"],action:"Lift this carbon",
      readings:[`The master signed only ${a.mark} (${a.missing} chests) and ${b.mark} (${b.missing} chests). Both appear on the same bridge order.`,
        `The mate’s duplicate adds ${c.mark} (${c.missing} chests). There is no countersignature from the master.`,
        `The owners’ clerk paid ${pounds(file.policy.credit)} to the merchant toward this file. The single receipt applies across the claim.`]},
    dynamo:{
      title:"Valuer’s wheel",head:"Turn the valuation wheel",by:"Foundry table · Binding prices per unit",
      prompt:"Choose a machine to bring its two possible remedies into the windows. A repair leaves the owner with the unit.",
      choices:[a.mark,b.mark,c.mark],action:"Turn to the mark",
      readings:[`${a.mark} can be restored for ${pounds(a.repair)} per unit. The repairer keeps no scrap. The competing surrender route pays the invoice basis less the dealer’s bid.`,
        `${b.mark} struck the sill and has no certified repair. The dealer bids ${pounds(b.salvage)} per unit in scrap.`,
        `${c.mark} was already rusted in the authorised shore store. The dealer’s scrap bid is ${pounds(c.salvage)}.`]}
  };
  return {id:"exhibit",type,...records[type]};
}
export function exhibitDocument(file){
  const x=exhibit(file);
  return {id:x.id,title:x.title,by:x.by,heading:x.head,lines:x.readings.map((text,i)=>({id:`exhibit.${i}`,text}))};
}
export const PROOF={
  coffee:{groups:[["survey.0","log.0","exhibit.0"],["survey.1","log.1","exhibit.1"]],detail:"Record both the lower tier’s seawater and the upper tier’s condensation."},
  radio:{groups:[["log.0","exhibit.0"],["survey.1","log.1","exhibit.1"]],detail:"Establish a forced wire before handover and the second lot’s signed receipt."},
  china:{groups:[["survey.0","log.0","exhibit.1"],["survey.1","log.1","exhibit.0"]],detail:"Trace the crane impact during discharge and the packing fault before loading."},
  citrus:{groups:[["survey.0","survey.1","exhibit.0","exhibit.2"],["log.0","log.1","exhibit.2"]],detail:"Establish working refrigeration and the three day pilot closure."},
  tea:{groups:[["survey.0","survey.1","exhibit.0"],["log.0","exhibit.2"]],detail:"Document the master’s signed order and the prior payment by the owners’ pool."},
  dynamo:{groups:[["survey.0","log.0","exhibit.0"],["survey.1","log.1","exhibit.1"],["survey.1","log.1","exhibit.2"]],detail:"Document the repair option, the wrecked coils and the pre-existing storage rust."}
};
function tray(f,x,i,used){
  const l=f.lots[i];
  if(x.type==="coffee")return `<div class="assay-board"><div class="sample-strip" data-result="${used?["violet","straw","dry"][i]:"blank"}"><b>${l.mark}</b><i></i></div><div class="colour-key"><small>Reference card</small><span><i></i>Salt detected</span><span><i></i>Fresh water</span></div></div>`;
  if(x.type==="radio")return `<div class="annex-card"><small>Bonded shed counterfoil</small><b>${used?["No receipt","B / 45","Quay receipt"][i]:"Drawer shut"}</b><span>${used?(i===1?Array.from({length:l.missing},(_,n)=>`${l.mark}/${String(n+1).padStart(2,"0")}`).join(" · "):i===0?"Search completed · zero in store":"Release signed"):"Select a mark to pull its record"}</span></div>`;
  if(x.type==="china")return `<div class="clock-board"><div class="clock-face" style="--hour:${used?[200,66,92.5][i]:0}deg;--minute:${used?[240,72,30][i]:0}deg" aria-hidden="true"><i></i><b></b></div><div><small>Crane 3 · Time docket</small><b>${used?["06.40","14.12","15.05"][i]:"·· ··"}</b><span>Discharge signed at 14.00</span></div></div>`;
  if(x.type==="citrus"){
    const hours=[0,6,12,18,24,30,36,42,48,54,60,66,72],values=[4,4.1,3.9,4,4.2,4,3.8,4,4.1,3.9,4.1,4,4.1];
    const xp=h=>30+h*4,yp=t=>85-(t-3)*32;
    const h=[0,24,72][i];
    return `<div class="drum-board"><svg viewBox="0 0 343 115" role="img" aria-label="Cold room recorder. Values between 3.8 and 4.2 degrees Celsius across 72 hours."><rect x="30" y="21" width="288" height="64" fill="#dce6cb"/>
      ${[3,4,5].map(t=>`<path d="M30 ${yp(t)}h288" stroke="#81977b" stroke-width=".7"/><text x="5" y="${yp(t)+4}">${t}°</text>`).join("")}
      ${[0,24,48,72].map(t=>`<path d="M${xp(t)} 21v64" stroke="#81977b" stroke-width=".7"/><text x="${xp(t)-4}" y="104">${t}h</text>`).join("")}
      <polyline fill="none" stroke="#9d3829" stroke-width="2.5" points="${hours.map((hour,n)=>`${xp(hour)},${yp(values[n])}`).join(" ")}"/>
      ${used?`<path stroke="#233d55" stroke-width="2" d="M${xp(h)} 12v77"/><circle cx="${xp(h)}" cy="${yp(values[hours.indexOf(h)])}" r="4" fill="#233d55"/>`:""}</svg></div>`;
  }
  if(x.type==="tea")return `<div class="carbon-board ${used?"lifted":""}"><div><small>Ship’s duplicate</small><b>${used?["A. Ness","I. Fell, duty mate","L. Kite"][i]:"Under carbon"}</b><span>${used?[`${f.lots[0].mark} + ${f.lots[1].mark}`,f.lots[2].mark,pounds(f.policy.credit)][i]:"Signature covered"}</span></div><i aria-hidden="true"></i></div>`;
  const replacement=Math.max(0,Math.min(l.invoice,l.declared)-l.salvage);
  return `<div class="wheel-board"><div class="wheel-disc" style="--wheel:${i*72}deg" aria-hidden="true"></div><div><small>Repair &amp; retain</small><b>${used?(l.repair?pounds(l.repair):"No bid"):"···"}</b></div><div><small>Replace less scrap</small><b>${used?pounds(replacement):"···"}</b></div></div>`;
}
export function apparatus(file,draft,setting={},locked=false){
  const x=exhibit(file),i=[0,1,2].includes(setting.index)?setting.index:0;
  const used=Boolean(setting.used),id=`exhibit.${i}`,pinned=draft.facts.includes(id);
  return `<div class="apparatus"><p>${x.prompt}</p><div class="instrument-options" role="group" aria-label="Exhibit position">${x.choices.map((label,n)=>`<button data-action="instrument-choose" data-value="${n}" aria-pressed="${n===i}">${label}</button>`).join("")}</div>
    ${tray(file,x,i,used)}<button class="flat-button operate" data-action="instrument-use">${x.action} <span aria-hidden="true">↓</span></button>
    ${used?`<div class="exhibit-reading"><p>${x.readings[i]}</p>${locked?`<span>${pinned?"✓ Filed with ruling":""}</span>`:`<button class="clip-button ${pinned?"clipped":""}" aria-pressed="${pinned}" data-action="fact" data-value="${id}" aria-label="${pinned?"Unclip":"Clip"} exhibit reading ${i+1}">${pinned?"✓ Clipped":"+ Clip reading"}</button>`}</div>`:""}</div>`;
}

