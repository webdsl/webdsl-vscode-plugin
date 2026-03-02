import * as path from 'path';
import * as vscode from 'vscode';
import * as net from 'net';
import { ChildProcess, exec } from 'child_process';
import * as readline from 'readline';

import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;
let serverProcess: ChildProcess;

export async function activate(context: vscode.ExtensionContext) {
    const serverJar = context.asAbsolutePath(path.join('resources', 'webdsl-lsp-1.0.0.jar'));
    console.log(`Path to WebDSL LSP server jar: ${serverJar}`);
    serverProcess = exec(`java -Xss8m -jar ${serverJar}`);
    console.log(`LSP server started as a process with PID ${serverProcess.pid}`);
    
    const rl = readline.createInterface({ input: serverProcess.stdout! });
    const line: string = await new Promise((resolve, reject) => {
        rl.once('line', resolve);
    });
    rl.close();
    
    const rle = readline.createInterface({ input: serverProcess.stderr! });
    rle.on('line', line => {
        console.log(`[Server Error] ${line}`);
    });
    
    const port = parseInt(line.match(/port (\d+)!/)![1]);

    const serverOptions = () => {
        const socket = net.connect({ port, host: "0" });
        const result: StreamInfo = {
            writer: socket,
            reader: socket
        };
        return Promise.resolve(result);
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'webdsl' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.*')
        }
    }

    client = new LanguageClient(
        'webdslLanguageClient',
        serverOptions,
        clientOptions
    );

    client.start();
}

export async function deactivate() {
    const result = client ? await client.stop() : undefined;

    if (serverProcess) {
        serverProcess.kill();
    }

    return result;
}
