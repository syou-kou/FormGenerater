// デバッグモード
// ・対象シートが「sample」になる
// ・一部のメッセージを追加出力する
const DEBUG_MODE = true;

// ログ出力シート名
const SHEET_NAME_LOG = "log";

// ログ種別
const LOG_TYPES = {
	ERROR:    "エラー",
	WARNING:  "警告",
	QUESTION: "問題",
	NONE:     "出力対象外",
};

// データ種別
const DATA_TYPES = {
	WORKBOOK_TITLE:      "問題集タイトル",
	SHEET_NAME:          "シート名",
	CHAPTER_TITLE:       "章タイトル",
	CHAPTER_DESCRIPTION: "章概要",
	QUESTION_SENTENCE:   "問題文",
	HELP_TEXT:           "問題文備考",
	CHOICE:              "選択肢",
	ANSWER:              "記述解答",
	EXPLANATION:         "解説文",
	LINK:                "リンク",
};

// 選択肢の正解
const CHOICE_IS_CORRECT = "〇";

// 解答形式
// const ANSWER_TYPES.SELECTION_SINGLE = "単一選択式";
// const ANSWER_TYPES.SELECTION_MULTIPLE = "複数選択式";
// const ANSWER_TYPES.DESCRIPTION = "記述式";
// const ANSWER_TYPES.OTHER = "判別不能";
const ANSWER_TYPES = {
	SELECTION_SINGLE:   "単一選択式",
	SELECTION_MULTIPLE: "複数選択式",
	DESCRIPTION:        "記述式",
	OTHER:              "判別不能",
};

// チェック種別
const VALIDATION_TYPES = {
	NOT_NULL:  "NOT_NULL",
	DATA_TYPE: "DATA_TYPE",
}