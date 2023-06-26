import * as vscode from 'vscode';
import { BlameInfo, getBlameInfo } from './gitblame';

function open_blame() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Select a file to blame.');
		return;
	}

	let bestRoot: string = "";
	if (vscode.workspace.workspaceFolders) {
		bestRoot = vscode.workspace.workspaceFolders[0].uri.path;
	}

	console.log('Using root path: ' + bestRoot);

	getBlameInfo(editor.document.fileName, bestRoot)
		.then((result) => {
			const text = result.lines.map(l => {
				// const blame: BlameInfo = result.commits.get(l.commit);
				// blame.previous;
				// const renamed: Boolean = editor.document.fileName != blame.filename;
				// blame.author;

				return l.line_number + " [" + l.commit.substring(0, 7) + "] " + l.content;
			}).join('\n');

			const myOutputChannel = vscode.window.createOutputChannel('Git blame');
			myOutputChannel.show();
			myOutputChannel.append(text);

			// const newEditor = vscode.window.createTextEditor();
			// newEditor.edit(editBuilder => {
			//     editBuilder.insert(newEditor.document.positionAt(0), 'Hola, mundo!');
			// }).then(() => {
			//     vscode.window.showTextDocument(newEditor.document, newEditor.viewColumn);
			// });
		})
		.catch((error) => {
			vscode.window.showWarningMessage('Unexpected error in "vscode-real-blamer"! ' + error);
		});


}


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-real-blamer" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-real-blamer.gitblame', open_blame)
	);
}

export function deactivate() { }
