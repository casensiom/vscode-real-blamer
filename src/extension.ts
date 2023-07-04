import * as vscode from 'vscode';
import { openBlamer } from './view';
import BlamerContentProvider from './provider';
import { decorate } from './decorator';

async function openBlame(fileUri: string | vscode.Uri | undefined) {

	if (typeof fileUri === undefined || !(fileUri instanceof vscode.Uri)) {
		fileUri = vscode.window.activeTextEditor?.document.uri;
	}
	if (!fileUri) {
		vscode.window.showWarningMessage('Select a file to blame.');
		return;
	}

	if (fileUri?.scheme === 'blamer') {
		vscode.window.showWarningMessage('Already on a blame file.');
		return;
	}

	console.log('Blame file: ' + fileUri);
	await openBlamer(fileUri.fsPath, "");
}


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-real-blamer" is now active!');


	let provider = new BlamerContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('blamer', provider);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-real-blamer.gitblame', openBlame)
	);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor && editor.document.uri.scheme === 'blamer') {
			decorate(editor);
		}
	}, null, context.subscriptions);
}

export function deactivate() { }
