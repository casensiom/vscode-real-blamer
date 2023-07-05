import * as cp from 'child_process';

export type BlameInfo = {
    author: string;
    authorMail: string;
    authorTime: string;
    authorTz: string;
    committer: string;
    committerMail: string;
    committerTime: string;
    committerTz: string;
    summary: string;
    previous: string;
    filename: string;
};

export type LineInfo = {
    commit: string;
    lineNum: number;
    lineNumOrig: number;
    lineNumCommit: number;
    content: string;
};

export type BlameResult = {
    lines: Array<LineInfo>;
    commits: Map<string, BlameInfo>;
};

function newBlameInfo(): BlameInfo {
    return {
        author: "",
        authorMail: "",
        authorTime: "",
        authorTz: "",
        committer: "",
        committerMail: "",
        committerTime: "",
        committerTz: "",
        summary: "",
        previous: "",
        filename: ""
    };
}

function parseBlameOutput(output: string): BlameResult {
    let currentCommit: BlameInfo = newBlameInfo();
    let currentKey: string = "";
    let num: number = 0;
    let numOrig: number = 0;
    let numCommit: number = 0;

    const blameMap: Map<string, BlameInfo> = new Map();
    let content: Array<LineInfo> = new Array();

    const lines = output.trim().split('\n');
    for (const line of lines) {
        if (/^[a-z0-9]{40} [0-9]* [0-9]*( [0-9]*)?$/.test(line)) {
            const pieces: string[] = line.split(' ');
            currentKey = pieces[0];
            currentCommit = newBlameInfo();
            num = Number(pieces[2]);
            numOrig = Number(pieces[1]);
            numCommit = (pieces.length > 3) ? Number(pieces[3]) : num;
        } else if (line.startsWith('author ')) {                 // author         AUTHOR NAME
            currentCommit.author = line.split(" ").slice(1).join(" ");
        } else if (line.startsWith('author-mail ')) {            // author-mail    <USER@HOST.com>
            currentCommit.authorMail = line.split(" ")[1];
        } else if (line.startsWith('author-time ')) {            // author-time    1587553215
            currentCommit.authorTime = line.split(" ")[1];
        } else if (line.startsWith('author-tz ')) {              // author-tz      +0200
            currentCommit.authorTz = line.split(" ")[1];
        } else if (line.startsWith('committer ')) {              // committer      AUTHOR NAME
            currentCommit.committer = line.split(" ").slice(1).join(" ");
        } else if (line.startsWith('committer-mail ')) {         // committer-mail <USER@HOST.com>
            currentCommit.committerMail = line.split(" ")[1];
        } else if (line.startsWith('committer-time ')) {         // committer-time 1587553215
            currentCommit.committerTime = line.split(" ")[1];
        } else if (line.startsWith('committer-tz ')) {           // committer-tz   +0200
            currentCommit.committerTz = line.split(" ")[1];
        } else if (line.startsWith('summary ')) {                // summary        DESCRIPTION
            currentCommit.summary = line.split(" ").slice(1).join(" ");
        } else if (line.startsWith('boundary')) {                // boundary
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
                lineNum: num,
                lineNumOrig: numOrig,
                lineNumCommit: numCommit,
                content: line.slice(1)
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
