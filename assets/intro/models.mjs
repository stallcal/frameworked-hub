export function superposition(x,w,phase){const a=Math.sqrt(1-w)*Math.SQRT2*Math.sin(Math.PI*x),b=Math.sqrt(w)*Math.SQRT2*Math.sin(2*Math.PI*x);return {re:a+b*Math.cos(phase),im:b*Math.sin(phase),density:a*a+b*b+2*a*b*Math.cos(phase)};}
export function mixing(delta,v){const split=Math.hypot(delta,2*v);return {lower:(delta-split)/2,upper:(delta+split)/2,a:split===0?null:(1+delta/split)/2};}
export function franckCondon(s,count=21){const p=[Math.exp(-s)];for(let n=1;n<count;n++)p.push(p[n-1]*s/n);return p;}
const sigmoid=(x,c,k)=>1/(1+Math.exp(-k*(x-c)));
const step=(x,c,k)=>(sigmoid(x,c,k)-sigmoid(0,c,k))/(sigmoid(1,c,k)-sigmoid(0,c,k));
// Illustrative shape functions only: not thermodynamic fits or measured uptake.
export function isotherm(type,x,desorption=false){
 const knee=(1-Math.exp(-12*x))*.24;
 switch(type){
 case 'I':return (1-Math.exp(-30*x))/(1-Math.exp(-30));
 case 'II':return knee+.76*x**3;
 case 'III':return x**2.5;
 case 'IV':return knee+.72*step(x,desorption?.46:.66,28);
 case 'V':return .96*step(x,desorption?.48:.69,22);
 case 'VI':return (step(x,.2,65)+step(x,.48,65)+step(x,.76,65))/3;
 }
}
