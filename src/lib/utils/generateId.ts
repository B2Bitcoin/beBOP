import { kebabCase } from './kebabCase';
import { nanoid } from 'nanoid';

export function generateId(name: string, randomize: boolean): string {
	return (
		kebabCase(
			name
				.normalize(name)
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/&/g, '-and-')
		) + (randomize ? '-' + nanoid(6) : '')
	);
}
