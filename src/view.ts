import * as vscode from 'vscode';
import * as fs from 'fs';


export function decorate(editor: vscode.TextEditor) {

    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: "green",
        // border: "2px solid white",
        gutterIconSize: 'contain',
        overviewRulerLane: vscode.OverviewRulerLane.Left
    });


    const decorations: vscode.DecorationOptions[] = [];
    for (let lineNumber = 0; lineNumber < editor.document.lineCount; lineNumber++) {
        const line = editor.document.lineAt(lineNumber);
        const range = new vscode.Range(line.range.start, line.range.start); // Rango de la línea actual
        //const range = new vscode.Range(lineNumber, 0, lineNumber, 0);
        const text = "[Blame info]";

        const decoration = { range, renderOptions: { before: { contentText: text } } };
        decorations.push(decoration);
    }
    // Aplicar las decoraciones en el editor
    editor.setDecorations(decorationType, decorations);
}

export async function openBlamer(filePath: string) {
    if (typeof filePath === 'undefined') {
        return;
    }

    if (!fs.existsSync(filePath)) {
        return;
    }

    let fileUri = vscode.Uri.file(filePath.concat('.blamer'));

    let uri = fileUri.with({ scheme: 'blamer' });

    let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
    await vscode.window.showTextDocument(doc, { preview: false });

    // if (vscode.window.activeTextEditor) {
    //     decorate(vscode.window.activeTextEditor);
    // } else {
    //     vscode.window.showWarningMessage('Unable to set decorations.');
    // }

}

