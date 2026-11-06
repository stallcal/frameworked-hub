const size=document.querySelector('#size');
const guest=document.querySelector('#guest'), result=document.querySelector('#poreResult');
function draw(){
  const diameter=Number(size.value), radius=diameter*6;
  guest.querySelector('circle').setAttribute('r',radius);
  document.querySelector('#sizeValue').textContent=diameter.toFixed(1)+' Å';
  const outcome=diameter>10?'outside':diameter>4?'window':'pass';
  // Stop at sphere tangency to the corner of a narrower opening.
  const stop=outcome==='outside'?12-Math.sqrt(radius**2-60**2):outcome==='window'?175-Math.sqrt(radius**2-24**2):405;
  guest.style.transform='translateX('+stop+'px)';
  const explanation={pass:'fits through the 4 Å window and reaches the second cavity.',window:'fits inside the 10 Å cavity, but exceeds the 4 Å opening and stops at the window.',outside:'exceeds the 10 Å cavity diameter and stops at the entrance.'};
  result.textContent='The '+diameter.toFixed(1)+' Å guest '+explanation[outcome];
  document.querySelector('#pore').setAttribute('aria-label',result.textContent);
}
size.addEventListener('input',draw);
draw();
