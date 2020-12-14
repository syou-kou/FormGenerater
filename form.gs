class Form {

  constructor(chapter, folder) {
    this.chapter = new Chapter();
    this.chapter = chapter;       // 章情報
    this.folder = folder;         // 保存先フォルダ
    this.form = null;             // フォーム情報
  }
  
  // 解答形式に応じてアイテムを作成する
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
  setQuestionInfo(item, question, answerType) {
    // すべての解答形式に共通する項目
    item.setTitle(question.sentence); // 問題文
    item.setRequired(false);          // 必須回答オプション
    item.setPoints(1);                // 得点
    
    // フィードバック内容(解答形式により呼び出すメソッドが異なる)
    let feedback = FormApp.createFeedback();
    feedback.setText(question.explanation);         // 解説文
    for (const link of question.links) {
      feedback.addLink(link.url, link.displayText); // リンク
    }
    const feedbackBuilder = feedback.build();
    
    // 単一/複数選択式に共通する項目
    if (answerType === ANSWERTYPE_SELECTION_SINGLE || answerType === ANSWERTYPE_SELECTION_MULTIPLE) {
      // 選択肢情報
      let choices = [];
      for (const choice of question.choices) {
        choices.push(item.createChoice(choice.sentence, choice.isCorrect));
      }
      item.setChoices(choices);
      // その他項目表示オプション
      item.showOtherOption(false);
      // 正解/不正解時フィードバック
      item.setFeedbackForCorrect(feedbackBuilder);
      item.setFeedbackForIncorrect(feedbackBuilder);
    }
    // 記述式のみの項目
    if (answerType === ANSWERTYPE_DESCRIPTION) {
      // フィードバック
      item.setGeneralFeedback(feedbackBuilder);
    }
  }
  
  // 作成したフォームを保存先フォルダに移動する
  moveForm() {
    const file = DriveApp.getFileById(this.form.getId());
    this.folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
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
      // 解答形式に応じてアイテムを作成する
      const answerType = question.getAnswerType();
      let item = this.createItem(answerType);
      // アイテム未作成時は、以降の処理を行わない
      if (item === undefined) { return; }
      // フォームに問題情報を追加する
      this.setQuestionInfo(item, question, answerType);
    }
    // 作成したフォームを保存先フォルダに移動する
    this.moveForm();
  }
  
}
