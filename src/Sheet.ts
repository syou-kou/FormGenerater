import { CellLocation } from './CellLocation';
import { DATA_TYPES, DEBUG_MODE, LOG_TYPES } from './const';
import { activeSpreadsheet, workbookInfo } from './FormGenerator';
import { Validator } from './Validator';
import { Chapter, Choice, Link, Question } from './WorkbookInfo';

export class Sheet {
	protected _sheetName: string;
	protected _sheet: GoogleAppsScript.Spreadsheet.Sheet;
	protected _values: string[][];

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

	// 第(startRowId + 1)行以降からシート情報をすべて取得する
	public readSheetInfo(startRowId: number): void {
		for (let r = startRowId; r < this._sheet.getLastRow(); r++) {
			const dataType = this._values[r][0];
			const isDataTypeNotNull = new Validator(dataType)
				.isNotNull(LOG_TYPES.NONE, undefined);
			if (!isDataTypeNotNull) continue;

			const value = this._values[r][1];
			const valueLocation = new CellLocation(this._sheetName, r, 1);
			const isValueNotNull = new Validator(value)
				.isNotNull(LOG_TYPES.ERROR, valueLocation);
			if (!isValueNotNull) continue;

			switch (dataType) {
				case DATA_TYPES.WORKBOOK_TITLE: {
					workbookInfo.workbookTitle = value;
					break;
				}
				case DATA_TYPES.SHEET_NAME: {
					workbookInfo.addSheetName(value);
					break;
				}
				case DATA_TYPES.OPTION: {
					const isOptionIncluded = new Validator(value)
						.isIncludedOption(LOG_TYPES.ERROR, valueLocation);
					if (isOptionIncluded) workbookInfo.setOption(value);
					break;
				}
				case DATA_TYPES.CHAPTER_TITLE: {
					workbookInfo.title = value;
					break;
				}
				case DATA_TYPES.CHAPTER_DESCRIPTION: {
					workbookInfo.description = value;
					break;
				}
			}
		}
	}
}

export class OtherSheet extends Sheet {
	private _isLastSheet: boolean;

	constructor(sheetName: string) {
		super(sheetName);
	}

	// 第(startRowId + 1)行以降から問題情報をすべて取得する
	public readQuestionInfo(startRowId: number): void {
		let chapter: Chapter;
		let question: Question;
		for (let r = startRowId; r < this._sheet.getLastRow(); r++) {
			const dataType = this._values[r][0];
			const isDataTypeNotNull = new Validator(dataType)
				.isNotNull(LOG_TYPES.NONE, undefined);
			if (!isDataTypeNotNull) continue;

			const value = this._values[r][1];
			const valueLocation = new CellLocation(this._sheetName, r, 1);
			const isValueNotNull = new Validator(value)
				.isNotNull(LOG_TYPES.ERROR, valueLocation);
			if (!isValueNotNull) continue;

			switch (dataType) {
				case DATA_TYPES.CHAPTER_TITLE: {
					// 未登録の章情報、問題情報があれば追加する
					if (chapter) chapter.addQuestion(question);
					workbookInfo.addChapter(chapter);
					chapter = new Chapter(value);
					question = undefined;
					if (DEBUG_MODE) console.log(value);
					break;
				}
				case DATA_TYPES.CHAPTER_DESCRIPTION: {
					if (chapter) chapter.description = value;
					break;
				}
				case DATA_TYPES.OPTION: {
					const isOptionIncluded = new Validator(value)
						.isIncludedOption(LOG_TYPES.ERROR, valueLocation);
					if (isOptionIncluded) chapter.setOption(value);
					break;
				}
				case DATA_TYPES.QUESTION_SENTENCE: {
					// 未登録の問題情報があれば追加する
					if (chapter) chapter.addQuestion(question);
					question = new Question(value);
					if (DEBUG_MODE) console.log(value);
					break;
				}
				case DATA_TYPES.HELP_TEXT: {
					if (question) question.helpText = value;
					break;
				}
				case DATA_TYPES.CHOICE: {
					const isCorrect = this._values[r][2];
					if (question) question.addChoice(new Choice(value, isCorrect));
					break;
				}
				case DATA_TYPES.ANSWER: {
					if (question) question.answer = value;
					break;
				}
				case DATA_TYPES.EXPLANATION: {
					if (question) question.explanation = value;
					break;
				}
				case DATA_TYPES.LINK: {
					const displayText = this._values[r][2];
					if (question) question.addLink(new Link(value, displayText));
					break;
				}
			}
		}

		// 未登録の章情報、問題情報があれば追加する
		if (chapter) chapter.addQuestion(question);
		workbookInfo.addChapter(chapter);
	}
}
