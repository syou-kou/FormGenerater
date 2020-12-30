import { ANSWER_TYPES, DEBUG_MODE, LOG_TYPES, OPTION_TYPES } from './const';
import { log, workbookInfo } from './FormGenerator';
import { Chapter, Question } from './WorkbookInfo';

export class Form {
	protected _folder: GoogleAppsScript.Drive.Folder;
	protected _form: GoogleAppsScript.Forms.Form;

	constructor(folder: GoogleAppsScript.Drive.Folder) {
		this._folder = folder;   // 保存先フォルダ
		this._form = null;       // フォーム情報
	}

	// 各章のフォームを作成する
	public createChapterForm(chapter: Chapter): void {
		this.setChapterInfo(
			chapter.title,
			chapter.description,
			chapter.hasOption(OPTION_TYPES.SHUFFLE_QUESTIONS),
		);
		for (const question of chapter.questions) {
			this.setQuestionInfo(question);
		}
		this.moveForm();
	}

	// 各章の情報をフォームに反映する
	protected setChapterInfo(
		title: string,
		description: string,
		shuffleQuestions: boolean,
	): void {
		this._form = FormApp.create(title); // 章タイトル
		this._form.setDescription(description); // 章概要

		// スプレッドシートから指定されたオプション
		if (shuffleQuestions) {
			this._form.setShuffleQuestions(true); // 問題をシャッフルする
		}
		// 固定値のオプション
		this._form.setCollectEmail(true); // 回答者のメールアドレスを収集する
		this._form.setIsQuiz(true); // テストにする
	}

	// 各問題の情報をフォームに反映する
	protected setQuestionInfo(question: Question): void {
		if (DEBUG_MODE) question.printQuestionInfo();
		question.setAnswerType();
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
				break;
			}
		}
	}

	// 作成したフォームを保存先フォルダに移動する
	protected moveForm(): void {
		const file = DriveApp.getFileById(this._form.getId());
		this._folder.addFile(file);
		DriveApp.getRootFolder().removeFile(file);
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
		// 記述解答の代替メッセージ
		log.printLog(
			LOG_TYPES.WARNING,
			`'問題「${question.sentence}」の記述解答はフォーム作成後、手作業で反映をお願いします。'`
		);
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

	// public get folder(): GoogleAppsScript.Drive.Folder {
	// 	return this._folder;
	// }
	// public set folder(value: GoogleAppsScript.Drive.Folder) {
	// 	this._folder = value;
	// }
	// public get form(): GoogleAppsScript.Forms.Form {
	// 	return this._form;
	// }
	// public set form(value: GoogleAppsScript.Forms.Form) {
	// 	this._form = value;
	// }
}

export class AllChaptersForm extends Form {
	constructor(folder: GoogleAppsScript.Drive.Folder) {
		super(folder);
	}

	// 全章まとめのフォームを作成する
	public createAllChaptersForm(chapters: Array<Chapter>): void {
		this.setChapterInfo(
			workbookInfo.title,
			workbookInfo.description,
			workbookInfo.hasOption(OPTION_TYPES.SHUFFLE_QUESTIONS)
		);
		for (const chapter of chapters) {
			for (const question of chapter.questions) {
				this.setQuestionInfo(question);
			}
		}
		this.moveForm();
	}
}
