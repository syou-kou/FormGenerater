let log;

function main() {
  // ログ出力用
  log = new Log();
  log.clearLog();
  
  // スプレッドシートの情報を取得する
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 対象シートの全セルの値を取得する
  const sheetName = DEBUG_MODE ? "sample" : "target";
  const values = activeSpreadsheet.getSheetByName(sheetName).getDataRange().getValues();
  
  // 第1行から問題集タイトルを取得する
  if (values[0][0] !== DATATYPE_WORKBOOK_TITLE) {
    log.printLog(LOGTYPE_ERROR, "第1行が" + DATATYPE_WORKBOOK_TITLE + "ではありません。");
    return;
  }
  if (values[0][1] === undefined) {
    log.printLog(LOGTYPE_ERROR, "問題集タイトルが取得できません。");
    return;
  }
  const workBookTitle = values[0][1];
  
  // 問題集フォームを保存するフォルダを作成する
  const workBookFolder = DriveApp.createFolder(workBookTitle);
  
  // 第2行～最終入力行の処理
  let chapter;  // 章情報
  let question; // 問題情報
  for (let r = 1; r < activeSpreadsheet.getLastRow(); r ++) {
    // Ａ列のデータ種別を取得する
    const dataType = values[r][0];
    
    //-----------------------
    // 現在行が章タイトルの場合
    //-----------------------
    if (dataType === DATATYPE_CHAPTER_TITLE) {
      // Ｂ列の章タイトルを取得する
      const title = values[r][1];
      // フォーム未作成の章情報、問題情報があれば新規フォームを作成する
      if (chapter !== undefined) {
        if (question !== undefined) {
          chapter.addQuestion(question);
        }
        new Form(chapter, workBookFolder).createForm();
      }
      // 章情報と問題情報を初期化する
      chapter = new Chapter(title);
      console.log(title);
      question = undefined;
      
    //--------------------
    // 現在行が章概要の場合
    //--------------------
    } else if (dataType === DATATYPE_CHAPTER_DESCRIPTION) {
      // Ｂ列の章概要を取得する
      const description = values[r][1];
      // 問題情報に章概要を追加する
      chapter.description = description;
      
    //--------------------
    // 現在行が問題文の場合
    //--------------------
    } else if (dataType === DATATYPE_QUESTION_SENTENCE) {
      // Ｂ列の問題文を取得する
      const questionSentence = values[r][1];
      // フォーム未作成の問題情報があれば問題情報に追加する
      if (question !== undefined) {
        chapter.addQuestion(question);
      }
      // 問題情報を初期化する
      question = new Question(questionSentence);
      console.log(questionSentence);
      
    //-----------------------
    // 現在行が問題文備考の場合
    //-----------------------
    } else if (dataType === DATATYPE_HELPTEXT) {
      // Ｂ列の問題文備考を取得する
      const helpText = values[r][1];
      // 問題情報に問題文備考を追加する
      question.helpText = helpText;
      
    //--------------------
    // 現在行が選択肢の場合
    //--------------------
    } else if (dataType === DATATYPE_CHOICE) {
      // Ｂ列の選択肢文とＣ列の正誤情報を取得する
      const choiceSentence = values[r][1];
      const isCorrect = values[r][2];
      // 問題情報に選択肢を追加する
      question.addChoice(choiceSentence, isCorrect);
      
    //---------------------
    // 現在行が記述解答の場合
    //---------------------
    } else if (dataType === DATATYPE_ANSWER) {
      // Ｂ列の記述解答を取得する
      const answer = values[r][1];
      // 問題情報に記述解答を追加する
      question.answer = answer;
      
    //--------------------
    // 現在行が解説文の場合
    //--------------------
    } else if (dataType === DATATYPE_EXPLANATION) {
      // Ｂ列の解説文を取得する
      const explanation = values[r][1];
      // 問題情報に解説文を追加する
      question.explanation = explanation;
      
    //--------------------
    // 現在行がリンクの場合
    //--------------------
    } else if (dataType === DATATYPE_LINK) {
      // Ｂ列のアドレスとＣ列の表示テキストを取得する
      const url = values[r][1];
      const displayText = values[r][2];
      // 問題情報にリンクを追加する
      question.addLink(url, displayText);
      
    }
  }
  
  // フォーム未作成の章情報、問題情報があれば新規フォームを作成する
  if (chapter !== undefined) {
    if (question !== undefined) {
      chapter.addQuestion(question);
    }
    new Form(chapter, workBookFolder).createForm();
  }
}
