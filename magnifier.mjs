// The centre of the glass stays on the print. Its sample can reach the edge.
export function lensPosition(x,y,width,height,diameter,zoom=2.3){
  const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
  const px=clamp(x,0,1)*width,py=clamp(y,0,1)*height,r=diameter/2;
  return {left:clamp(px,r,Math.max(r,width-r)),top:clamp(py,r,Math.max(r,height-r)),
    imageWidth:width*zoom,imageHeight:height*zoom,offsetX:r-px*zoom,offsetY:r-py*zoom};
}

export function installMagnifier(dialog){
  let x=.5,y=.5;
  const active=()=>dialog.querySelector(".print-surface.magnified");
  function paint(surface){
    const lens=surface.querySelector(".optical-lens"),image=surface.querySelector("img");
    const pos=lensPosition(x,y,surface.clientWidth,surface.clientHeight,lens.offsetWidth);
    lens.style.left=`${pos.left}px`;lens.style.top=`${pos.top}px`;
    lens.style.backgroundImage=`url("${image.currentSrc||image.src}")`;
    lens.style.backgroundSize=`${pos.imageWidth}px ${pos.imageHeight}px`;
    lens.style.backgroundPosition=`${pos.offsetX}px ${pos.offsetY}px`;
  }
  function sample(e){
    const surface=active();
    if(!surface||!surface.contains(e.target))return;
    const bounds=surface.getBoundingClientRect();
    x=Math.max(0,Math.min(1,(e.clientX-bounds.left)/bounds.width));
    y=Math.max(0,Math.min(1,(e.clientY-bounds.top)/bounds.height));paint(surface);
  }
  dialog.addEventListener("click",e=>{
    const toggle=e.target.closest('[data-action="magnifier"]');
    if(!toggle)return;
    const surface=dialog.querySelector(".print-surface");
    if(!surface)return;
    const on=surface.classList.toggle("magnified");
    toggle.setAttribute("aria-pressed",String(on));surface.tabIndex=on?0:-1;
    surface.setAttribute("aria-label",on?"Magnified photograph. Use the arrow keys to move the glass.":"Photograph detail");
    if(on){x=.5;y=.5;paint(surface);surface.focus({preventScroll:true});}
  });
  dialog.addEventListener("pointerdown",e=>{const surface=active();if(surface&&surface.contains(e.target)){surface.setPointerCapture(e.pointerId);sample(e);}});
  dialog.addEventListener("pointermove",sample);
  dialog.addEventListener("keydown",e=>{
    const surface=active();if(!surface||e.target!==surface)return;
    const step=.075;
    const move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
    if(!move)return;
    e.preventDefault();x=Math.max(0,Math.min(1,x+move[0]));y=Math.max(0,Math.min(1,y+move[1]));paint(surface);
  });
  window.addEventListener("resize",()=>{const surface=active();if(surface)paint(surface);});
}

