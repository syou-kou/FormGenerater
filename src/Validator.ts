import { CellLocation } from './CellLocation';
import { LOG_TYPES, VALIDATION_TYPES } from './const';
import { log } from './FormGenerator';

export class Validator {
	private _value: string;
	private _cellLocation: CellLocation;

	constructor(value: string, cellLocation: CellLocation) {
		this._value = value;
		this._cellLocation = cellLocation;
	}

	public validate(validationType: string, args: Array<string>, logType: string): boolean {
		const isCorrect = this.isCorrect(validationType, args);
		if (logType !== LOG_TYPES.NONE && !isCorrect) {
			let message = this.createMessage(validationType);
			if (this.cellLocation) {
				message += `"\n(${this.cellLocation.toString()})"`;
			}
			log.printLog(logType, message);
		}
		return isCorrect;
	}

	private isCorrect(validationType: string, args: Array<string>): boolean {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:
				return this.value !== '';
			case VALIDATION_TYPES.DATA_TYPE:
				return this.value === args[0];
		}
	}

	private createMessage(validationType: string): string {
		switch (validationType) {
			case VALIDATION_TYPES.NOT_NULL:
				return this.value + 'が取得できません';
			case VALIDATION_TYPES.DATA_TYPE:
				return this.value + 'ではありません';
		}
	}

	public get value(): string {
		return this._value;
	}
	// public set value(value: string) {
	// 	this._value = value;
	// }
	public get cellLocation(): CellLocation {
		return this._cellLocation;
	}
	// public set cellLocation(value: CellLocation) {
	// 	this._cellLocation = value;
	// }
}
