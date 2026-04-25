import fs from 'fs';

const content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const lines = content.split('\n');

let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<[a-zA-Z]/g) || []).length;
  const closes = (line.match(/<\/[a-zA-Z]/g) || []).length;
  const selfCloses = (line.match(/\/>/g) || []).length;
  
  depth += opens - closes - selfCloses;
  
  if (i > 320) {
    console.log(`Line ${i + 1}: depth=${depth} | ${line.trim()}`);
  }
}

console.log(`Final depth: ${depth}`);
