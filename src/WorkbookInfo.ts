import { ANSWER_TYPES, CHOICE_IS_CORRECT, LOG_TYPES } from './const';
import { log } from './FormGenerator';

export class Choice {
	private _sentence: string;   // 選択肢の文
	private _isCorrect: boolean; // 正誤情報(trueなら正答、falseなら誤答)

	constructor(sentence: string, isCorrectStr: string) {
		this._sentence = sentence;
		this._isCorrect = isCorrectStr === CHOICE_IS_CORRECT;
	}

	public get sentence(): string {
		return this._sentence;
	}
	// public set sentence(value: string) {
	// 	this._sentence = value;
	// }
	public get isCorrect(): boolean {
		return this._isCorrect;
	}
	// public set isCorrect(value: boolean) {
	// 	this._isCorrect = value;
	// }
}

export class Link {
	private _url: string;         // リンクのアドレス
	private _displayText: string; // アドレス上に表示するテキスト

	constructor(url: string, displayText: string) {
		this._url = url;
		this._displayText = displayText;
	}

	public get url(): string {
		return this._url;
	}
	// public set url(value: string) {
	// 	this._url = value;
	// }
	public get displayText(): string {
		return this._displayText;
	}
	// public set displayText(value: string) {
	// 	this._displayText = value;
	// }
}

export class Question {
	private _sentence: string;       // 問題文
	private _helpText: string;       // 問題文備考
	private _choices: Array<Choice>; // 選択肢情報配列
	private _answer: string;         // 記述解答
	private _explanation: string;    // 解説文
	private _links: Array<Link>;     // リンク情報配列
	private _answerType: string;     // 解答形式

	constructor(sentence: string) {
		this._sentence = sentence;
		this._helpText = '';
		this._choices = [];
		this._answer = '';
		this._explanation = '';
		this._links = [];
		this._answerType = '';
	}

	public addChoice(choice: Choice): void {
		if (choice) this._choices.push(choice);
	}
	public addLink(link: Link): void {
		if (link) this._links.push(link);
	}

	// 解答形式を判別し、判別不能の場合はメッセージを出力する
	// 問題情報をすべて取得してから呼び出すこと
	public setAnswerType(): void {
		if (this._choices.length > 0) {
			// 選択肢が入力されている場合
			// 正答の個数を取得する
			const correctNumber = this._choices.filter((choice) => choice.isCorrect).length;
			if (correctNumber === 0) {
				// (選択肢が入力されているにも関わらず)正答の個数が0の場合、判別不能
				this._answerType = ANSWER_TYPES.OTHER;
				log.printLog(
					LOG_TYPES.ERROR,
					`'問題「${this._sentence}」は選択肢の正答が存在しないため、フォーム作成の対象外となります。'`
				);
			} else if (correctNumber === 1) {
				// 正答の個数が1の場合、単一選択式と判別する
				this._answerType = ANSWER_TYPES.SELECTION_SINGLE;
			} else {
				// 正答の個数が2以上の場合、複数選択式と判別する
				this._answerType = ANSWER_TYPES.SELECTION_MULTIPLE;
			}

		} else {
			// 選択肢が入力されていない場合
			if (this._answer === undefined) {
				// 選択肢、記述解答ともに存在しない場合、判別不能
				this._answerType = ANSWER_TYPES.OTHER;
				log.printLog(
					LOG_TYPES.ERROR,
					`'問題「${this._sentence}」は選択肢、記述解答ともに存在しないため、フォーム作成の対象外となります。'`
				);
			} else {
				// 記述解答が存在する場合、記述式と判別する
				this._answerType = ANSWER_TYPES.DESCRIPTION;
			}
		}
	}

	// 問題情報を出力する
	public printQuestionInfo(): void {
		let info = `"sentence: ${this._sentence}\n"`;
		this._choices.forEach((choice, index) => {
			info += `"choice ${index + 1}: ${choice.sentence} (${choice.isCorrect})\n"`;
		});
		info += `"answer: ${this._answer}\n"`;
		info += `"explanation: ${this._explanation}\n"`;
		this._links.forEach((link, index) => {
			info += `"link ${index + 1}: ${link.url} (${link.displayText})\n"`;
		});
		log.printLog(LOG_TYPES.QUESTION, info);
	}

