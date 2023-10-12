export function trimPrefix(s: string, prefix: string) {
	if (s.startsWith(prefix)) {
		return s.slice(prefix.length);
	}
	return s;
}
