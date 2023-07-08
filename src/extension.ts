import * as vscode from 'vscode';
import { buildUri, openBlamer, validScheme } from './view';
import { decorate } from './decorator';
import BlamerContentProvider from './provider';
import BlameProvider from './blameProvider';

async function openBlame(fileUri: string | vscode.Uri | undefined) {

	if (fileUri === undefined) {
		fileUri = vscode.window.activeTextEditor?.document.uri;
	}
	if(typeof fileUri === 'string') {
		fileUri = vscode.Uri.file(fileUri);
	}
	if (!fileUri) {
		vscode.window.showWarningMessage('Select a file to blame.');
		return;
	}

	if (fileUri?.scheme === 'blamer') {
		vscode.window.showWarningMessage('Already on a blame file.');
		return;
	}

	if (fileUri?.scheme === 'file') {
		console.log('Blame file: ' + fileUri);
		await openBlamer(fileUri.fsPath, fileUri?.fragment || "");
		return;
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-real-blamer" is now active!');


	let provider = new BlamerContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('blamer', provider);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-real-blamer.gitblame', openBlame)
	);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor && validScheme(editor.document.uri)) {
			decorate(editor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidSaveTextDocument(event => {
		const uri = buildUri(event.uri.fsPath, "");
		BlameProvider.instance().invalidate(uri);
		provider.update(uri);
	}, null, context.subscriptions);
}

export function deactivate() { }
