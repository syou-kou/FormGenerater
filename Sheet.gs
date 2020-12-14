class Cell {
  
  constructor(sheetName, rowId, colId, value) {
    this.sheetName = sheetName;
    this.rowId = rowId;
    this.colId = colId;
    this.value = value;
  }
  
  isIncorrectDataType(correctDataType) {
    if (this.value !== correctDataType) {
      log.printLongLog(LOGTYPE_ERROR, correctDataType + "の行ではありません。", this.sheetName, this.rowId, this.colId);
      return true;
    }
    return false;
  }
  
  isNullString(dataType) {
    if (this.value === "") {
      log.printLongLog(LOGTYPE_ERROR, dataType + "が取得できません。", this.sheetName, this.rowId, this.colId);
      return true;
    }
    return false;
  }
  
}

class Sheet {
  
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.sheet = activeSpreadsheet.getSheetByName(this.sheetName);
    this.values = this.sheet.getDataRange().getValues();
  }
  
}

class FirstSheet extends Sheet {
  
  constructor(sheetName) {
    super(sheetName);
  }
  
  // 第(rowId + 1)行から問題集タイトルを取得する
  readWorkbookTitle(rowId) {
    const dataType = this.values[rowId][0];
    if (!new Cell(this.sheetName, rowId, 0, dataType).isIncorrectDataType(DATATYPE_WORKBOOK_TITLE)) {
      const workbookTitle = this.values[rowId][1];
      if (!new Cell(this.sheetName, rowId, 1, workbookTitle).isNullString(DATATYPE_WORKBOOK_TITLE)) {
        workbookInfo.workbookTitle = workbookTitle;
      }
    }
  }
  
  // 第(startRowId + 1)行以降からシート名をすべて取得する
  readSheetNames(startRowId) {
    let sheetNames = [];
    for (let r = startRowId; r < this.sheet.getLastRow(); r ++) {
      const dataType = this.values[r][0];
      if (dataType !== DATATYPE_SHEET_NAME) continue;
      const sheetName = this.values[r][1];
      if (new Cell(this.sheetName, r, 1, sheetName).isNullString(DATATYPE_SHEET_NAME)) continue;
      sheetNames.push(sheetName);
    }
    workbookInfo.sheetNames = sheetNames;
  }
}

class OtherSheet extends Sheet {
  
  constructor(sheetName, isLastSheet) {
    super(sheetName);
    this.isLastSheet = isLastSheet;
  }
  
  // 第(startRowId + 1)行以降から問題情報をすべて取得する
  readQuestionInfo(startRowId) {
    let chapter;
    let question;
    for (let r = startRowId; r < this.sheet.getLastRow(); r ++) {
      const dataType = this.values[r][0];
      if (dataType === "") continue;
      const value = this.values[r][1];
      if (new Cell(this.sheetName, r, 1, value).isNullString(dataType)) continue;
      
      if (dataType === DATATYPE_CHAPTER_TITLE) {
        // 未登録の章情報、問題情報があれば追加する
        if (chapter !== undefined) chapter.addQuestion(question);
        workbookInfo.addChapter(chapter);
        
        chapter = new Chapter(value);
        question = undefined;
        if (DEBUG_MODE) console.log(value);
        
      } else if (dataType === DATATYPE_CHAPTER_DESCRIPTION) {
        if (chapter !== undefined) chapter.description = value;
        
      } else if (dataType === DATATYPE_QUESTION_SENTENCE) {
        // 未登録の問題情報があれば追加する
        if (chapter !== undefined) chapter.addQuestion(question);
        
        question = new Question(value);
        if (DEBUG_MODE) console.log(value);
        
      } else if (dataType === DATATYPE_HELPTEXT) {
        if (question !== undefined) question.helpText = value;
        
      } else if (dataType === DATATYPE_CHOICE) {
        const isCorrect = this.values[r][2];
        if (question !== undefined) question.addChoice(value, isCorrect);
        
      } else if (dataType === DATATYPE_ANSWER) {
        if (question !== undefined) question.answer = value;
        
      } else if (dataType === DATATYPE_EXPLANATION) {
        if (question !== undefined) question.explanation = value;
        
      } else if (dataType === DATATYPE_LINK) {
        const displayText = this.values[r][2];
        if (question !== undefined) question.addLink(value, displayText);
        
      }
    }
    
//    if (this.isLastSheet) {
      // 未登録の章情報、問題情報があれば追加する
      if (chapter !== undefined) chapter.addQuestion(question);
      workbookInfo.addChapter(chapter);
//    }
    
  }
  
}
