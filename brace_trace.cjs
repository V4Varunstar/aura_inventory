const fs=require('fs');
const lines=fs.readFileSync('services/firebaseService.ts','utf8').split('\n');
let count=0;
lines.forEach((l,i)=>{
  let opens=(l.split('{').length-1);
  let closes=(l.split('}').length-1);
  count+=opens-closes;
  if(i<820 || (i>800 && i<840) || i>1080) console.log(i+1,opens,closes,count,l);
});
console.log('final',count);

