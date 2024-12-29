const subProcess = require('child_process');
const fs = require('fs');

subProcess.spawnSync('cd ../../packages/runtime && npm run build');
const buildFramework = fs.readFileSync("../../packages/runtime/dist/index.js");
fs.writeFileSync("./k.js", buildFramework);
subProcess.spawnSync('npx',[
    'http-server',
    '-o',
    './',
    '-bg'
]);
