import * as path from 'path';
import * as vscode from 'vscode';
import * as net from 'net';

import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // https://github.com/microsoft/vscode-languageserver-node/issues/662
    // ???
    console.log('Activating WebDSL extension!');
    let serverOptions = () => {
        console.log('WebDSL extension connecting!');
        let socket = net.connect({ port: 1337, host: "0" });
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
    if (!client) {
        return undefined;
    }

    return client.stop();
}