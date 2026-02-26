const fs=require('fs');
const lines=fs.readFileSync('services/firebaseService.ts','utf8').split('\n');
const line=lines[801];
console.log(line);
line.split('').forEach((ch,i)=>{ if(i<100) console.log(i,ch);});
