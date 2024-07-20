import { addSeconds } from 'date-fns';
import { runtimeConfig } from './runtime-config';

export function isPaypalEnabled() {
	return !!runtimeConfig.paypal.clientId && !!runtimeConfig.paypal.secret;
}

let cachedToken: string | null = null;
let tokenExpiresAt: Date | null = null;
let credentialsUsedForToken: string | null = null;

/**
 * Get an access token for the PayPal API.
 *
 * Also caches the token locally depending on expiration, so call it every time instead of storing the token
 * inside a variable, to ensure it's always fresh.
 */
export async function paypalAccessToken(): Promise<string> {
	const credentials = `${runtimeConfig.paypal.clientId}:${runtimeConfig.paypal.secret}`;

	if (
		cachedToken &&
		tokenExpiresAt &&
		credentialsUsedForToken === credentials &&
		tokenExpiresAt > new Date()
	) {
		return cachedToken;
	}

	const response = await fetch('https://api.paypal.com/v1/oauth2/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	});

	if (!response.ok) {
		throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`);
	}

	const data: {
		access_token: string;
		expires_in: number;
	} = await response.json();

	cachedToken = data.access_token;
	tokenExpiresAt = addSeconds(new Date(), data.expires_in - 10);
	credentialsUsedForToken = credentials;

	return data.access_token;
}
