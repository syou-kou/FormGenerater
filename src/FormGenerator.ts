import { DEBUG_MODE, SHEET_NAME_LOG } from './const';
import { Form } from './Form';
import { Log } from './Log';
import { FirstSheet, OtherSheet } from './Sheet';
import { WorkbookInfo } from './WorkbookInfo';

export const activeSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
export let log: Log;
export let workbookInfo: WorkbookInfo;

export class FormGenerator {
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
		const sheetName = DEBUG_MODE ? 'sample' : 'target';
		const firstSheet = new FirstSheet(sheetName);
		firstSheet.readWorkbookTitle(1);
		firstSheet.readSheetNames(2);
	}

	// target (or sample)以外のすべてのシートの情報を取得する
	private readOtherSheets() {
		workbookInfo.sheetNames.forEach((sheetName, index) => {
			const isLastSheet = index === workbookInfo.sheetNames.length - 1;
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
