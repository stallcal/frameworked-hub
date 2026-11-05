const size=document.querySelector('#size'), prediction=document.querySelector('#prediction');
const guest=document.querySelector('#guest'), result=document.querySelector('#poreResult');
function move(x){guest.style.transform='translateX('+x+'px)'}
function prepare(){
  guest.querySelector('circle').setAttribute('r',Number(size.value)*6);
  move(-65);prediction.value='';
  result.textContent='Compare the '+size.value+' Å probe with the cavity and window.';
}
size.onchange=prepare;
document.querySelector('#poreForm').onsubmit=event=>{
  event.preventDefault();
  const diameter=Number(size.value), radius=diameter*6;
  const outcome=diameter>10?'outside':diameter>4?'window':'pass';
  // Tangency to the corner of the narrower opening stops the sphere.
  const stop=outcome==='outside'?12-Math.sqrt(radius**2-60**2):outcome==='window'?175-Math.sqrt(radius**2-24**2):405;
  move(stop);
  const explanation={pass:'The 3 Å guest fits through the 4 Å window and reaches the second cavity.',window:'The 6 Å guest fits inside the 10 Å cavity. Its diameter exceeds the 4 Å opening, so it stops at the window.',outside:'The 11 Å guest exceeds even the 10 Å cavity diameter. It stops at the entrance.'};
  result.textContent=(prediction.value===outcome?'Correct. ':'Observe where the probe stops. ')+explanation[outcome];
};
prepare();

document.querySelector('#testProbe').disabled=false;
