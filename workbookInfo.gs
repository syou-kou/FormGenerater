class Choice {

  constructor(sentence, isCorrect) {
    this.sentence = sentence;                           // 選択肢の文
    this.isCorrect = (isCorrect === CHOICE_IS_CORRECT); // 正誤情報(trueなら正答、falseなら誤答)
  }

}

class Link {

  constructor(url, displayText) {
    this.url = url;                 // リンクのアドレス
    this.displayText = displayText; // アドレス上に表示するテキスト
  }

}

class Question {

  constructor(sentence) {
    this.sentence = sentence; // 問題文
    this.choices = [];        // 選択肢情報配列
    this.answer;              // 記述解答
    this.explanation;         // 解説文
    this.links = [];          // リンク情報配列
  }
  
  // 選択肢情報配列に選択肢を1つ追加する
  // 選択式（単一／複数）の場合のみ使用
  addChoice(choiceSentence, isCorrect) {
    this.choices.push(new Choice(choiceSentence, isCorrect));
  }
  
  // リンク情報配列にリンクを1つ追加する
  addLink(url, displayText) {
    this.links.push(new Link(url, displayText));
  }
  
  // 解答形式を返す
  // 問題情報(問題文、選択肢、解説文)を取得してから呼び出すこと
  getAnswerType() {
    //------------
    // 選択式の場合
    //------------
    if (this.choices.length > 0) {
      // 正答の個数を取得する
      let correctNumber = 0;
      for (const choice of this.choices) {
        if (choice.isCorrect) {
          correctNumber ++;
        }
      }
      // 正答の個数が1であれば単一選択式、2以上であれば複数選択式と判別する
      if (correctNumber === 1) {
        return ANSWERTYPE_SELECTION_SINGLE;
      } else if (correctNumber >= 2) {
        return ANSWERTYPE_SELECTION_MULTIPLE;
      }
      
    //------------
    // 記述式の場合
    //------------
    } else if (this.answer !== undefined) {
      return ANSWERTYPE_DESCRIPTION;
      
    }
    
    //--------------
    // 判別不能の場合
    //--------------
    // 選択肢は存在するが、正答が存在しない場合(〇の入力漏れ)
    // 選択肢が存在せず、記述解答も存在しない場合(記述解答の入力漏れ)
    console.log("この問題は選択式、記述式のいずれとも解釈できません。「" + this.sentence + "」");
    return ANSWERTYPE_OTHER;
  }
  
  // 問題情報をコンソール出力する
  printQustionInfo() {
    let info = "\n";
    
    info += "sentence: " + this.sentence + "\n";
    for (let n = 0; n < this.choices.length; n ++) {
      const choice = this.choices[n];
      info += "choice " + (n + 1) + ": " + choice.sentence + " (" + choice.isCorrect + ")\n";
    }
    info += "answer: " + this.answer + "\n";
    info += "explanation: " + this.explanation + "\n";
    for (let n = 0; n < this.links.length; n ++) {
      const link = this.links[n];
      info += "link " + (n + 1) + ": " + link.url + " (" + link.displayText + ")\n";
    }
    info += "answer type: " + this.getAnswerType() + "\n";
    
    console.log(info);
  }
  
}

class Chapter {

  constructor(title) {
    this.title = title;     // 章タイトル
    this.description = "";  // 章概要
    this.questions = [];    // 問題情報配列
  }
  
  // 章情報に問題情報を1つ追加する
  addQuestion(question) {
    question.printQustionInfo();
    this.questions.push(question);
  }
  
}
