export function pluralize(count: number, word: string, plural?: string): string {
	return count === 1 ? word : plural ?? `${word}s`;
}
