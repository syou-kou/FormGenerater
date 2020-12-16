export class CellLocation {
	private _sheetName: string;
	private _rowId: number;
	private _colId: number;

	private static alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	constructor(sheetName: string, rowId: number, colId: number) {
		this._sheetName = sheetName;
		this._rowId = rowId;
		this._colId = colId;
	}

	public toString(): string {
		const isNotNull = !!(this._sheetName && this._rowId && this._colId);
		if (isNotNull) {
			const colId =
				this._colId < CellLocation.alphabets.length
					? CellLocation.alphabets.charAt(this._colId)
					: this._colId + 1;
			return `"${this._sheetName}シート${this._rowId + 1}行${colId}列"`;
		}
		return '';
	}

	public get sheetName(): string {
		return this._sheetName;
	}
	// public set sheetName(value: string) { this._sheetName = value; }
	public get rowId(): number {
		return this._rowId;
	}
	// public set rowId(value: number) { this._rowId = value; }
	public get colId(): number {
		return this._colId;
	}
	// public set colId(value: number) { this._colId = value; }
}
