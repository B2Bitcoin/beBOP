export function GET() {
	return new Response(
		`User-agent: *
Disallow: /order/
Disallow: /subscription/
Disallow: /admin/
Disallow: /checkout
Disallow: /cart
`,
		{
			headers: {
				'content-type': 'text/plain'
			}
		}
	);
}
