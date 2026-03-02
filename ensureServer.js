const fs = require('fs');
const https = require('https');
const path = require('path');

const resourcesDir = path.resolve('resources');
const lspServerJar = path.resolve(resourcesDir, 'webdsl-lsp-1.0.0.jar');

console.log('Ensuring WebDSL LSP server jar exists...');

if (!fs.existsSync(lspServerJar)) {
    console.log('WebDSL LSP server jar not found.');

    if (!fs.existsSync(resourcesDir)) {
        console.log('Creating resources dir...')
        fs.mkdirSync(resourcesDir);
    }

    console.log('Downloading WebDSL LSP server...');

    const lspServerFile = fs.createWriteStream(lspServerJar);
    https.get('https://update.webdsl.org/compiler/webdsl-lsp-1.0.0.jar', resp => {
        resp.pipe(lspServerFile);
    });
}
