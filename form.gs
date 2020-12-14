class Form {

  constructor(chapter, folder) {
    this.chapter = new Chapter();
    this.chapter = chapter;       // 章情報
    this.folder = folder;         // 保存先フォルダ
    this.form = null;             // フォーム情報
  }
  
  // フォームを章単位で作成する
  // 対象となる章のすべての問題情報を取得してから呼び出すこと
  createForm() {
    // フォームを新規作成
    this.form = FormApp.create(this.chapter.title);
    // 章概要
    this.form.setDescription(this.chapter.description);
    // テスト形式オプション
    this.form.setIsQuiz(true);
    // 進行状況バーを表示する
    this.form.setProgressBar(true);
    // 問題情報
    for (const question of this.chapter.questions) {
      // 問題情報を出力する
      if (DEBUG_MODE) question.printQuestionInfo();
      // 解答形式を判別する
      question.setAnswerType();
      // 解答形式に応じてアイテムを作成する
      let item = this.createItem(question.answerType);
      // アイテム作成時のみ、フォームに問題情報を追加する
      if (item !== undefined) {
        this.setQuestionInfo(item, question);
        // 記述式の場合のみ、警告メッセージを出力する
        if (question.answerType === ANSWERTYPE_DESCRIPTION) {
          log.printLog(LOGTYPE_WARNING, "問題「" + question.sentence + "」の記述解答はフォーム作成後、手作業で反映をお願いします。");
        }
      }
    }
    // 作成したフォームを保存先フォルダに移動する
    this.moveForm();
  }
  
  // 解答形式に応じてアイテムを作成する
  // private
  createItem(answerType) {
    switch (answerType) {
      // 単一選択式の場合(ラジオボタン)
      case ANSWERTYPE_SELECTION_SINGLE:
        return this.form.addMultipleChoiceItem();
      // 複数選択式の場合(チェックボックス)
      case ANSWERTYPE_SELECTION_MULTIPLE:
        return this.form.addCheckboxItem();
      // 記述式の場合(テキスト)
      case ANSWERTYPE_DESCRIPTION:
        return this.form.addTextItem();
      // 判別不能
      default:
        return undefined;
    }
  }
  
  // 解答形式に応じてフォームに問題情報を追加する
  // private
  setQuestionInfo(item, question) {
    // すべての解答形式に共通する項目
    item.setTitle(question.sentence);    // 問題文
    item.setHelpText(question.helpText); // 問題文備考
    item.setRequired(false);             // 必須回答オプション
    item.setPoints(1);                   // 得点
    
    // フィードバック内容(解答形式により呼び出すメソッドが異なる)
    let feedback = FormApp.createFeedback();
    // 解説文
    const explanation = (question.explanation === undefined || question.explanation === "") ? "解説文はまだ登録されていません" : question.explanation;
    feedback.setText(explanation);
    // リンク
    console.log(question.links.length);
    if (question.links.length > 0) {
      for (const link of question.links) {
        const url = (link.url === undefined || link.url === "") ? "No links" : link.url;
        const displayText = (link.displayText === undefined || link.displayText === "") ? "リンク" : link.displayText;
        if (DEBUG_MODE) console.log(url);
        if (DEBUG_MODE) console.log(displayText);
        feedback.addLink(url, displayText);
      }
    }
    const feedbackBuilder = feedback.build();
    console.log(feedbackBuilder);
    
    // 単一/複数選択式に共通する項目
    if (question.answerType === ANSWERTYPE_SELECTION_SINGLE || question.answerType === ANSWERTYPE_SELECTION_MULTIPLE) {
      // 選択肢情報
      let choices = [];
      for (const choice of question.choices) {
        choices.push(item.createChoice(choice.sentence, choice.isCorrect));
      }
      item.setChoices(choices);
      // その他項目表示オプション
      item.showOtherOption(false);
      // 正解/不正解時フィードバック
      if (feedbackBuilder !== undefined) {
        item.setFeedbackForCorrect(feedbackBuilder);
        item.setFeedbackForIncorrect(feedbackBuilder);
      }
    }
    // 記述式のみの項目
    if (question.answerType === ANSWERTYPE_DESCRIPTION) {
      // フィードバック
      if (feedbackBuilder !== undefined) {
        item.setGeneralFeedback(feedbackBuilder);
      }
    }
  }
  
  // 作成したフォームを保存先フォルダに移動する
  // private
  moveForm() {
    const file = DriveApp.getFileById(this.form.getId());
    this.folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }
  
}
