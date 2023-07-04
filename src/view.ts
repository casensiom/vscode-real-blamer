import * as vscode from 'vscode';
import * as fs from 'fs';


export async function openBlamer(filePath: string, hash: string) {
    if (typeof filePath === 'undefined') {
        return;
    }

    if (!fs.existsSync(filePath)) {
        return;
    }

    let fileUri = vscode.Uri.file(setName(filePath));

    // This configuration will call the provider to fill the content,
    // and the decorator to fill the decorations
    let uri = fileUri.with({ scheme: 'blamer', query: 'hash', fragment: hash});

    let doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
}

export function setName(path:string) : string {
    return path;
    // return path.concat('.blamer');
}

export function cleanName(path:string) : string {
    return path;
    // return path.replace('.blamer', '');
}
