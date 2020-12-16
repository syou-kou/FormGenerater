import { CellLocation } from './CellLocation';
import { DATA_TYPES, DEBUG_MODE, LOG_TYPES, VALIDATION_TYPES } from './const';
import { activeSpreadsheet, workbookInfo } from './FormGenerator';
import { Validator } from './Validator';
import { Chapter, Choice, Link, Question } from './WorkbookInfo';

export class Sheet {
	private _sheetName: string;
	private _sheet: GoogleAppsScript.Spreadsheet.Sheet;
	private _values: string[][];

	constructor(sheetName: string) {
		this._sheetName = sheetName;
		this._sheet = activeSpreadsheet.getSheetByName(this._sheetName);
		this._values = this._sheet.getDataRange().getValues();
	}

	public get sheetName(): string {
		return this._sheetName;
	}
	// public set sheetName(value: string) {
	// 	this._sheetName = value;
	// }
	public get sheet(): GoogleAppsScript.Spreadsheet.Sheet {
		return this._sheet;
	}
	// public set sheet(value: GoogleAppsScript.Spreadsheet.Sheet) {
	// 	this._sheet = value;
	// }
	public get values(): string[][] {
		return this._values;
	}
	// public set values(value: any[][]) {
	// 	this._values = value;
	// }
}

export class FirstSheet extends Sheet {
	constructor(sheetName: string) {
		super(sheetName);
	}

	// 第(rowId + 1)行から問題集タイトルを取得する
	public readWorkbookTitle(rowId: number): void {
		const dataType = this.values[rowId][0];
		const dataTypeValidation = new Validator(dataType, new CellLocation(this.sheetName, rowId, 0));
		const isCorrectDataType = dataTypeValidation.validate(
			VALIDATION_TYPES.DATA_TYPE,
			[DATA_TYPES.WORKBOOK_TITLE],
			LOG_TYPES.ERROR
		);
		if (isCorrectDataType) {
			const workbookTitle = this.values[rowId][1];
			const workbookTitleValidation = new Validator(
				workbookTitle,
				new CellLocation(this.sheetName, rowId, 1)
			);
			const isCorrectWorkbookTitle = workbookTitleValidation.validate(
				VALIDATION_TYPES.NOT_NULL,
				[],
				LOG_TYPES.ERROR
			);
			if (isCorrectWorkbookTitle) workbookInfo.workbookTitle = workbookTitle;
		}
	}

	// 第(startRowId + 1)行以降からシート名をすべて取得する
	public readSheetNames(startRowId: number): void {
		const sheetNames = [];
		for (let r = startRowId; r < this.sheet.getLastRow(); r++) {
			const dataType = this.values[r][0];
			const dataTypeValidation = new Validator(dataType, new CellLocation(this.sheetName, r, 0));
			const isCorrectDataType = dataTypeValidation.validate(
				VALIDATION_TYPES.DATA_TYPE,
				[DATA_TYPES.SHEET_NAME],
				LOG_TYPES.NONE
			);
			if (!isCorrectDataType) continue;

			const sheetName = this.values[r][1];
			const sheetNameValidation = new Validator(sheetName, new CellLocation(this.sheetName, r, 1));
			const isCorrectSheetName = sheetNameValidation.validate(
				VALIDATION_TYPES.NOT_NULL,
				[],
				LOG_TYPES.ERROR
			);
			if (!isCorrectSheetName) continue;

			sheetNames.push(sheetName);
		}
		workbookInfo.sheetNames = sheetNames;
	}
}

export class OtherSheet extends Sheet {
	private _isLastSheet: boolean;

	constructor(sheetName: string, isLastSheet: boolean) {
		super(sheetName);
		this._isLastSheet = isLastSheet;
	}

	// 第(startRowId + 1)行以降から問題情報をすべて取得する
	public readQuestionInfo(startRowId: number): void {
		let chapter: Chapter;
		let question: Question;
		for (let r = startRowId; r < this.sheet.getLastRow(); r++) {
			const dataType = this.values[r][0];
			const dataTypeValidation = new Validator(dataType, new CellLocation(this.sheetName, r, 0));
			const isCorrectDataType = dataTypeValidation.validate(
				VALIDATION_TYPES.NOT_NULL,
				[],
				LOG_TYPES.NONE
			);
			if (!isCorrectDataType) continue;

			const value = this.values[r][1];
			const valueValidation = new Validator(value, new CellLocation(this.sheetName, r, 1));
			const isCorrectValue = valueValidation.validate(
				VALIDATION_TYPES.NOT_NULL,
				[],
				LOG_TYPES.NONE
			);
			if (!isCorrectValue) continue;

			if (dataType === DATA_TYPES.CHAPTER_TITLE) {
				// 未登録の章情報、問題情報があれば追加する
				if (chapter) chapter.addQuestion(question);
				workbookInfo.addChapter(chapter);

				chapter = new Chapter(value);
				question = undefined;
				if (DEBUG_MODE) console.log(value);
			} else if (dataType === DATA_TYPES.CHAPTER_DESCRIPTION) {
				if (chapter) chapter.description = value;
			} else if (dataType === DATA_TYPES.QUESTION_SENTENCE) {
				// 未登録の問題情報があれば追加する
				if (chapter) chapter.addQuestion(question);

				question = new Question(value);
				if (DEBUG_MODE) console.log(value);
			} else if (dataType === DATA_TYPES.HELP_TEXT) {
				if (question) question.helpText = value;
			} else if (dataType === DATA_TYPES.CHOICE) {
				const isCorrect = this.values[r][2];
				if (question) question.addChoice(new Choice(value, isCorrect));
			} else if (dataType === DATA_TYPES.ANSWER) {
				if (question) question.answer = value;
			} else if (dataType === DATA_TYPES.EXPLANATION) {
				if (question) question.explanation = value;
			} else if (dataType === DATA_TYPES.LINK) {
				const displayText = this.values[r][2];
				if (question) question.addLink(new Link(value, displayText));
			}
		}

		// 未登録の章情報、問題情報があれば追加する
		if (chapter) chapter.addQuestion(question);
		workbookInfo.addChapter(chapter);
	}

	public get isLastSheet(): boolean {
		return this._isLastSheet;
	}
	// public set isLastSheet(value: boolean) { this._isLastSheet = value; }
}
