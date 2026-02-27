#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const replDomain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAIN || '';

const env = Object.assign({}, process.env);
if (replDomain) {
  env.EXPO_PACKAGER_PROXY_URL = `https://${replDomain}`;
  env.REACT_NATIVE_PACKAGER_HOSTNAME = replDomain;
  env.EXPO_PUBLIC_DOMAIN = `${replDomain}:5000`;
}


// Prefer the local `expo` binary in node_modules/.bin for reliability.
const expoBin = process.platform === 'win32' ? 'expo.cmd' : 'expo';
const cmd = path.resolve(__dirname, '..', 'node_modules', '.bin', expoBin);
const args = ['start', '--localhost'];

const useShell = process.platform === 'win32';
const child = spawn(cmd, args, { stdio: 'inherit', env, shell: useShell });

child.on('error', (err) => {
  console.error('Failed to spawn npx:', err);
  process.exit(1);
});

child.on('exit', (code) => process.exit(code));
