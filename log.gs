class Log {
  
  constructor() {
    this.sheet = activeSpreadsheet.getSheetByName(SHEET_NAME_LOG);
  }
  
  clearLog() {
    if (this.sheet.getLastRow() >= 2) {
      this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, 2).clearContent();
    }
  }
  
  printLog(type, message) {
    console.log(message);
    this.sheet.getRange(this.sheet.getLastRow() + 1, 1, 1, 2).setValues([[type, message]]);
  }
  
  printLongLog(type, message, sheetName, rowId, colId) {
    const location = "\n(" + sheetName + "シート" + (rowId + 1) + "行" + (colId + 1) + "列)";
    this.printLog(type, message + location);
  }
  
}
