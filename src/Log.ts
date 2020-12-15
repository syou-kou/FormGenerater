class Log {

	private _logSheet: any; // ログ出力用シート

	constructor(sheetName: string) {
		this._logSheet = activeSpreadsheet.getSheetByName(sheetName);
	}

	public get logSheet(): any { return this._logSheet; }
	public set logSheet(value: any) { this._logSheet = value; }

	public clearLog() {
		if (this._logSheet.getLastRow() >= 2) {
			this._logSheet.getRange(2, 1, this._logSheet.getLastRow() - 1, 2).clearContent();
		}
	}

	public printLog(logType: string, message: string) {
		console.log(message);
		this._logSheet.getRange(this._logSheet.getLastRow() + 1, 1, 1, 2).setValues([[logType, message]]);
	}

}