	public get sentence(): string {
		return this._sentence;
	}
	// public set sentence(value: string) {
	// 	this._sentence = value;
	// }
	public get helpText(): string {
		return this._helpText;
	}
	public set helpText(value: string) {
		this._helpText = value;
	}
	public get choices(): Array<Choice> {
		return this._choices;
	}
	public set choices(value: Array<Choice>) {
		this._choices = value;
	}
	public get answer(): string {
		return this._answer;
	}
	public set answer(value: string) {
		this._answer = value;
	}
	public get explanation(): string {
		return this._explanation;
	}
	public set explanation(value: string) {
		this._explanation = value;
	}
	public get links(): Array<Link> {
		return this._links;
	}
	public set links(value: Array<Link>) {
		this._links = value;
	}
	public get answerType(): string {
		return this._answerType;
	}
	public set answerType(value: string) {
		this._answerType = value;
	}
}

export class Chapter {
	private _title: string;              // 章タイトル
	private _description: string;        // 章概要
	private _options: Array<string>;     // オプション情報
	private _questions: Array<Question>; // 問題情報配列

	constructor(title: string) {
		this._title = title;
		this._description = '';
		this._options = [];
		this._questions = [];
	}

	public addQuestion(question: Question): void {
		if (question) this._questions.push(question);
	}
	public hasOption(option: string): boolean {
		return this._options.includes(option);
	}
	public setOption(option: string): void {
		this._options.push(option);
	}

	public get title(): string {
		return this._title;
	}
	// public set title(value: string) {
	// 	this._title = value;
	// }
	public get description(): string {
		return this._description;
	}
	public set description(value: string) {
		this._description = value;
	}
	// public get options(): Array<string> {
	// 	return this._options;
	// }
	// public set options(value: Array<string>) {
	// 	this._options = value;
	// }
	public get questions(): Array<Question> {
		return this._questions;
	}
	public set questions(value: Array<Question>) {
		this._questions = value;
	}
}

export class WorkbookInfo {
	private _workbookTitle: string;     // 問題集タイトル
	private _sheetNames: Array<string>; // 章別シート名配列
	private _chapters: Array<Chapter>;  // 章情報配列
	private _options: Array<string>;    // オプション情報
	private _title: string;             // (全章まとめ用)章タイトル
	private _description: string;       // (全章まとめ用)章概要

	constructor() {
		this._workbookTitle = '';
		this._sheetNames = [];
		this._chapters = [];
		this._options = [];
		this._title = '';
		this._description = '';
	}

	public addSheetName(sheetName: string): void {
		if (sheetName) this._sheetNames.push(sheetName);
	}
	public addChapter(chapter: Chapter): void {
		if (chapter) this._chapters.push(chapter);
	}
	public hasOption(option: string): boolean {
		return this._options.includes(option);
	}
	public setOption(option: string): void {
		this._options.push(option);
	}

	public get workbookTitle(): string {
		return this._workbookTitle;
	}
	public set workbookTitle(value: string) {
		this._workbookTitle = value;
	}
	public get sheetNames(): Array<string> {
		return this._sheetNames;
	}
	// public set sheetNames(value: Array<string>) {
	// 	this._sheetNames = value;
	// }
	public get chapters(): Array<Chapter> {
		return this._chapters;
	}
	// public set chapters(value: Array<Chapter>) {
	// 	this._chapters = value;
	// }
	// public get options(): Array<string> {
	// 	return this._options;
	// }
	// public set options(value: Array<string>) {
	// 	this._options = value;
	// }
	public get title(): string {
		return this._title;
	}
	public set title(value: string) {
		this._title = value;
	}
	public get description(): string {
		return this._description;
	}
	public set description(value: string) {
		this._description = value;
	}
}
