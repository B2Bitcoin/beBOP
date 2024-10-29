export function escapeForRegex(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Échappe tous les caractères spéciaux
}
