// GlamourOS Backend Server entry wrapper
// Compiles and boots src/server.ts dynamically using ts-node
try {
  require('ts-node').register({
    transpileOnly: true
  });
  require('./server.ts');
} catch (err) {
  console.log('⚡ Running Compiled Server Production Build...');
  require('../dist/server.js');
}
