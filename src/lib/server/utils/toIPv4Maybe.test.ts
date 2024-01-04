import { describe, expect, it } from 'vitest';
import { toIPv4Maybe } from './toIPv4Maybe';

describe('toIPv4Maybe', () => {
	it('should work with ::ffff:127.0.0.1', () => {
		expect(toIPv4Maybe('::ffff:127.0.0.1')).toEqual('127.0.0.1');
	});

	it('should work with ::FFFF:127.0.0.1', () => {
		expect(toIPv4Maybe('::FFFF:127.0.0.1')).toEqual('127.0.0.1');
	});

	it('should work with ::ffff:c0c:c0c', () => {
		expect(toIPv4Maybe('::ffff:c0c:c0c')).toEqual('12.12.12.12');
	});

	it('should work with 0:0:000:0:0:ffff:c0c:c0c', () => {
		expect(toIPv4Maybe('0:0:000:0:0:ffff:c0c:c0c')).toEqual('12.12.12.12');
	});

	it('should work return given ip with 2001:db8:3333:4444:5555:6666:7777:8888', () => {
		expect(toIPv4Maybe('2001:db8:3333:4444:5555:6666:7777:8888')).toEqual(
			'2001:db8:3333:4444:5555:6666:7777:8888'
		);
	});
});
