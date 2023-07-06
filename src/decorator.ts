import * as vscode from 'vscode';
import BlameProvider from './blameProvider';

function timeAgo(dateString: string | undefined) {
    if(dateString === undefined) {
        return "unkonwn time ago";
    }
    let postDate = new Date(Number(dateString) * 1000);
    let now = new Date();
    let dif = now.getTime() - postDate.getTime(); // ms
    let s   = Math.floor(dif/1000);
    let m   = Math.floor(s/60);
    let h   = Math.floor(m/60);
    let d   = Math.floor(h/24);
    let M   = now.getMonth() - postDate.getMonth();
    let y   = new Date(dif).getFullYear() - 1970;
    let texts  = ["year","month","day","hour","minute","second"];
    let pluralTexts  = ["years","months","days","hours","minutes","seconds"];
    let values = [y,M,d,h,m,s];

    let text  = "";
    let pluralText = "";
    let value = 0;

    for(var i in values) {
        if(values[i]) {
            value = values[i];
            text = texts[i];
            pluralText = pluralTexts[i];
            break;
        }
    }
    return value + " " + ((value > 1) ? pluralText: text) + " ago";
}

export async function decorate(editor: vscode.TextEditor) {

    const decorationType = vscode.window.createTextEditorDecorationType({
        gutterIconSize: 'contain',
        rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
        overviewRulerLane: vscode.OverviewRulerLane.Left,
    });

    const hash = editor.document.uri.fragment;
    const info = await BlameProvider.instance().getBlameInfo(editor.document.uri, hash);

    const decorations: vscode.DecorationOptions[] = [];
    if(info) {
        for(const line of info.info.lines) {
            const range = new vscode.Range(Number(line.lineNum)-1, 0, 
                                           Number(line.lineNum)-1, line.content.length);
            let text = line.commit.substring(0, 8) + " ";
            let overText = "";
            let lineText = "";
            let blame = info.info.commits.get(line.commit);
            if(blame) {
                const time = timeAgo(blame.authorTime);
                const authorName = blame.author.trim();
                const authorMail = blame.authorMail.trim();
                const summary = blame.summary.trim();
                overText = authorName + " " + authorMail + "\n\n" + summary + "\n\n" + time;
                lineText = authorName + " " + time;
            }
            
            const decoration = { range, 
                hoverMessage: overText,
                renderOptions: { 
                    before: { 
                        contentText: text,
                        color: '#BCBCBCFF',
                        backgroundColor: '#303030FF',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                        borderColor: '#FF00FFFF',
                        borderStyle: 'solid',
                        borderWidth: '0 2px 0 0',
                        margin: '0 1em -2px 0'
                    },
                    after: {
                        contentText: lineText,
                        color: '#303030FF',
                        margin: '0 0 0 1em'
                    }
                } 
            };

            decorations.push(decoration);
        }
    }

    editor.setDecorations(decorationType, decorations);
}