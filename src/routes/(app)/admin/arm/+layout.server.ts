import { roles } from '$lib/server/role';

export const load = () => {
	return {
		roles: roles()
	};
};
