import * as vscode from 'vscode';
import * as fs from 'fs';


export async function openBlamer(filePath: string, hash: string) {
    if (typeof filePath === 'undefined') {
        return;
    }

    if (!fs.existsSync(filePath)) {
        return;
    }

    let fileUri = buildUri(filePath, hash);

    let doc = await vscode.workspace.openTextDocument(fileUri);
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

export function validScheme(path: vscode.Uri) : boolean {
    return path.scheme === "blamer";
}

export function buildUri(path: string, hash: string) : vscode.Uri {
    let fileUri = vscode.Uri.file(setName(path));
    return fileUri.with({ scheme: 'blamer', query: 'hash', fragment: hash});
}