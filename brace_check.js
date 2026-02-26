const fs=require('fs');
const path='services/firebaseService.ts';
const data=fs.readFileSync(path,'utf8').split('\n');
let start=800;
let count=0;
let stack=[];
data.slice(start).forEach((line, idx)=>{
  let s=line.replace(/(\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^\\'])*'|(?:\\.|[^\\])*)/g,m=> ' '.repeat(m.length));
  for(let j=0;j<s.length;j++){
    const ch=s[j];
    if(ch==='{'){
      count++;
      stack.push({line:start+idx+1,col:j});
    } else if(ch==='}'){
      if(count>0){count--;stack.pop();} else {console.log('extra closing at',start+idx+1,j);}
    }
  }
});
console.log('remaining open',count);
console.log('stack top',stack.slice(-5));
