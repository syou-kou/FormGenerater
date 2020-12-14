const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
let log;
let workbookInfo;

class FormGenerater {
  
  constructor() {
    log = new Log();
    workbookInfo = new WorkbookInfo();
  }
  
  // スプレッドシートの問題情報からフォームを作成する
  main() {
    log.clearLog();
    this.readFirstSheet();
    if (!workbookInfo.workbookTitle || !workbookInfo.sheetNames) {
      return false;
    }
    this.readOtherSheets();
    this.createForms();
    return true;
  }
  
  // target (or sample)シートの情報を取得する
  // private
  readFirstSheet() {
    const sheetName = DEBUG_MODE ? "sample" : "target";
    const sheet = new FirstSheet(sheetName);
    sheet.readWorkbookTitle(1);
    sheet.readSheetNames(2);
  }
  
  // target (or sample)以外のすべてのシートの情報を取得する
  // private
  readOtherSheets() {
    for (let sheetId = 0; sheetId < workbookInfo.sheetNames.length; sheetId ++) {
      const sheetName = workbookInfo.sheetNames[sheetId];
      const isLastSheet = (sheetId === workbookInfo.sheetNames.length - 1);
      const sheet = new OtherSheet(sheetName, isLastSheet);
      sheet.readQuestionInfo(1);
    }
  }
  
  // 問題情報からフォームを作成する
  // private
  createForms() {
    const saveFolder = DriveApp.createFolder(workbookInfo.workbookTitle);
    for (const chapter of workbookInfo.chapters) {
      console.log(chapter.title);
      new Form(chapter, saveFolder).createForm();
    }
  }
}
