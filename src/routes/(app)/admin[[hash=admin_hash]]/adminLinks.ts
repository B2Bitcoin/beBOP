type AdminLinks = Array<{
	section: string;
	links: Array<{
		href: string;
		label: string;
		hidden?: boolean;
		/**
		 * Specific endpoints that we want to add explicit roles for.
		 */
		endpoints?: string[];
	}>;
}>;

export const adminLinks: AdminLinks = [
	{
		section: 'Merch',
		links: [
			{
				href: '/admin/layout',
				label: 'Layout'
			},
			{
				href: '/admin/product',
				label: 'Products'
			},
			{
				href: '/admin/ticket',
				label: 'Tickets',
				hidden: true,
				/**
				 * Note: this is also passed in runtimeConfig to create a special role TICKET_CHECKER_ROLE_ID
				 */
				endpoints: ['/admin/ticket/:id/burn']
			},
			{
				href: '/admin/picture',
				label: 'Pictures'
			},
			{
				href: '/admin/cms',
				label: 'CMS'
			},
			{
				href: '/admin/discount',
				label: 'Discount'
			},
			{
				href: '/admin/theme',
				label: 'Themes'
			}
		]
	},
	{
		section: 'Config',
		links: [
			{
				href: '/admin/config',
				label: 'Config'
			},
			{
				href: '/admin/language',
				label: 'Languages'
			},
			{
				href: '/admin/arm',
				label: 'ARM'
			},
			{
				href: '/admin/identity',
				label: 'Identity'
			},
			{
				href: '/admin/physical-shop',
				label: 'Physical Shop'
			},
			// {
			// 	href: '/admin/backup',
			// 	label: 'Backup'
			// },
			{
				href: '/admin/template',
				label: 'Templates'
			}
		]
	},
	{
		section: 'Node Management',
		links: [
			{
				href: '/admin/bitcoin',
				label: 'Bitcoin node'
			},
			{
				href: '/admin/lightning',
				label: 'Lightning node'
			},
			{
				href: '/admin/nostr',
				label: 'NostR'
			},
			{
				href: '/admin/email',
				label: 'Emails'
			}
		]
	},
	{
		section: 'Payment Partners',
		links: [
			{
				href: '/admin/sumup',
				label: 'SumUp'
			},
			{
				href: '/admin/phoenixd',
				label: 'PhoenixD'
			}
			// {
			// 	href: '/admin/bity',
			// 	label: 'Bity'
			// }
		]
	},
	{
		section: 'Transaction',
		links: [
			{
				href: '/admin/order',
				label: 'Orders'
			},
			{
				href: '/admin/reporting',
				label: 'Reporting'
			}
		]
	},
	{
		section: 'Widgets',
		links: [
			{
				href: '/admin/challenge',
				label: 'Challenges'
			},
			{
				href: '/admin/tags',
				label: 'Tags'
			},
			{
				href: '/admin/slider',
				label: 'Sliders'
			},
			{
				href: '/admin/specification',
				label: 'Specifications'
			},
			{
				href: '/admin/form',
				label: 'Forms'
			},
			{
				href: '/admin/countdown',
				label: 'Countdowns'
			},
			{
				href: '/admin/gallery',
				label: 'Galleries'
			}
		]
	}
];
