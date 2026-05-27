const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'glamouros', 'frontend');
const destDir = __dirname;

// Helper to copy folder recursively
function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      if (file !== '.next' && file !== 'node_modules') {
        copyFolderRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('🚀 Moving GlamourOS Frontend files to the root directory...');
if (fs.existsSync(sourceDir)) {
  copyFolderRecursive(sourceDir, destDir);
  console.log('✅ Success! GlamourOS Frontend files are now at the root.');
} else {
  console.error('❌ Error: glamouros/frontend folder not found!');
  process.exit(1);
}
