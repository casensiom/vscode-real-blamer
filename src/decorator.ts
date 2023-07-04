import * as vscode from 'vscode';
import BlameProvider from './blameProvider';

export async function decorate(editor: vscode.TextEditor) {

    const decorationType = vscode.window.createTextEditorDecorationType({
        gutterIconSize: 'contain',
        overviewRulerLane: vscode.OverviewRulerLane.Left,
        isWholeLine: true
    });

    const hash = editor.document.uri.fragment;
    const info = await BlameProvider.instance().getBlameInfo(editor.document.uri, hash);

    const decorations: vscode.DecorationOptions[] = [];
    if(info) {
        for(const line of info.info.lines) {
            const range = new vscode.Range(Number(line.line_number)-1, 0, 
                                           Number(line.line_number)-1, line.content.length);
            const text = "[" + line.commit.substring(0, 8) + "]";

            const decoration = { range, renderOptions: { before: { contentText: text } } };
            decorations.push(decoration);
        }
    }

    editor.setDecorations(decorationType, decorations);
}