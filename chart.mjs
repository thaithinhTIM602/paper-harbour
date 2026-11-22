import { CASEBOOK } from "./cases.mjs";

// Chart coordinates run from the outer roadstead on the left into the basin.
export const BERTHS = {
  coffee: { x:356,y:108,label:"above",course:"M18 374 C92 368 145 365 210 361 S359 345 390 291 S403 204 374 156 Q362 135 356 108" },
  radio:  { x:538,y:144,label:"above",course:"M18 374 C103 368 156 365 219 360 S349 345 397 291 S451 221 476 195 Q508 165 538 144" },
  china:  { x:647,y:218,label:"above",course:"M18 374 C125 368 175 363 238 358 S374 329 420 291 S540 220 602 216 Q627 215 647 218" },
  citrus: { x:551,y:355,label:"below",course:"M18 374 C151 367 213 365 282 351 S397 306 440 308 Q493 307 551 355" },
  tea:    { x:195,y:379,label:"below",course:"M18 374 Q93 361 139 366 T195 379" },
  dynamo: { x:324,y:280,label:"above",course:"M18 374 C102 368 166 365 235 359 S350 329 349 307 Q348 293 324 280" }
};
const north="M84 -12H784V284L751 269 729 250 719 251 698 231 686 232 676 216 663 220 648 203 641 207 624 184 605 192 595 166 574 174 566 154 548 162 540 139 516 147 506 122 484 132 475 109 451 118 441 100 405 113 395 94 372 104 366 93 342 100 336 89 314 91 303 78 285 79 277 69 257 67 239 57 224 58 210 44 185 41 171 31 153 29 138 17 118 14Z";
const east="M784 210V477H298L321 448 340 439 354 425 377 420 388 410 408 404 425 389 446 387 457 371 476 380 488 363 502 370 516 355 533 363 546 348 560 355 574 345 586 359 599 351 617 354 626 338 642 341 651 326 666 323 682 307 698 304 709 289 720 286 733 270 736 256 752 243Z";
const west="M-15 153L15 167 31 173 51 174 65 184 85 187 99 199 117 198 132 208 163 217 183 230 207 232 224 245 249 247 262 258 285 256 302 267 324 260 345 263 349 274 336 279 326 288 305 290 294 301 277 300 258 312 244 311 228 326 210 326 200 336 178 337 162 345 144 340 128 344 115 336 92 337 72 326 54 328 35 316 15 312 -15 316Z";
const shore=north+east+west;
const warehouseRow=(x,y,n,angle,spacing=24)=>`<g transform="translate(${x} ${y}) rotate(${angle})">${Array.from({length:n},(_,i)=>`<use href="#yard-shed" x="${i*spacing}"/>`).join("")}</g>`;
function compass(){
  return `<g transform="translate(69 84)" aria-hidden="true"><circle r="24" fill="none" stroke="#9eb6ae" stroke-width=".6"/>
    <circle r="29" fill="none" stroke="#829c98" stroke-width=".45" stroke-dasharray="1 4"/>
    ${[0,90,180,270].map(turn=>`<g transform="rotate(${turn})"><path d="M0 -34 L4 0H0Z" fill="#d5d9bb"/><path d="M0 -34 L-4 0H0Z" fill="none" stroke="#cecead" stroke-width=".7"/></g>`).join("")}
    <g stroke="#bdbf9f" stroke-width=".8" fill="none"><path d="m-13 -13 13 9 13-9-9 13 9 13-13-9-13 9 9-13Z"/></g><circle r="2" fill="#e3d8af"/><text y="-40" text-anchor="middle" class="compass-n">N</text></g>`;
}
function shoreStreets(){
  const roads=[
    "M147 -19C245 75 327 38 421 59S633 107 718 218L795 272",
    "M228 -15C290 17 385 5 492 34S672 101 768 172",
    "M330 -12Q317 19 345 77M404 -4Q383 24 393 78M493 -20Q461 26 459 92M590 -20Q540 28 524 126M681 -8Q619 49 586 148M747 39Q691 85 634 186",
    "M-20 194Q42 180 104 212T227 258L332 272",
    "M-10 293Q62 320 119 310T234 278L305 273",
    "M17 171L2 289M70 181L55 330M121 198L111 338M170 219L169 338M228 238L210 315",
    "M344 455Q427 403 483 397T626 365Q699 341 782 270",
    "M409 472Q488 422 549 418T691 367Q742 340 780 329",
    "M478 470L450 391M541 466L505 374M609 465L568 354M685 461L626 348M749 434L678 311"
  ];
  return `<g clip-path="url(#dry-land)">
    <g fill="none" stroke="#b4c1a6" opacity=".45" stroke-width="4">${roads.map(d=>`<path d="${d}"/>`).join("")}</g>
    <g fill="none" stroke="#3c6469" stroke-width="2.4">${roads.map(d=>`<path d="${d}"/>`).join("")}</g>
    <g stroke="#c7cab0" stroke-width=".8" fill="#426a6b">
      ${warehouseRow(282,58,7,7,21)}${warehouseRow(406,78,6,16)}${warehouseRow(521,104,5,27)}${warehouseRow(611,145,5,37)}
      ${warehouseRow(380,27,9,12,22)}${warehouseRow(502,35,8,20,25)}${warehouseRow(556,-2,6,19)}
      ${warehouseRow(150,250,6,6,20)}${warehouseRow(27,222,5,13,22)}${warehouseRow(36,278,4,5,20)}
      ${warehouseRow(442,401,6,-8,22)}${warehouseRow(548,397,6,-19,24)}${warehouseRow(653,352,5,-33,21)}${warehouseRow(534,441,7,-15,25)}
    </g>
    <g fill="none" stroke="#d0c8a6" stroke-width="1.1"><path d="M254 1Q379 10 477 52T711 178Q730 199 769 217"/>
      <path d="M254 5Q379 14 475 56T708 181Q727 201 768 220"/>
      <path d="M450 40Q539 57 579 94T705 169M470 49Q551 70 581 100"/><path d="M16 244L161 271Q220 285 310 270"/></g>
    <g fill="#30575b" stroke="#b9bd9f" stroke-width="1"><circle cx="606" cy="52" r="8"/><circle cx="627" cy="58" r="8"/><circle cx="608" cy="72" r="7"/>
      <circle cx="236" cy="282" r="6"/><circle cx="252" cy="282" r="6"/><circle cx="243" cy="295" r="5"/></g></g>`;
}
export function chartDrawing(selected,filedIds=[]){
  return `<div class="plot" role="group" aria-label="Six berths on the Ledgerwick harbour chart">
    <svg viewBox="0 0 760 450" preserveAspectRatio="none" class="hydrograph" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="graticule" width="75" height="75" patternUnits="userSpaceOnUse"><path d="M75 0H0V75" fill="none" stroke="#9ab7b4" stroke-width=".55" opacity=".37"/><path d="M34 37.5h7m-3.5-3.5v7" fill="none" stroke="#9ab7b4" stroke-width=".6" opacity=".48"/></pattern>
        <pattern id="hatching" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(23)"><path d="M0 0v5" stroke="#b1c3ae" opacity=".3" stroke-width=".9"/></pattern>
        <pattern id="tide-marks" width="17" height="9" patternUnits="userSpaceOnUse"><path d="M1 4l2 -1 3 1 3 -1" stroke="#c1c7ab" opacity=".52" fill="none" stroke-width=".7"/></pattern>
        <path id="coast" d="${shore}"/><clipPath id="dry-land"><use href="#coast"/></clipPath>
        <g id="yard-shed"><path d="M0 0h14v9H0zm0 4.5h14"/><path d="M3 0v9m8-9v9" stroke-width=".4"/></g>
        <g id="plan-ship" stroke="#c5c9b0" stroke-width=".85" fill="#254c56"><path d="M-24 0q3-5 10-5h24q10 1 16 5-7 4-16 5h-24q-7 0-10-5Z"/><path d="M-17-2h7v4h-7zm10 0h6v4h-6zm10-1h7v6H3zm10 1h5v4h-5Z"/></g>
        <g id="plan-crane" stroke="#e1d8b7" stroke-width="1.1" fill="none"><circle r="3.3"/><path d="m-2-2 5 2 13-18-16 16zm5 1 9-12M15-17l2 1"/><path d="M-5 3h10" stroke-width="1.8"/></g>
        <g id="long-store" fill="#355960" stroke="#c9c9a9" stroke-width=".95"><path d="M0 0h38v13H0zM0 0l6 6 26 0 6-6m0 13-6-7M0 13l6-7"/><path d="M13 0v13m12-13v13" stroke-width=".5"/></g>
        <g id="harbour-light" stroke="#dfbd80" stroke-width=".9" fill="#173946"><circle r="2.4"/><path d="M0-9v4m4-3-2 4m5-1-3 2"/></g>
      </defs>
      <rect width="760" height="450" fill="url(#graticule)"/>
      <g fill="none" stroke="#789e9f" opacity=".62" stroke-width=".85">
        <path d="M-10 113C34 126 58 157 106 167S174 204 226 209 294 228 339 235 387 265 365 294 320 326 279 342 210 365 156 365 72 362-9 338"/>
        <path d="M-9 127C39 140 64 168 108 178S178 212 229 219 290 239 334 245 373 262 356 284 319 315 279 329 201 356 157 355 64 349-10 326"/>
        <path d="M94 -16C158 47 198 54 244 78S319 108 366 119 455 130 500 158 545 174 583 199 629 228 671 251 718 275 734 304"/>
        <path d="M70 -15C138 58 186 67 234 87S319 119 364 130 445 143 493 167 542 185 576 207 624 242 664 260 700 283 714 304"/>
        <path d="M36 -10C98 71 151 78 213 103S290 134 354 151 442 160 482 183 554 211 595 245 633 274 668 284"/>
        <path d="M283 460Q349 421 401 397T494 349Q521 333 556 336T623 322Q674 301 700 270"/>
        <path d="M247 467Q334 412 390 388T479 340Q518 320 547 324T616 313Q669 290 692 260"/>
        <path d="M224 460Q320 405 376 378T468 330Q508 305 549 311T610 301" stroke-dasharray="2 5"/>
      </g>
      <path d="M-2 346q55 14 88 14l38 8-47 2-52-10zm395 54 42-25 25-6-24 17z" fill="url(#tide-marks)"/>
      <use href="#coast" fill="#3c6368" stroke="#c8cbb4" stroke-width="1.6"/><use href="#coast" fill="url(#hatching)"/>
      ${shoreStreets()}
      <g clip-path="url(#dry-land)"><use href="#long-store" transform="translate(531 86) rotate(22)"/><use href="#long-store" transform="translate(487 74) rotate(19)"/>
        <use href="#long-store" transform="translate(536 379) rotate(-12)"/><use href="#long-store" transform="translate(568 369) rotate(-13)"/>
        <g fill="none" stroke="#b5c4ad" stroke-width=".9"><path d="M280 270h14v13h-14zm0 0 14 13m-14 0 14-13"/><circle cx="275" cy="278" r="4"/>
        <path d="M642 104l19 12-8 11-18-12zm-7 13 17 11m-8-19 13 8"/></g></g>
      <use href="#plan-crane" transform="translate(633 193) rotate(-97)"/><use href="#plan-crane" transform="translate(659 214) rotate(-103)"/>
      <use href="#plan-crane" transform="translate(345 99) rotate(154) scale(.8)"/><use href="#plan-crane" transform="translate(318 270) rotate(115) scale(.8)"/>
      <g fill="none" stroke="#cbd0b4" stroke-width="1"><path d="m352 104 14 24 5-3-12-23m48 10 8 19 4-2-8-19m116 34 13 22 4-2-13-22m100 49 15 20 4-3-13-20m-293 63 10-6m201 76 10-19 4 3-10 19M32 314q74 41 106 39l18-1m-126-36q75 41 109 39"/>
      <path d="M519 354q11-19 21-22l23-5" stroke="#cbbf9c" stroke-dasharray="2 2"/></g>
      <use href="#plan-ship" transform="translate(414 137) rotate(68) scale(.70)"/><use href="#plan-ship" transform="translate(575 185) rotate(54) scale(.76)"/>
      <use href="#plan-ship" transform="translate(477 354) rotate(-19) scale(.76)"/><use href="#plan-ship" transform="translate(226 378) rotate(-12) scale(.62)"/>
      <use href="#harbour-light" transform="translate(156 352)"/><use href="#harbour-light" transform="translate(350 270)"/>
      ${compass()}
      <g class="chart-geography"><text x="315" y="189" transform="rotate(16 315 189)">LEDGERWICK REACH</text><text x="106" y="270" transform="rotate(9 106 270)">Foundry Point</text><text x="620" y="420" transform="rotate(-19 620 420)">East Basin</text></g>
      <path id="pilot-course" class="pilot-course" d="${BERTHS[selected].course}" fill="none"/>
    </svg>
    ${CASEBOOK.map((f,i)=>{
      const p=BERTHS[f.id],closed=filedIds.includes(f.id);
      return `<button type="button" class="berth-point label-${p.label}" style="--x:${p.x/760*100}%;--y:${p.y/450*100}%" aria-label="Select ${f.berth}, ${f.title}${closed?", filed":""}" aria-pressed="${selected===f.id}" data-filed="${closed}" data-action="berth" data-value="${f.id}"><span class="pin">${String(i+1).padStart(2,"0")}</span><span class="pin-name" aria-hidden="true">${f.berth}</span></button>`;
    }).join("")}
  </div>`;
}

