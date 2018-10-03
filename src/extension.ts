'use strict';
import * as vscode from 'vscode';

export function activate(context : vscode.ExtensionContext) {
    console.log('Congratulations, your extension"wordcount"is now active!');

    const wordCounter = new WordCounter();

    let disposable = vscode.commands.registerCommand('extension.wordCount', () => {
        const count = wordCounter.updateWordCount();
        if (count && count >= 0) {
            vscode.window.showInformationMessage(`字数：${count}`);
        }
    });

    context.subscriptions.push(wordCounter);
    context.subscriptions.push(disposable);
}

class WordCounter {
    // VSCode 底部状态栏
    private _statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    // 释放队列
    private _disposable: vscode.Disposable;
    // subscribe event
    constructor() {
        // 注册事件
        const subscriptions: vscode.Disposable[] = [];
        // 注册光标改变事件
        vscode.window.onDidChangeTextEditorSelection(this.updateWordCount, this, subscriptions);
        // 注册切换文件事件
        vscode.window.onDidChangeActiveTextEditor(this.updateWordCount, this, subscriptions);
        // 更新状态栏
        this.updateWordCount();
        // 需要释放的事件队列
        this._disposable = vscode.Disposable.from(...subscriptions);
    }
    // 获取编辑器及编辑内容的上下文
    public updateWordCount() {
        // 获取当前编辑器对象
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return false;
        }
        // 当前编辑对象
        const doc = editor.document;

        if (doc.languageId === 'markdown') {
            const wordCount = this._getWordCount(doc);
            this._statusBarItem.text = `${wordCount} Words`;
            this._statusBarItem.show();
            return wordCount;
        } else {
            this._statusBarItem.hide();
        }
    }
    // 统计函数
    public _getWordCount(doc: vscode.TextDocument): number {
        // 当前编辑内容
        const docContent: string = doc.getText();
        const filterStr: string = docContent.replace(/\r\n/g, "\n");
        // 中文字数
        const chineseTotal: Array<string> = filterStr.match(/[\u4e00-\u9fa5]/g) || [];
        // 匹配单字字符
        const englishTotal: Array<string> = filterStr.match(/\b\w+\b/g) || [];
        // 匹配数字
        const letterTotal: Array<string> = filterStr.match(/\b\d+\b/g) || [];

        return (chineseTotal.length + (englishTotal.length - letterTotal.length)) || 0;
    }
    // 当插件禁用时
    dispose() {
        this._statusBarItem.dispose();
        this._disposable.dispose();
    }

}

// this method is called when your extension is deactivated
export function deactivate() {}
