import { nanoid } from 'nanoid';
import { kebabCase } from './kebabCase';

export function generateId(name: string): string {
	return kebabCase(name.replace(/&/g, '-and-')) + '-' + nanoid(6);
}
