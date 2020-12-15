class Sheet {

	private _sheetName: string;
	private _sheet: any;
	private _values: Array<Array<string>>;

	constructor(sheetName: string) {
		this._sheetName = sheetName;
		this._sheet = activeSpreadsheet.getSheetByName(this._sheetName);
		this._values = this._sheet.getDataRange().getValues();
	}

	public get sheetName(): string { return this._sheetName; }
	public set sheetName(value: string) { this._sheetName = value; }
	public get sheet(): any { return this._sheet; }
	public set sheet(value: any) { this._sheet = value; }
	public get values(): Array<Array<string>> { return this._values; }
	public set values(value: Array<Array<string>>) { this._values = value; }

}

class FirstSheet extends Sheet {

	constructor(sheetName: string) {
		super(sheetName);
	}

	// 第(rowId + 1)行から問題集タイトルを取得する
	public readWorkbookTitle(rowId: number) {
		const dataType = this.values[rowId][0];
		const dataTypeValidation = new Validation(dataType, new CellLocation(this.sheetName, rowId, 0));
		const isCorrectDataType = dataTypeValidation.validate(VALIDATION_TYPES.DATA_TYPE, [DATATYPE_WORKBOOK_TITLE], LOG_TYPE_ERROR);
		if (isCorrectDataType) {
			const workbookTitle = this.values[rowId][1];
			const workbookTitleValidation = new Validation(workbookTitle, new CellLocation(this.sheetName, rowId, 1));
			const isCorrectWorkbookTitle = workbookTitleValidation.validate(VALIDATION_TYPES.NOT_NULL, [], LOG_TYPE_ERROR);
			if (isCorrectWorkbookTitle) workbookInfo.workbookTitle = workbookTitle;
		}
	}

	// 第(startRowId + 1)行以降からシート名をすべて取得する
	public readSheetNames(startRowId: number) {
		let sheetNames = [];
		for (let r = startRowId; r < this.sheet.getLastRow(); r++) {
			const dataType = this.values[r][0];
			const dataTypeValidation = new Validation(dataType, new CellLocation(this.sheetName, r, 0));
			const isCorrectDataType = dataTypeValidation.validate(VALIDATION_TYPES.DATA_TYPE, [DATATYPE_SHEET_NAME], LOG_TYPE_ERROR);
			if (!isCorrectDataType) continue;

			const sheetName = this.values[r][1];
			const sheetNameValidation = new Validation(sheetName, new CellLocation(this.sheetName, r, 1));
			const isCorrectSheetName = sheetNameValidation.validate(VALIDATION_TYPES.NOT_NULL, [], LOG_TYPE_ERROR);
			if (!isCorrectSheetName) continue;

			sheetNames.push(sheetName);
		}
		workbookInfo.sheetNames = sheetNames;
	}
}

class OtherSheet extends Sheet {

	private _isLastSheet: boolean;

	constructor(sheetName: string, isLastSheet: boolean) {
		super(sheetName);
		this._isLastSheet = isLastSheet;
	}

	public get isLastSheet(): boolean { return this._isLastSheet; }
	public set isLastSheet(value: boolean) { this._isLastSheet = value; }

	// 第(startRowId + 1)行以降から問題情報をすべて取得する
	public readQuestionInfo(startRowId: number) {
		let chapter: Chapter;
		let question: Question;
		for (let r = startRowId; r < this.sheet.getLastRow(); r++) {
			const dataType = this.values[r][0];
			const dataTypeValidation = new Validation(dataType, new CellLocation(this.sheetName, r, 0));
			const isCorrectDataType = dataTypeValidation.validate(VALIDATION_TYPES.NOT_NULL, [], undefined);
			if (!isCorrectDataType) continue;

			const value = this.values[r][1];
			const valueValidation = new Validation(value, new CellLocation(this.sheetName, r, 1));
			const isCorrectValue = valueValidation.validate(VALIDATION_TYPES.NOT_NULL, [], undefined);
			if (!isCorrectValue) continue;

			if (dataType === DATATYPE_CHAPTER_TITLE) {
				// 未登録の章情報、問題情報があれば追加する
				if (chapter) chapter.addQuestion(question);
				workbookInfo.addChapter(chapter);

				chapter = new Chapter(value);
				question = undefined;
				if (DEBUG_MODE) console.log(value);

			} else if (dataType === DATATYPE_CHAPTER_DESCRIPTION) {
				if (chapter) chapter.description = value;

			} else if (dataType === DATATYPE_QUESTION_SENTENCE) {
				// 未登録の問題情報があれば追加する
				if (chapter) chapter.addQuestion(question);

				question = new Question(value);
				if (DEBUG_MODE) console.log(value);

			} else if (dataType === DATATYPE_HELP_TEXT) {
				if (question) question.helpText = value;

			} else if (dataType === DATATYPE_CHOICE) {
				const isCorrect = this.values[r][2];
				if (question) question.addChoice(new Choice(value, isCorrect));

			} else if (dataType === DATATYPE_ANSWER) {
				if (question) question.answer = value;

			} else if (dataType === DATATYPE_EXPLANATION) {
				if (question) question.explanation = value;

			} else if (dataType === DATATYPE_LINK) {
				const displayText = this.values[r][2];
				if (question) question.addLink(new Link(value, displayText));

			}
		}

		// 未登録の章情報、問題情報があれば追加する
		if (chapter) chapter.addQuestion(question);
		workbookInfo.addChapter(chapter);
	}

}