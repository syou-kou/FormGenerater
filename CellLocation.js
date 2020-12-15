class CellLocation {

	constructor(sheetName, rowId, colId) {
		this.sheetName = sheetName;
		this.rowId = rowId;
		this.colId = colId;
	}

	toString() {
		const isNotNull = (this.sheetName && this.rowId && this.colId);
		return isNotNull ? this.sheetName + "シート" + (this.rowId + 1) + "行" + (this.colId + 1) + "列" : "";
	}
}