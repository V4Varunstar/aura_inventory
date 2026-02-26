const fs=require('fs');
const path='services/firebaseService.ts';
const data=fs.readFileSync(path,'utf8').split('\n');
let start=800;
let count=0;
let stack=[];

data.slice(start).forEach((line, idx)=>{
  for(let j=0;j<line.length;j++){
    const ch=line[j];
    if(ch==='{'){
      count++;
      stack.push({line:start+idx+1,col:j});
    } else if(ch==='}'){
      if(count>0){
        const popped=stack.pop();
        count--;
        // log when we pop near the close we care about
        if(start+idx+1 >= 1000){
          console.log('pop at line',start+idx+1,'col',j,'popped',popped);
        }
      } else {console.log('extra closing at',start+idx+1,j);}
    }
  }
});
console.log('remaining open',count);
console.log('stack top',stack.slice(-5));

