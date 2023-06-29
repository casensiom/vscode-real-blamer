import * as vscode from 'vscode';
import * as fs from 'fs';
import { getBlameText } from './gitblame';

export default class BlamerContentProvider implements vscode.TextDocumentContentProvider {

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        let bestRoot: string = "";
        if (vscode.workspace.workspaceFolders) {
            bestRoot = vscode.workspace.workspaceFolders[0].uri.path;
        }

        let fileUri = vscode.Uri.file(uri.fsPath.replace('.blamer', ''));

        return getBlameText(fileUri.fsPath, bestRoot);
    }

}

