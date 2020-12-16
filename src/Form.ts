import { ANSWER_TYPES, DEBUG_MODE, LOG_TYPES } from './const';
import { log } from './FormGenerator';
import { Chapter, Question } from './WorkbookInfo';

export class Form {
	private _chapter: Chapter;
	private _folder: GoogleAppsScript.Drive.Folder;
	private _form: GoogleAppsScript.Forms.Form;

	constructor(chapter: Chapter, folder: GoogleAppsScript.Drive.Folder) {
		this._chapter = chapter; // 章情報
		this._folder = folder; // 保存先フォルダ
		this._form = null; // フォーム情報
	}

	// フォームを章単位で作成する
	// 対象となる章のすべての問題情報を取得してから呼び出すこと
	public createForm(): void {
		// フォームを新規作成
		this._form = FormApp.create(this._chapter.title);
		// 章概要
		this._form.setDescription(this._chapter.description);
		// テスト形式オプション
		this._form.setIsQuiz(true);
		// 進行状況バーを表示する
		this._form.setProgressBar(true);
		// 問題情報
		for (const question of this._chapter.questions) {
			// 問題情報を出力する
			if (DEBUG_MODE) question.printQuestionInfo();
			// 解答形式を判別する
			question.setAnswerType();
			// 解答形式に応じてアイテムを作成する
			switch (question.answerType) {
			case ANSWER_TYPES.SELECTION_SINGLE: {
				const multipleChoiceItem = this._form.addMultipleChoiceItem();
				this.setQuestionInfoOfAllType(multipleChoiceItem, question);
				this.setQuestionInfoOfSelectionType(multipleChoiceItem, question);
				break;
			}
			case ANSWER_TYPES.SELECTION_MULTIPLE: {
				const checkboxItem = this._form.addCheckboxItem();
				this.setQuestionInfoOfAllType(checkboxItem, question);
				this.setQuestionInfoOfSelectionType(checkboxItem, question);
				break;
			}
			case ANSWER_TYPES.DESCRIPTION: {
				const textItem = this._form.addTextItem();
				this.setQuestionInfoOfAllType(textItem, question);
				this.setQuestionInfoOfTextType(textItem, question);
				// 記述式の場合のみ、警告メッセージを出力する
				log.printLog(
					LOG_TYPES.WARNING,
					`'問題「${question.sentence}」の記述解答はフォーム作成後、手作業で反映をお願いします。'`
				);
				break;
			}
			}
			// const item = this.createItem(question.answerType);
			// if (!item) continue;
			// // アイテム作成時のみ、フォームに問題情報を追加する
			// this.setQuestionInfo(item, question);
			// // 記述式の場合のみ、警告メッセージを出力する
			// if (question.answerType === ANSWER_TYPES.DESCRIPTION) {
			// 	log.printLog(
			// 		LOG_TYPES.WARNING,
			// 		`'問題「${question.sentence}」の記述解答はフォーム作成後、手作業で反映をお願いします。'`
			// 	);
			// }
		}
		// 作成したフォームを保存先フォルダに移動する
		this.moveForm();
	}

	// すべての解答形式に共通する項目を設定する
	private setQuestionInfoOfAllType(
		item: GoogleAppsScript.Forms.MultipleChoiceItem
			| GoogleAppsScript.Forms.CheckboxItem
			| GoogleAppsScript.Forms.TextItem,
		question: Question
	) {
		item.setTitle(question.sentence);    // 問題文
		item.setHelpText(question.helpText); // 問題文備考
		item.setRequired(false);             // 必須回答オプション
		item.setPoints(1);                   // 得点
	}

	// 単一/複数選択式のみに共通する項目を設定する
	private setQuestionInfoOfSelectionType(
		item: GoogleAppsScript.Forms.MultipleChoiceItem
			| GoogleAppsScript.Forms.CheckboxItem,
		question: Question
	): void {
		// 選択肢情報
		const choices = question.choices.map((choice) =>
			item.createChoice(choice.sentence, choice.isCorrect)
		);
		item.setChoices(choices);
		// その他項目表示オプション
		item.showOtherOption(false);
		// 正解/不正解時フィードバック
		const feedbackBuilder = this.createFeedbackInfo(question);
		console.log(feedbackBuilder);
		if (feedbackBuilder) {
			item.setFeedbackForCorrect(feedbackBuilder);
			item.setFeedbackForIncorrect(feedbackBuilder);
		}
	}

	// 記述式のみの項目を設定する
	private setQuestionInfoOfTextType(
		item: GoogleAppsScript.Forms.TextItem,
		question: Question
	): void {
		// フィードバック内容(解答形式により呼び出すメソッドが異なる)
		// フィードバック
		const feedbackBuilder = this.createFeedbackInfo(question);
		console.log(feedbackBuilder);
		if (feedbackBuilder) {
			item.setGeneralFeedback(feedbackBuilder);
		}
	}

