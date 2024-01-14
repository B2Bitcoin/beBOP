import { kebabCase } from './kebabCase';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export function generateId(name: string, randomize: boolean): string {
	return (
		kebabCase(
			name
				.normalize('NFKD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/&/g, '-and-')
		) + (randomize ? '-' + nanoid() : '')
	);
}
