const fs = require('fs');
const path = require('path');

function write(rel, text) {
  const full = path.join(__dirname, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text, 'utf8');
  console.log('OK: ' + rel);
}
module.exports = { write };
