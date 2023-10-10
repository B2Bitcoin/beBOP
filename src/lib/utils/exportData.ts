import { collections } from '../server/database';

export async function exportDatabase() {
	try {
		const challenges = await collections.challenges.find().toArray();
		const users = await collections.users.find().toArray();

		return { challenges, users };
	} catch (error) {
		console.error('Error exporting database:', error);
		throw error;
	}
}
