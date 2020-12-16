import { FormGenerator } from './FormGenerator';

declare let global: any;

global.FormGeneratorExecuter = function (): void {
	new FormGenerator().main();
};
