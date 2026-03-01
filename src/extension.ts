import * as path from 'path';
import * as vscode from 'vscode';
import * as net from 'net';
import { ChildProcess, exec } from 'child_process';
import * as readline from 'readline';

import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;
let serverProcess: ChildProcess;

export async function activate(context: vscode.ExtensionContext) {
    // https://github.com/microsoft/vscode-languageserver-node/issues/662
    // ???
    console.log('Activating WebDSL extension!!!');
    // serverProcess = exec("java -jar /home/ksaweryr/uni/weblab/LspSandbox/app/build/libs/webdsl-lsp-1.0.0.jar");
    // const rl = readline.createInterface({ input: serverProcess.stdout! });
    // const line: string = await new Promise((resolve, reject) => {
    //     rl.once('line', resolve);
    // });
    // console.log(`Received line: ${line}`);
    // const port = parseInt(line.match(/port (\d+)!/)![1]);
    const port = 1337;
    let serverOptions = () => {
        console.log('WebDSL extension connecting!');
        let socket = net.connect({ port, host: "0" });
        let result: StreamInfo = {
            writer: socket,
            reader: socket
        };
        return Promise.resolve(result);
    };

    let clinetOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'webdsl' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.*')
        }
    }

    client = new LanguageClient(
        'webdslLanguageClient',
        serverOptions,
        clinetOptions
    );

    client.start();
}

export function deactivate() {
    const result = client ? client.stop() : undefined;

    if (serverProcess) {
        serverProcess.kill();
    }

    return result;
}
