import { CellLocation } from './CellLocation';
import { LOG_TYPES, OPTION_TYPES, VALIDATION_TYPES } from './const';
import { log } from './FormGenerator';

export class Validator {
	private _value: string;

	constructor(value: string) {
		this._value = value;
	}

	public isNotNull(logType: string, cellLocation: CellLocation): boolean {
		return this.validate(VALIDATION_TYPES.NOT_NULL, [], logType, cellLocation);
	}
	public isIncludedOption(logType: string, cellLocation: CellLocation): boolean {
		return this.validate(VALIDATION_TYPES.INCLUDED_OPTION, Object.values(OPTION_TYPES), logType, cellLocation);
	}

	private validate(validationType: string, args: Array<string>, logType: string, cellLocation: CellLocation): boolean {
		if (this.isCorrectValue(validationType, args)) return true;

		if (logType !== LOG_TYPES.NONE) {
			let message = this.createMessage(validationType, args);
			if (cellLocation) {
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
			case VALIDATION_TYPES.INCLUDED_OPTION:
				return (!!this._value && !!args && args.includes(this._value));
		}
	}

	private createMessage(validationType: string, args: Array<string>): string {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:
				return '値が取得できません';
			case VALIDATION_TYPES.INCLUDED_OPTION:
				return `'${this._value}というオプションは登録されていません'`;
		}
	}

	// public get value(): string {
	// 	return this._value;
	// }
	// public set value(value: string) {
	// 	this._value = value;
	// }
}
