import { BERTHS } from "./chart.mjs";
import { normalDraft } from "./office.mjs";

const notes={
  coffee:["Something left that pale ring on the sack. I’d test a sample from each tier before putting both on the same bill.","Dip a swab from below the hatch, then one from above the tide mark. Clip both readings and check which kind of water the signed policy covers."],
  radio:["An empty space on the quay sheet can mean a crate was taken or simply put away. The keeper has a second set of receipts.","Pull a counterfoil for each disputed cargo mark. Compare the keeper’s numbered receipts with the ship’s handover entry."],
  china:["Two broken crates came through the same crane. The clock can tell you whether the damage happened on the same side of handover.","Read the loading entry and the lift under the hook. Compare the signed times with the part of the voyage covered by the policy."],
  citrus:["The fruit and the machinery tell different stories. The engineer left three days of readings on one strip of paper.","Wind the recorder through all three pilot stamps. Put the temperature trace beside the closure log before describing why the fruit spoiled."],
  tea:["Two people signed orders on this voyage. I’d put those signatures beside the actual cargo marks.","Lift the bridge carbons and look for the master’s signature. The pool receipt records a payment that already changed hands."],
  dynamo:["There are two ways to put a machine back in working order. The merchant’s invoice puts both in the claim.","Turn the wheel to a cargo mark. Compare its certified repair with its replacement cost after scrap, then read when the damage happened."]
};

export function crewAdvice(file,step,saved,closed){
  const [start,detail]=notes[file.baseId||file.id];
  const draft=normalDraft(file,saved);
  let first=start,second=detail;
  let target=`#file/${file.id}/evidence/exhibit`,label="Open the exhibit";
  if(closed){
    first="This ruling is in the book. The audit puts the signed allowance beside the terms the merchant actually bought.";
    second="Open the evidence check on the filed ruling to see which observations support it. You can also try the alternative wording and see how the amount changes.";
    target=`#file/${file.id}/receipt`;label="Read the filed ruling";
  }else if(step==="table"&&draft.offset!==0){
    first="Slide the blue tally until its cross sits on the other cross. Now the counts line up and you can mark the rows worth checking.";
  }else if(step==="table"&&!draft.marks.length){
    first="The two sheets line up. Touch a cargo mark on the left to keep it with your evidence. A unit marked held already landed.";
  }else if(step==="ruling"){
    first="Enter a quantity for each mark. The desk applies the value, deductible and policy share. You can still revisit the evidence before stamping.";
    second=detail+" The signed policy is in the evidence tray.";
  }
  return {first,second,target,label};
}

export function crewPanel(file,step,saved,closed,detail=false){
  const room=BERTHS[file.baseId||file.id],advice=crewAdvice(file,step,saved,closed);
  return `<article class="crew-window" style="--signal:${room.color}"><header><span class="comms-icon" aria-hidden="true"></span> Crew channel <button type="button" data-action="close-dialog" aria-label="Close crew channel">Close ×</button></header>
    <div class="crew-transmission"><div class="crew-portrait"><img src="./media/spool.webp" width="720" height="480" alt="Spool, a cable reel mechanic with two orange crane claws"></div>
    <div><p class="crew-callsign">Spool · Deck mechanic</p><h2 id="dialog-title">${detail?"What to check":"From the workbench"}</h2>
    <span class="crew-location">${room.name} / ${file.title}</span></div></div>
    <p class="crew-words" aria-live="polite">${detail?advice.second:advice.first}</p>
    <div class="crew-actions">${detail?`<button type="button" class="crew-back" data-action="spool-more" data-value="short">First message</button>
    <a class="crew-go" data-action="leave-crew" href="${advice.target}">${advice.label}</a>`:
    '<button type="button" class="crew-go" data-action="spool-more" data-value="detail">What should I check?</button>'}</div></article>`;
}
