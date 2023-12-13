import { describe, expect, it } from 'vitest';
import { orderAddressLabel } from './bitcoin';
import { ObjectId } from 'mongodb';
// import { bip84Address } from './bitcoin';

describe('bitcoin', () => {
	// dummy test so vitest doesn't complain
	it('should have labels', () => {
		expect(orderAddressLabel('orderId', new ObjectId('6577739b4feec6c5137a2202'))).toBe(
			'order:orderId:6577739b4feec6c5137a2202'
		);
	});

	// 	it('should derivate public key', () => {
	// 		const zpub =
	// 			'zpub6r8LffkeFh5if3FefxX5zq5oQnQbLxXXPE87fEskLhY2v37Tj16TzMqRL7p32wQweeq1DpRYWrvm4t3ArKHrLNnVhPkFsHGdo3h6nyoppeS';

	// 		expect(bip84Address(zpub, 0)).toBe('bc1qrw2swpufzdx9gy4aewv5q45e53stcf95ker0p7');
	// 		expect(bip84Address(zpub, 1)).toBe('bc1qa07qeugkc8u7pjv98dejfdnd5ml7qxv88zwzrn');
	// 		expect(bip84Address(zpub, 2)).toBe('bc1qlyaf3z5auqt0da07303xhhehqzxx797d3c67lr');
	// 		expect(bip84Address(zpub, 3)).toBe('bc1qsh4z5ntmcva4a0aj5u2u9c6xsx4rdr4jw7m29f');
	// 		expect(bip84Address(zpub, 4)).toBe('bc1qldvg4ldzcy8v00gvy7m22uv68fw7gz72ky7v6l');
	// 		expect(bip84Address(zpub, 5)).toBe('bc1qlgxhugactwcmz57hsreydlpvldx4ud5aj8fhh4');
	// 	});

	// 	it('should derivate public key for testnet', () => {
	// 		const vpub =
	// 			'vpub5YoHT14yexuoFrVBLXNbAUhniupoaUZXin3EXfJCpg2WhdrYiNSDW7CsFHyh3JoG26MnDv3JgDWZXjauyXdo9S46E2xZXdzgi9SXEiPyBUY';

	// 		expect(bip84Address(vpub, 0)).toBe('tb1qrw2swpufzdx9gy4aewv5q45e53stcf95ulcu6d');
	// 		expect(bip84Address(vpub, 1)).toBe('tb1qa07qeugkc8u7pjv98dejfdnd5ml7qxv8dy43cq');
	// 		expect(bip84Address(vpub, 2)).toBe('tb1qlyaf3z5auqt0da07303xhhehqzxx797dm7pdys');
	// 		expect(bip84Address(vpub, 3)).toBe('tb1qsh4z5ntmcva4a0aj5u2u9c6xsx4rdr4jycqe76');
	// 		expect(bip84Address(vpub, 4)).toBe('tb1qldvg4ldzcy8v00gvy7m22uv68fw7gz72uz9lpv');
	// 		expect(bip84Address(vpub, 5)).toBe('tb1qlgxhugactwcmz57hsreydlpvldx4ud5acpjyvx');
	// 	});
});