	// フィードバック情報を生成する
	private createFeedbackInfo(question: Question): GoogleAppsScript.Forms.QuizFeedback {
		// フィードバック内容
		const feedback = FormApp.createFeedback();
		// 解説文
		const explanation = question.explanation
			? question.explanation
			: '解説文はまだ登録されていません';
		feedback.setText(explanation);
		// リンク
		console.log(question.links.length);
		if (question.links.length > 0) {
			for (const link of question.links) {
				const url = link.url ? link.url : 'No links';
				const displayText = link.displayText ? link.displayText : 'リンク';
				if (DEBUG_MODE) console.log(url);
				if (DEBUG_MODE) console.log(displayText);
				feedback.addLink(url, displayText);
			}
		}
		return feedback.build();
	}

	// // 解答形式に応じてアイテムを作成する
	// private createItem(answerType: string) {
	// 	switch (answerType) {
	// 		// 単一選択式の場合(ラジオボタン)
	// 		case ANSWER_TYPES.SELECTION_SINGLE:
	// 			return this._form.addMultipleChoiceItem();
	// 		// 複数選択式の場合(チェックボックス)
	// 		case ANSWER_TYPES.SELECTION_MULTIPLE:
	// 			return this._form.addCheckboxItem();
	// 		// 記述式の場合(テキスト)
	// 		case ANSWER_TYPES.DESCRIPTION:
	// 			return this._form.addTextItem();
	// 		// 判別不能
	// 		default:
	// 			return undefined;
	// 	}
	// }

	// // 解答形式に応じてフォームに問題情報を追加する
	// private setQuestionInfo(
	// 	item: GoogleAppsScript.Forms.MultipleChoiceItem
	// 		| GoogleAppsScript.Forms.CheckboxItem
	// 		| GoogleAppsScript.Forms.TextItem,
	// 	question: Question
	// ): void {
	// 	// すべての解答形式に共通する項目
	// 	item.setTitle(question.sentence);    // 問題文
	// 	item.setHelpText(question.helpText); // 問題文備考
	// 	item.setRequired(false);             // 必須回答オプション
	// 	item.setPoints(1);                   // 得点

	// 	// フィードバック内容(解答形式により呼び出すメソッドが異なる)
	// 	const feedback = FormApp.createFeedback();
	// 	// 解説文
	// 	const explanation = !question.explanation
	// 		? '解説文はまだ登録されていません'
	// 		: question.explanation;
	// 	feedback.setText(explanation);
	// 	// リンク
	// 	console.log(question.links.length);
	// 	if (question.links.length > 0) {
	// 		for (const link of question.links) {
	// 			const url = !link.url ? 'No links' : link.url;
	// 			const displayText = !link.displayText ? 'リンク' : link.displayText;
	// 			if (DEBUG_MODE) console.log(url);
	// 			if (DEBUG_MODE) console.log(displayText);
	// 			feedback.addLink(url, displayText);
	// 		}
	// 	}
	// 	const feedbackBuilder = feedback.build();
	// 	console.log(feedbackBuilder);

	// 	// if (question.answerType === ANSWER_TYPES.SELECTION_SINGLE || question.answerType === ANSWER_TYPES.SELECTION_MULTIPLE) {
	// 	// ユーザ定義タイプガードによる
	// 	if (this.implementsMultipleChoiceItem(item) || this.implementsCheckboxItem(item)) {
	// 		// 単一/複数選択式に共通する項目
	// 		// 選択肢情報
	// 		const choices = question.choices.map((choice) =>
	// 			item.createChoice(choice.sentence, choice.isCorrect)
	// 		);
	// 		item.setChoices(choices);
	// 		// その他項目表示オプション
	// 		item.showOtherOption(false);
	// 		// 正解/不正解時フィードバック
	// 		if (feedbackBuilder) {
	// 			item.setFeedbackForCorrect(feedbackBuilder);
	// 			item.setFeedbackForIncorrect(feedbackBuilder);
	// 		}
	// 	}
	// 	// 記述式のみの項目
	// 	if (question.answerType === ANSWER_TYPES.DESCRIPTION) {
	// 		// フィードバック
	// 		if (feedbackBuilder) {
	// 			item.setGeneralFeedback(feedbackBuilder);
	// 		}
	// 	}
	// }

	// 作成したフォームを保存先フォルダに移動する
	private moveForm() {
		const file = DriveApp.getFileById(this._form.getId());
		this._folder.addFile(file);
		DriveApp.getRootFolder().removeFile(file);
	}

	// // ユーザ定義タイプガード
	// private implementsMultipleChoiceItem(arg: any): arg is GoogleAppsScript.Forms.MultipleChoiceItem {
	// 	return arg !== null && typeof arg === 'object';
	// }
	// private implementsCheckboxItem(arg: any): arg is GoogleAppsScript.Forms.CheckboxItem {
	// 	return arg !== null && typeof arg === 'object';
	// }
	// private implementsTextItem(arg: any): arg is GoogleAppsScript.Forms.TextItem {
	// 	return arg !== null && typeof arg === 'object';
	// }

	public get chapter(): Chapter {
		return this._chapter;
	}
	// public set chapter(value: Chapter) {
	// 	this._chapter = value;
	// }
	public get folder(): GoogleAppsScript.Drive.Folder {
		return this._folder;
	}
	// public set folder(value: GoogleAppsScript.Drive.Folder) {
	// 	this._folder = value;
	// }
	public get form(): GoogleAppsScript.Forms.Form {
		return this._form;
	}
	// public set form(value: GoogleAppsScript.Forms.Form) {
	// 	this._form = value;
	// }
}
