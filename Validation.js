class Validation {

	constructor(value, cellLocation) {
		this.value = value;
		this.cellLocation = cellLocation;
	}

	validate(validationType, args, logType) {
		const isCorrect = this.isCorrect(validationType, args);
		if (logType && !isCorrect) {
			let message = this.createMessage(validationType);
			if (this.cellLocation) {
				message += "\n(" + this.cellLocation.toString() + ")";
			}
			log.printLog(logType, message);
		}
		return 
	}

	// private
	isCorrect(validationType, args) {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:  return (this.value !== "");
			case VALIDATION_TYPES.DATA_TYPE: return (this.value === args[0]);
		}
	}

	// private
	createMessage(validationType) {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:  return this.value + "が取得できません";
			case VALIDATION_TYPES.DATA_TYPE: return this.value + "ではありません";
		}
	}

	// isCorrectDataType(correctDataType) {
	// 	if (this.value !== correctDataType) {
	// 		log.printLogWithLocation(LOG_TYPE_ERROR, correctDataType + "の行ではありません。", this.sheetName, this.rowId, this.colId);
	// 		return true;
	// 	}
	// 	return false;
	// }

	// isNullString(dataType) {
	// 	if (this.value === "") {
	// 		log.printLogWithLocation(LOG_TYPE_ERROR, dataType + "", this.sheetName, this.rowId, this.colId);
	// 		return true;
	// 	}
	// 	return false;
	// }

}
