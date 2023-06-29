import * as vscode from 'vscode';
import * as cp from 'child_process';

export interface BlameInfo {
    author: string;
    author_mail: string;
    author_time: string;
    author_tz: string;
    committer: string;
    committer_mail: string;
    committer_time: string;
    committer_tz: string;
    summary: string;
    previous: string;
    filename: string;
}

export interface LineInfo {
    commit: string;
    line_number: string;
    line_number_orig: string;
    line_number_commit: string;
    content: string;
}

export interface BlameResult {
    lines: Array<LineInfo>;
    commits: Map<string, BlameInfo>;
}

function newBlameInfo(): BlameInfo {
    return {
        author: "",
        author_mail: "",
        author_time: "",
        author_tz: "",
        committer: "",
        committer_mail: "",
        committer_time: "",
        committer_tz: "",
        summary: "",
        previous: "",
        filename: ""
    };
}

function parseBlameOutput(output: string): BlameResult {
    let currentCommit: BlameInfo = newBlameInfo();
    let currentKey: string = "";
    let number: string = "";
    let number_orig: string = "";
    let number_commit: string = "";

    const blameMap: Map<string, BlameInfo> = new Map();
    let content: Array<LineInfo> = new Array();

    const lines = output.trim().split('\n');
    for (const line of lines) {
        if (/^[a-z0-9]{40} [0-9]* [0-9]*( [0-9]*)?$/.test(line)) {
            const pieces: string[] = line.split(' ');
            currentKey = pieces[0];
            currentCommit = newBlameInfo();
            number = pieces[2];
            number_orig = pieces[1];
            number_commit = (pieces.length > 3) ? pieces[3] : number;
        } else if (line.startsWith('author ')) {                 // author         AUTHOR NAME
            currentCommit.author = line.split(" ").slice(1).join(" ");
        } else if (line.startsWith('author-mail ')) {            // author-mail    <USER@HOST.com>
            currentCommit.author_mail = line.split(" ")[1];
        } else if (line.startsWith('author-time ')) {            // author-time    1587553215
            currentCommit.author_time = line.split(" ")[1];
        } else if (line.startsWith('author-tz ')) {              // author-tz      +0200
            currentCommit.author_tz = line.split(" ")[1];
        } else if (line.startsWith('committer ')) {              // committer      AUTHOR NAME
            currentCommit.committer = line.split(" ").slice(1).join(" ");
        } else if (line.startsWith('committer-mail ')) {         // committer-mail <USER@HOST.com>
            currentCommit.committer_mail = line.split(" ")[1];
        } else if (line.startsWith('committer-time ')) {         // committer-time 1587553215
            currentCommit.committer_time = line.split(" ")[1];
        } else if (line.startsWith('committer-tz ')) {           // committer-tz   +0200
            currentCommit.committer_tz = line.split(" ")[1];
        } else if (line.startsWith('summary ')) {                // summary        DESCRIPTION
            currentCommit.summary = line.split(" ").slice(1).join(" ");
        } else if (line.startsWith('previous ')) {               // previous       4175cec89e56eae8cf98c653ebc1bb44cc28136c README.md
            currentCommit.previous = line.split(" ")[1];
        } else if (line.startsWith('filename ')) {               // filename       README.md
            currentCommit.filename = line.split(" ")[1];
        } else {
            if (currentKey.length === 0) {
                continue;
            }

            if (!blameMap.has(currentKey)) {
                blameMap.set(currentKey, currentCommit);
            }

            content.push({
                commit: currentKey,
                line_number: number,
                line_number_orig: number_orig,
                line_number_commit: number_commit,
                content: line
            });
            currentKey = "";
            currentCommit = newBlameInfo();
        }
    }

    return {
        lines: content,
        commits: blameMap
    };
}

export function getBlameInfo(filePath: string, rootPath: string | undefined): Promise<BlameResult> {
    return new Promise((resolve, reject) => {
        const command = `git blame --porcelain ${filePath}`;

        cp.exec(command, {
            cwd: rootPath
        }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error executing 'git blame': ${error.message}`));
                return;
            }

            if (stderr) {
                reject(new Error(`Error in 'git blame' output: ${stderr}`));
                return;
            }

            resolve(parseBlameOutput(stdout));
        });
    });
}


export function getBlameText(filePath: string, rootPath: string | undefined): vscode.ProviderResult<string> {
    return new Promise((resolve, reject) => {
        const command = `git blame --porcelain ${filePath}`;

        cp.exec(command, {
            cwd: rootPath
        }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error executing 'git blame': ${error.message}`));
                return;
            }

            if (stderr) {
                reject(new Error(`Error in 'git blame' output: ${stderr}`));
                return;
            }

            const text = parseBlameOutput(stdout).lines.map(l => { return l.content; }).join('\n');
            resolve(text);
        });
    });
}

