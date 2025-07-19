#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('Starting Next.js dev server with 15-second timeout...\n');

let stdout = '';
let stderr = '';

const devProcess = spawn('npm', ['run', 'dev'], {
  shell: true
});

// Capture stdout
devProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdout += output;
  process.stdout.write(output);
});

// Capture stderr
devProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderr += output;
  process.stderr.write(output);
});

const timeout = setTimeout(() => {
  console.log('\n✅ Dev server test completed successfully (15s timeout reached)');
  devProcess.kill('SIGTERM');
  process.exit(0);
}, 15000);

devProcess.on('error', (error) => {
  clearTimeout(timeout);
  console.error('\n❌ Dev server spawn error:', error.message);
  process.exit(1);
});

devProcess.on('exit', (code) => {
  clearTimeout(timeout);
  
  if (code === 0) {
    console.log('\n✅ Dev server exited successfully');
  } else {
    console.log(`\n❌ Dev server exited with code ${code}`);
    
    if (stderr) {
      console.log('\n📋 STDERR OUTPUT:');
      console.log(stderr);
    }
    
    if (stdout) {
      console.log('\n📋 STDOUT OUTPUT:');
      console.log(stdout);
    }
  }
  
  process.exit(code);
});