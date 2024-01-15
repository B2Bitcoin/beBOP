import { UrlDependency } from '$lib/types/UrlDependency';
import { fetchOrderForUser } from '../fetchOrderForUser';

export async function load({ params, depends }) {
	depends(UrlDependency.Order);

	const order = await fetchOrderForUser(params.id);

	return {
		order
	};
}