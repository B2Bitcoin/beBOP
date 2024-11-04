import { phoenixdGetBolt12 } from '$lib/server/phoenixd';
import qrcode from 'qrcode';

export async function GET({}) {
	const bolt12Address = await phoenixdGetBolt12();
	return new Response(await qrcode.toString('lightning:' + bolt12Address, { type: 'svg' }), {
		headers: { 'content-type': 'image/svg+xml' },
		status: 200
	});
}
