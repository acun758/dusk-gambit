import { Chess } from "chess.js";
import fs from "fs";
import { AshbornEngine } from "/dev-server/src/core/engine/engine";
const eng = new AshbornEngine();
const rows = JSON.parse(fs.readFileSync("/tmp/pz/puzzles.json","utf8"));
const illegal:number[]=[], solutionBroken:number[]=[], mismatch:{id:number;want:string;best:string;margin:number}[]=[], narrow:{id:number;margin:number}[]=[];
let mateEnd=0; const margins:number[]=[];
for (const r of rows) {
  let c: Chess|null=null;
  try { c = new Chess(r.fen); } catch { illegal.push(r.id); continue; }
  const b = (c.board().flat().filter(Boolean) as any[]);
  if (b.filter(p=>p.type==='k'&&p.color==='w').length!==1 || b.filter(p=>p.type==='k'&&p.color==='b').length!==1) { illegal.push(r.id); continue; }
  if (b.some(p=>p.type==='p'&&(p.square[1]==='1'||p.square[1]==='8'))) { illegal.push(r.id); continue; }
  const g = new Chess(r.fen); let ok=true;
  for (const u of r.solution) { try { if(!g.move({from:u.slice(0,2),to:u.slice(2,4),...(u[4]?{promotion:u[4]}:{})})) ok=false; } catch { ok=false; } if(!ok) break; }
  if (!ok) { solutionBroken.push(r.id); continue; }
  if (g.isCheckmate()) mateEnd++;
  const roots = eng.analyzeRoot(r.fen, { depth: 6, movetimeMs: 2500 });
  const want = r.solution[0];
  const best = roots[0], second = roots[1];
  const margin = second ? best.cp - second.cp : 99999;
  margins.push(margin);
  if (best.uci !== want) mismatch.push({id:r.id, want, best:best.uci, margin});
  else if (margin < 200) narrow.push({id:r.id, margin});
}
margins.sort((a,b)=>a-b);
console.log(JSON.stringify({total:rows.length, illegal, solutionBroken, endsInMate:mateEnd, mismatch, narrow, medianMargin:margins[Math.floor(margins.length/2)]},null,1));
