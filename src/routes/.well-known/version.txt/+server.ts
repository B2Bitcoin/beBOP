import { PUBLIC_VERSION } from '$env/static/public';

export const GET = () =>
	new Response(PUBLIC_VERSION, { headers: { 'Content-Type': 'text/plain' } });
