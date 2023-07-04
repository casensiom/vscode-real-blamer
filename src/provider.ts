import * as vscode from 'vscode';
import * as fs from 'fs';
import { getBlameText } from './gitblame';
import { cleanName } from './view';
import BlameProvider from './blameProvider';

export default class BlamerContentProvider implements vscode.TextDocumentContentProvider {

    async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        let bestRoot: string = "";
        if (vscode.workspace.workspaceFolders) {
            bestRoot = vscode.workspace.workspaceFolders[0].uri.path;
        }
        const hash = uri.fragment;
        const info = await BlameProvider.instance().getBlameInfo(uri, hash);
        return info?.info.lines.map(l => { return l.content; }).join('\n') ?? "";
    }

    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    update(uri: vscode.Uri) {
        this.onDidChangeEmitter.fire(uri);
    }
}

