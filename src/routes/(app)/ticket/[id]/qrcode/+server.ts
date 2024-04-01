import { ORIGIN } from '$env/static/private';
import qrcode from 'qrcode';

export async function GET({ params }) {
	return new Response(
		await qrcode.toString(new URL('/ticket/' + params.id, ORIGIN).href, { type: 'svg', margin: 0 }),
		{
			headers: { 'content-type': 'image/svg+xml' },
			status: 200
		}
	);
}
