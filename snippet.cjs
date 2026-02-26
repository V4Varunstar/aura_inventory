const fs=require('fs');
const lines=fs.readFileSync('services/firebaseService.ts','utf8').split('\n');
for(let i=972;i<978;i++){
  console.log((i+1)+': '+lines[i].replace(/ /g,'.'));
}

