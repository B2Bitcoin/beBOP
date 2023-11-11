import { PUBLIC_COMMIT_ID } from '$env/static/public';

export const GET = () =>
	new Response(PUBLIC_COMMIT_ID, { headers: { 'Content-Type': 'text/plain' } });
