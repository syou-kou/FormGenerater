const activeSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
let log: Log;
let workbookInfo: WorkbookInfo;

class FormGenerator {

	constructor() {
	}

	// スプレッドシートの問題情報からフォームを作成する
	public main(): boolean {
		log = new Log(SHEET_NAME_LOG);
		if (!log) return false;
		log.clearLog();

		workbookInfo = new WorkbookInfo();

		this.readFirstSheet();
		if (!workbookInfo.workbookTitle || !workbookInfo.sheetNames) {
			return false;
		}
		this.readOtherSheets();
		this.createForms();
		return true;
	}

	// target (or sample)シートの情報を取得する
	private readFirstSheet() {
		const sheetName = DEBUG_MODE ? "sample" : "target";
		const firstSheet = new FirstSheet(sheetName);
		firstSheet.readWorkbookTitle(1);
		firstSheet.readSheetNames(2);
	}

	// target (or sample)以外のすべてのシートの情報を取得する
	private readOtherSheets() {
		// for (let sheetId = 0; sheetId < workbookInfo.sheetNames.length; sheetId++) {
		// 	const sheetName = workbookInfo.sheetNames[sheetId];
		// 	const isLastSheet = (sheetId === workbookInfo.sheetNames.length - 1);
		// 	const sheet = new OtherSheet(sheetName, isLastSheet);
		// 	sheet.readQuestionInfo(1);
		// }
		workbookInfo.sheetNames.forEach((sheetName, index) => {
			const isLastSheet = (index === workbookInfo.sheetNames.length - 1);
			const otherSheet = new OtherSheet(sheetName, isLastSheet);
			otherSheet.readQuestionInfo(1);
		});
	}

	// 問題情報からフォームを作成する
	private createForms() {
		const saveFolder = DriveApp.createFolder(workbookInfo.workbookTitle);
		for (const chapter of workbookInfo.chapters) {
			console.log(chapter.title);
			new Form(chapter, saveFolder).createForm();
		}
	}
}
