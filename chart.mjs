import { CASEBOOK } from "./cases.mjs";

// Coordinates follow the actual centre lines in the illustrated 720 by 480 deck.
const bridge=[355,235];
const west=[208,235],east=[447,235];
const definitions={
  coffee:{name:"Cargo hoist",color:"#ff936b",floor:"53,82 99,41 236,41 282,84 282,160 255,188 203,188 201,163 180,163 174,186 80,186 50,154",waypoints:[bridge,west,[208,202],[195,189],[195,170],[186,156]]},
  radio:{name:"Signal room",color:"#7dd9e5",floor:"291,94 327,67 425,67 450,94 450,155 425,180 365,180 365,161 333,161 330,180 307,170 291,148",waypoints:[bridge,[355,209],[346,194],[346,174],[372,160]]},
  china:{name:"Ceramics lab",color:"#d3a4ed",floor:"470,85 512,44 630,44 674,88 674,157 640,188 554,188 551,168 519,166 513,183 487,173 470,153",waypoints:[bridge,east,[490,205],[515,205],[534,185],[534,172],[562,164]]},
  citrus:{name:"Cold store",color:"#f7b54e",floor:"479,332 500,295 526,293 533,309 547,309 553,290 640,290 687,329 687,392 655,424 503,424 472,395",waypoints:[bridge,east,[490,265],[516,265],[538,288],[538,313],[552,332],[552,380],[580,401]]},
  tea:{name:"Freight lock",color:"#9cdaa4",floor:"269,326 291,292 336,292 342,309 368,309 375,293 418,293 451,326 451,386 427,407 391,407 385,383 319,383 301,408 282,404 267,388",waypoints:[bridge,[355,303],[355,349],[360,383]]},
  dynamo:{name:"Machine shop",color:"#a5a9f4",floor:"30,336 64,295 176,295 185,306 198,305 211,290 234,307 246,332 244,394 217,423 57,423 26,396",waypoints:[bridge,west,[208,269],[192,288],[191,313],[201,335],[201,365],[189,382]]}
};
const toPath=points=>points.map(([x,y],i)=>`${i?"L":"M"}${x} ${y}`).join(" ");
export const BERTHS=Object.fromEntries(Object.entries(definitions).map(([id,room])=>{
  const [x,y]=room.waypoints.at(-1);
  return [id,{...room,x,y,course:toPath(room.waypoints)}];
}));

export function travelBetween(previous,target){
  const to=BERTHS[target]?.waypoints;
  if(!to)return "";
  const from=BERTHS[previous]?.waypoints;
  if(!from)return toPath(to);
  let fork=0;
  while(fork+1<from.length&&fork+1<to.length&&from[fork+1][0]===to[fork+1][0]&&from[fork+1][1]===to[fork+1][1])fork++;
  return toPath([...from.slice(fork).reverse(),...to.slice(fork+1)]);
}

export function chartDrawing(selected,filedIds=[]){
  const active=BERTHS[selected];
  return `<div class="station-plan" role="group" aria-label="Interactive deck of Relay Nine. Choose a cargo bay.">
    <img class="station-art" src="./media/night-station.webp" width="1536" height="1024" alt="Cutaway of the station. Six workshops share a central freight corridor." fetchpriority="high">
    <svg class="route-overlay" viewBox="0 0 720 480" aria-hidden="true" focusable="false">
      <g class="deck-floors">${Object.entries(BERTHS).map(([id,room])=>`<polygon class="bay-floor" data-action="floor" data-value="${id}" style="--signal:${room.color}" points="${room.floor}"/>`).join("")}</g>
      <path class="route-ink" d="${active.course}"/><path id="pilot-course" class="pilot-course" d="${active.course}"/>
      <g class="dispatch-token" transform="translate(${active.x} ${active.y})"><ellipse cx="-14" cy="-5" rx="16" ry="4" fill="#151123" opacity=".65"/><image href="./media/spool.webp" x="-35" y="-31" width="40" height="27"/></g>
    </svg>
    ${CASEBOOK.map((file,i)=>{
      const room=BERTHS[file.id],closed=filedIds.includes(file.id);
      return `<button class="berth-point station-pin" type="button" data-action="berth" data-value="${file.id}" data-filed="${closed}" style="--x:${room.x/720*100}%;--y:${room.y/480*100}%;--signal:${room.color}" aria-label="Select ${room.name}, ${file.title}${closed?", filed":""}" aria-pressed="${selected===file.id}"><span class="bay-no">${String(i+1).padStart(2,"0")}</span><span class="bay-name" aria-hidden="true">${room.name}</span></button>`;
    }).join("")}
  </div>`;
}

let trip;
export function dispatchAcross(plan,previous,target){
  if(!plan||!BERTHS[target])return;
  const route=BERTHS[target].course;
  plan.querySelector(".route-ink").setAttribute("d",route);
  plan.querySelector("#pilot-course").setAttribute("d",route);
  if(trip)cancelAnimationFrame(trip);
  const token=plan.querySelector(".dispatch-token");
  if(previous===target||window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    token.setAttribute("transform",`translate(${BERTHS[target].x} ${BERTHS[target].y})`);
    return;
  }
  const path=document.createElementNS("http://www.w3.org/2000/svg","path");
  path.setAttribute("d",travelBetween(previous,target));
  const length=path.getTotalLength(),duration=Math.max(450,Math.min(1450,length*2.8));
  let start;
  function move(time){
    if(!plan.isConnected)return;
    start??=time;
    const progress=Math.min(1,(time-start)/duration);
    const point=path.getPointAtLength(length*progress);
    token.setAttribute("transform",`translate(${point.x} ${point.y})`);
    if(progress<1)trip=requestAnimationFrame(move);
  }
  trip=requestAnimationFrame(move);
}
