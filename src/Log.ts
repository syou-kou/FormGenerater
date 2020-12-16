import { activeSpreadsheet } from './FormGenerator';

export class Log {
	private _logSheet: GoogleAppsScript.Spreadsheet.Sheet; // ログ出力用シート

	constructor(sheetName: string) {
		this._logSheet = activeSpreadsheet.getSheetByName(sheetName);
	}

	public clearLog(): void {
		if (this._logSheet.getLastRow() >= 2) {
			this._logSheet.getRange(2, 1, this._logSheet.getLastRow() - 1, 2).clearContent();
		}
	}

	public printLog(logType: string, message: string): void {
		console.log(message);
		this._logSheet
			.getRange(this._logSheet.getLastRow() + 1, 1, 1, 2)
			.setValues([[logType, message]]);
	}

	public get logSheet(): GoogleAppsScript.Spreadsheet.Sheet {
		return this._logSheet;
	}
	// public set logSheet(value: GoogleAppsScript.Spreadsheet.Sheet) { this._logSheet = value; }
}
