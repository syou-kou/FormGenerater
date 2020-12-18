import { CellLocation } from './CellLocation';
import { LOG_TYPES, VALIDATION_TYPES } from './const';
import { log } from './FormGenerator';

export class Validator {
	private _value: string;

	constructor(value: string) {
		this._value = value;
	}

	public isNotNull(logType: string, cellLocation: CellLocation): boolean {
		return this.validate(VALIDATION_TYPES.NOT_NULL, [], logType, cellLocation);
	}
	public isCorrectDataType(correctDataType: string, logType: string, cellLocation: CellLocation): boolean {
		return this.validate(VALIDATION_TYPES.DATA_TYPE, [correctDataType], logType, cellLocation);
	}

	private validate(validationType: string, args: Array<string>, logType: string, cellLocation: CellLocation): boolean {
		if (this.isCorrectValue(validationType, args)) return true;

		if (logType !== LOG_TYPES.NONE) {
			let message = this.createMessage(validationType);
			if (!!cellLocation) {
				message += `"\n(${cellLocation.toString()})"`;
			}
			log.printLog(logType, message);
		}
		return false;
	}

	private isCorrectValue(validationType: string, args: Array<string>): boolean {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:
				return !!this._value;
			case VALIDATION_TYPES.DATA_TYPE:
				return (!!this._value && !!args[0] && this._value === args[0]);
		}
	}

	private createMessage(validationType: string): string {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:
				return this._value + 'が取得できません';
			case VALIDATION_TYPES.DATA_TYPE:
				return this._value + 'ではありません';
		}
	}

	// public get value(): string {
	// 	return this._value;
	// }
	// public set value(value: string) {
	// 	this._value = value;
	// }
}
