class Log {
  
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
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
  
}
