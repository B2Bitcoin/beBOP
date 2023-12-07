export function trimOrigin(url: string) {
	return url.replace(/https?:\/\/[^/?#]+/, '');
}
