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
		this.helpText;            // 問題文備考
		this.choices = [];        // 選択肢情報配列
		this.answer;              // 記述解答
		this.explanation;         // 解説文
		this.links = [];          // リンク情報配列
		this.answerType = "";     // 解答形式
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

	// 解答形式を判別し、判別不能の場合はメッセージを出力する
	// 問題情報をすべて取得してから呼び出すこと
	setAnswerType() {
		//-------------------------
		// 選択肢が入力されている場合
		//-------------------------
		if (this.choices.length > 0) {
			// 正答の個数を取得する
			let correctNumber = 0;
			for (const choice of this.choices) {
				if (choice.isCorrect) {
					correctNumber++;
				}
			}
			// (選択肢が入力されているにも関わらず)正答の個数が0の場合、判別不能
			if (correctNumber === 0) {
				this.answerType = ANSWERTYPE_OTHER;
				log.printLog(LOGTYPE_ERROR, "問題「" + this.sentence + "」は選択肢の正答が存在しないため、フォーム作成の対象外となります。");
				// 正答の個数が1の場合、単一選択式と判別する
			} else if (correctNumber === 1) {
				this.answerType = ANSWERTYPE_SELECTION_SINGLE;
				// 正答の個数が2以上の場合、複数選択式と判別する
			} else {
				this.answerType = ANSWERTYPE_SELECTION_MULTIPLE;
			}

			//---------------------------
			// 選択肢が入力されていない場合
			//---------------------------
		} else {
			// 選択肢、記述解答ともに存在しない場合、判別不能
			if (this.answer === undefined) {
				this.answerType = ANSWERTYPE_OTHER;
				log.printLog(LOGTYPE_ERROR, "問題「" + this.sentence + "」は選択肢、記述解答ともに存在しないため、フォーム作成の対象外となります。");
				// 記述解答が存在する場合、記述式と判別する
			} else {
				this.answerType = ANSWERTYPE_DESCRIPTION;
			}
		}
	}

	// 問題情報を出力する
	printQuestionInfo() {
		let info = "";

		info += "sentence: " + this.sentence + "\n";
		for (let n = 0; n < this.choices.length; n++) {
			const choice = this.choices[n];
			info += "choice " + (n + 1) + ": " + choice.sentence + " (" + choice.isCorrect + ")\n";
		}
		info += "answer: " + this.answer + "\n";
		info += "explanation: " + this.explanation + "\n";
		for (let n = 0; n < this.links.length; n++) {
			const link = this.links[n];
			info += "link " + (n + 1) + ": " + link.url + " (" + link.displayText + ")\n";
		}

		log.printLog(LOGTYPE_QUESTION, info);
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
		if (question !== undefined) {
			this.questions.push(question);
		}
	}

}

class WorkbookInfo {

	constructor() {
		this.workbookTitle = '';
		this.sheetNames = [];
		this.chapters = [];
	}

	// 問題集情報に章情報を1つ追加する
	addChapter(chapter) {
		if (chapter !== undefined) {
			this.chapters.push(chapter);
		}
	}

}
