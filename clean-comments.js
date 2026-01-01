const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path.');
  process.exit(1);
}

try {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf8');

  const lines = content.split('\n');
  const cleanedLines = lines.filter(line => !line.trim().startsWith('//'));
  
  const newContent = cleanedLines.join('\n');

  fs.writeFileSync(absolutePath, newContent);
} catch (error) {
  process.exit(1);
}
