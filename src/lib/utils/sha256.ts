// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function sha256(message: string): Promise<string> {
	const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}
