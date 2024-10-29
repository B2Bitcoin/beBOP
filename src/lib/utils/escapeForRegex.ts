export function escapeForRegex(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); //Escape all special characters
}
