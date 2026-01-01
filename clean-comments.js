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

  // Remove lines that start with // (allowing for whitespace)
  // We keep lines that have code and then a comment (e.g. "const x = 1; // comment") for safety
  const lines = content.split('\n');
  const cleanedLines = lines.filter(line => !line.trim().startsWith('//'));
  
  const newContent = cleanedLines.join('\n');

  fs.writeFileSync(absolutePath, newContent);
  console.log(`Successfully removed full-line comments from ${filePath}`);

} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}
