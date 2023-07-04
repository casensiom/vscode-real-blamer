import * as vscode from 'vscode';
import {BlameResult, getBlameInfo} from './gitblame';
import { cleanName } from './view';

export type BlameProviderInfo = {
    file: vscode.Uri;
    hash: string;
    info: BlameResult;
    dirty: boolean;
};


export default class BlameProvider  {
    private static readonly _instance = new BlameProvider();
    private readonly _store = new Map<string, BlameProviderInfo>();
    constructor() {

    }
    
    public static instance() : BlameProvider {
        return this._instance;
    }

    async getBlameInfo(path: vscode.Uri, hash: string) : Promise<BlameProviderInfo | undefined> {
        const id = this.id(path, hash);
        let item = this._store.get(id);
        if(item && !item.dirty) {
            return item;
        }

        // TODO: try harder to get best root!
        let bestRoot: string = "";
        if (vscode.workspace.workspaceFolders) {
            bestRoot = vscode.workspace.workspaceFolders[0].uri.path;
        }

        const blame : BlameResult = await getBlameInfo(cleanName(path.path), bestRoot /*, hash*/);
        item = {
            file:  path,
            hash:  hash,
            info:  blame,
            dirty: false
        };
        this._store.set(id, item);
        return item;
    }

    invalidate(path: vscode.Uri, hash: string) {
        const id = this.id(path, hash);
        let item = this._store.get(id);
        if(item && !item.dirty) {
            item.dirty = true;
            this._store.set(id, item);
        }
    }

    private id(path: vscode.Uri, hash: string) : string {
        return path.toString() + hash;
    }
}