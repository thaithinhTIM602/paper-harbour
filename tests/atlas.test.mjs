import test from "node:test";
import assert from "node:assert/strict";
import { CASEBOOK } from "../cases.mjs";
import { BERTHS, chartDrawing } from "../chart.mjs";
import { cover, selectedFile, chartDocket, photograph } from "../press.mjs";
import { caseRoom } from "../desk.mjs";
import { newOffice, resolveFile, fileRuling, readOffice, wireCode } from "../office.mjs";
import { lensPosition } from "../magnifier.mjs";

const record = f => ({ offset:0, marks:[f.lots[0].mark], facts:["policy.cover"] });

test("every harbour course ends at the berth that opens its case",()=>{
  assert.deepEqual(Object.keys(BERTHS).sort(),CASEBOOK.map(f=>f.id).sort());
  for(const file of CASEBOOK){
    const {x,y,course}=BERTHS[file.id];
    assert.ok(x>0&&x<760&&y>0&&y<450);
    assert.ok(course.endsWith(`${x} ${y}`));
    const chart=chartDrawing(file.id);
    assert.equal((chart.match(/data-action="berth"/g)||[]).length,6);
    assert.equal((chart.match(/aria-pressed="true"/g)||[]).length,1);
    assert.ok(chart.includes(`aria-label="Select ${file.berth}, ${file.title}" aria-pressed="true"`));
    assert.ok(chart.includes(`class="pilot-course" d="${course}"`));
    assert.ok(chartDocket(newOffice(),resolveFile(file.id)).includes(`#file/${file.id}/table`));
  }
});

test("the chart restores an unfinished summer claim and respects an explicitly selected berth",()=>{
  const s=newOffice();
  assert.equal(selectedFile(s).id,"coffee");
  const draft=resolveFile("china");
  s.drafts[draft.id]=record(draft);
  const reopened=readOffice(JSON.stringify(s));
  assert.equal(selectedFile(reopened).id,"china");
  assert.equal(selectedFile(reopened,"an unknown port").id,"china");
  assert.match(cover(reopened),/Resume your file/);
  assert.match(cover(reopened,"tea"),/href="#file\/tea\/table"/);
});

test("filed berths reopen their receipts and wire rulings never mark the summer chart",()=>{
  const s=newOffice(),wire=resolveFile(wireCode("coffee",125));
  assert.ok(fileRuling(s,wire,record(wire)));
  assert.doesNotMatch(cover(s),/data-filed="true"|class="filed-key"/);
  const coffee=resolveFile("coffee");
  assert.ok(fileRuling(s,coffee,record(coffee)));
  const html=cover(readOffice(JSON.stringify(s)),"coffee");
  assert.equal((html.match(/data-filed="true"/g)||[]).length,1);
  assert.ok(html.includes(`aria-label="Select ${coffee.berth}, ${coffee.title}, filed"`));
  assert.ok(html.includes('href="#file/coffee/receipt">Read filed ruling'));
  for(const f of CASEBOOK.slice(1)){
    const file=resolveFile(f.id);
    fileRuling(s,file,record(file));
  }
  assert.match(cover(s),/6 of six claims filed/);
  assert.match(cover(s),/Read the closing book/);
});

test("printed cargo marks respond to alignment and leave a circle in the signed file",()=>{
  const f=resolveFile("coffee"),s=newOffice(),mark=f.lots[0].mark;
  const buttons=html=>[...html.matchAll(/<button[^>]+data-action="printed-mark"[^>]*>/g)].map(m=>m[0]);
  assert.ok(buttons(caseRoom(s,f,"table")).every(b=>b.includes("disabled")));
  s.drafts[f.id]=record(f);
  const aligned=buttons(caseRoom(s,f,"table"));
  assert.equal(aligned.length,f.lots.length);
  assert.ok(aligned.every(b=>!b.includes("disabled")));
  assert.ok(aligned.find(b=>b.includes(`data-value="${mark}"`)).includes('aria-pressed="true"'));
  assert.ok(fileRuling(s,f,s.drafts[f.id]));
  const sealed=caseRoom(s,f,"table");
  assert.equal(buttons(sealed).length,0);
  assert.equal((sealed.match(/class="record-row sealed-mark" data-clipped="true"/g)||[]).length,1);
});

test("turning a print over preserves the distinction between the Liverpool archive and the fictional case",()=>{
  const archive=photograph(null),credit=photograph(null,true);
  assert.match(archive,/vigilant-quay\.webp/);
  assert.match(archive,/Magnify detail/);
  assert.match(credit,/Mersey Docks and Harbour Board/);
  assert.match(credit,/pg72045-images\.html#il_102/);
  for(const f of CASEBOOK){
    const file=resolveFile(f.id),back=photograph(file,true);
    assert.ok(photograph(file).includes(`./media/${file.image}.webp`));
    assert.ok(back.includes(file.note));
    assert.match(back,/fictional Ledgerwick casebook/);
    assert.doesNotMatch(back,/Mersey Docks/);
  }
});

test("moving the glass samples the actual print at the centre and along its edges",()=>{
  assert.deepEqual(lensPosition(.5,.5,400,200,100,2),{
    left:200, top:100, imageWidth:800, imageHeight:400, offsetX:-350, offsetY:-150
  });
  const corner=lensPosition(1.2,-1,400,200,100,2);
  assert.deepEqual([corner.left,corner.top,corner.offsetX,corner.offsetY],[350,50,-750,50]);
  const resized=lensPosition(.25,.75,200,100,40,3);
  assert.deepEqual([resized.left,resized.top,resized.offsetX,resized.offsetY],[50,75,-130,-205]);
});

