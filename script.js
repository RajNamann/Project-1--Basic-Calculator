const exprEl = document.getElementById('expression');
const resEl  = document.getElementById('result');
const histEl = document.getElementById('hist');
const degRad = document.getElementById('degRad');

let memory = 0;
let angleMode = 'DEG';

const setExpr=(v)=>{exprEl.value=v;liveEval();}
const append=(t)=>{exprEl.setRangeText(t,exprEl.selectionStart,exprEl.selectionEnd,'end');liveEval();exprEl.focus();}

function backspace(){
  if(exprEl.selectionStart!==exprEl.selectionEnd){append('');return;}
  const pos=exprEl.selectionStart;
  if(pos>0){exprEl.setRangeText('',pos-1,pos,'end');liveEval();}
}

function clearAll(){ setExpr(''); resEl.value=''; }
function clearEntry(){ setExpr(exprEl.value.replace(/([0-9.]+|[)eπ]+)$/,'')); }
function toggleSign(){ append('-'); }
function insertConst(c){ append(c==='PI'?'π':'e'); }

function fact(n){if(n<0||!Number.isFinite(n))return NaN;let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
function toRad(x){return angleMode==='DEG'?x*Math.PI/180:x;}

function transformPercent(expr){return expr.replace(/(\d+(\.\d+)?)%/g,'($1/100)');}

function sanitize(expr){
  let s=expr.replace(/π/g,'Math.PI').replace(/\be\b/g,'Math.E');
  s=s.replace(/\^/g,'**');
  s=transformPercent(s);
  s=s.replace(/\bsin\(/g,'Math.sin(toRad(')
     .replace(/\bcos\(/g,'Math.cos(toRad(')
     .replace(/\btan\(/g,'Math.tan(toRad(')
     .replace(/\blog\(/g,'Math.log10(')
     .replace(/\bln\(/g,'Math.log(')
     .replace(/sqrt\(/g,'Math.sqrt(');
  return s;
}

function evalSafe(input){
  try{
    const code=sanitize(input);
    return Function('Math','toRad','fact',`"use strict";return(${code})`)(Math,toRad,fact)
  }catch{return NaN}
}

function liveEval(){
  const v=exprEl.value.trim();
  if(!v)return resEl.value='';
  const r=evalSafe(v);
  resEl.value=Number.isFinite(r)?r:'Error';
}

function equals(){
  const v=exprEl.value.trim();
  const r=evalSafe(v);
  if(!Number.isFinite(r))return resEl.value='Error';
  addHistory(v,r);
  setExpr(String(r));
}

function addHistory(exp,res){
  const row=document.createElement('div');
  row.className='hist-item';
  row.innerHTML=`<div>${exp}</div><div>${res}</div>`;
  row.onclick=()=>setExpr(String(res));
  histEl.prepend(row);
}

function memRead(){ setExpr(String(memory)); }
function memClear(){ memory=0; }
function memPlus(){ memory+=evalSafe(exprEl.value||resEl.value||0); }
function memMinus(){ memory-=evalSafe(exprEl.value||resEl.value||0); }

function applyFunction(name){
  const map={sin:`sin(`,cos:`cos(`,tan:`tan(`,log:`log(`,ln:`ln(`,sqrt:`sqrt(`};
  if(map[name]) append(map[name]);
  if(name==='sq') append('^2');
  if(name==='cube') append('^3');
  if(name==='cuberoot') append('^(1/3)');
  if(name==='inv') append('1/(');
  if(name==='fact') append('!');
}

document.querySelectorAll('[data-insert]').forEach(b=>b.onclick=()=>append(b.dataset.insert));
document.querySelectorAll('[data-fn]').forEach(b=>b.onclick=()=>applyFunction(b.dataset.fn));
document.querySelectorAll('[data-const]').forEach(b=>b.onclick=()=>insertConst(b.dataset.const));
document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.key;
  if(k==='=') equals();
  if(k==='AC') clearAll();
  if(k==='CE') clearEntry();
  if(k==='BACK') backspace();
  if(k==='MR') memRead();
  if(k==='MC') memClear();
  if(k==='M+') memPlus();
  if(k==='M-') memMinus();
  if(k==='%') append('%');
  if(k==='SIGN') toggleSign();
});

exprEl.oninput=liveEval;
exprEl.onkeydown=(e)=>{
  if(e.key==='Enter'){e.preventDefault();equals();}
  if(e.key==='Escape'){e.preventDefault();clearAll();}
};

function setAngle(mode){
  angleMode=mode;
  degRad.classList.toggle('rad',mode==='RAD');
  degRad.dataset.label=mode;
}
degRad.onclick=()=>setAngle(angleMode==='DEG'?'RAD':'DEG');
setAngle('DEG');
