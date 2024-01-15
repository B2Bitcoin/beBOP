import { describe, expect, it } from 'vitest';
import { generateId } from './generateId';

describe('generateId', () => {
	it("shouldn't include '_' in the generated id", () => {
		for (let i = 0; i < 100; i++) {
			const id = generateId('test', true);
			expect(id).not.toContain('_');
		}
	});
});
