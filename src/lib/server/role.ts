import { POS_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User';

export async function roles() {
	return [
		{
			_id: SUPER_ADMIN_ROLE_ID,
			name: 'Super Admin'
		},
		{
			_id: POS_ROLE_ID,
			name: 'Point of Sale'
		}
	];
}
