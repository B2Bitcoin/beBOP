import type { Challenge } from '$lib/types/Challenge';
import type { DigitalFile } from '$lib/types/DigitalFile';
import type { Product } from '$lib/types/Product';
import { POS_ROLE_ID } from '$lib/types/User';
import { trimPrefix } from '$lib/utils/trimPrefix';
import { trimSuffix } from '$lib/utils/trimSuffix';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { collections } from './database';
import { ALLOW_JS_INJECTION } from '$env/static/private';
import type { PickDeep } from 'type-fest';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function cmsFromContent(
	content: string,
	locals: Partial<PickDeep<App.Locals, 'user.roleId' | 'language'>>
) {
	const PRODUCT_WIDGET_REGEX =
		/\[Product=(?<slug>[a-z0-9-]+)(?:\?display=(?<display>[a-z0-9-]+))?\]/gi;
	const CHALLENGE_WIDGET_REGEX = /\[Challenge=(?<slug>[a-z0-9-]+)\]/gi;
	const SLIDER_WIDGET_REGEX =
		/\[Slider=(?<slug>[a-z0-9-]+)(?:\?autoplay=(?<autoplay>[a-z0-9-]+))?\]/gi;
	const TAG_WIDGET_REGEX = /\[Tag=(?<slug>[a-z0-9-]+)(?:\?display=(?<display>[a-z0-9-]+))?\]/gi;
	const SPECIFICATION_WIDGET_REGEX = /\[Specification=(?<slug>[a-z0-9-]+)\]/gi;

	const productSlugs = new Set<string>();
	const challengeSlugs = new Set<string>();
	const sliderSlugs = new Set<string>();
	const tagSlugs = new Set<string>();
	const specificationSlugs = new Set<string>();

	const tokens: Array<
		| {
				type: 'html';
				raw: string;
		  }
		| {
				type: 'productWidget';
				slug: string;
				display: string | undefined;
				raw: string;
		  }
		| {
				type: 'challengeWidget';
				slug: string;
				raw: string;
		  }
		| {
				type: 'sliderWidget';
				slug: string;
				autoplay: number | undefined;
				raw: string;
		  }
		| {
				type: 'tagWidget';
				slug: string;
				display: string | undefined;
				raw: string;
		  }
		| {
				type: 'specificationWidget';
				slug: string;
				raw: string;
		  }
	> = [];

	const productMatches = content.matchAll(PRODUCT_WIDGET_REGEX);
	const challengeMatches = content.matchAll(CHALLENGE_WIDGET_REGEX);
	const sliderMatches = content.matchAll(SLIDER_WIDGET_REGEX);
	const tagMatches = content.matchAll(TAG_WIDGET_REGEX);
	const specificationMatches = content.matchAll(SPECIFICATION_WIDGET_REGEX);

	let index = 0;

	const orderedMatches = [
		...[...productMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'productWidget' })
		),
		...[...challengeMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'challengeWidget' })
		),
		...[...sliderMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'sliderWidget' })
		),
		...[...tagMatches].map((m) => Object.assign(m, { index: m.index ?? 0, type: 'tagWidget' })),
		...[...specificationMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'specificationWidget' })
		)
	].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

	for (const match of orderedMatches) {
		const html = trimPrefix(trimSuffix(content.slice(index, match.index), '<p>'), '</p>');
		tokens.push({
			type: 'html',
			raw: ALLOW_JS_INJECTION === 'true' ? html : purify.sanitize(html)
		});
		if (match.type === 'productWidget' && match.groups?.slug) {
			productSlugs.add(match.groups.slug);
			tokens.push({
				type: 'productWidget',
				slug: match.groups.slug,
				display: match.groups?.display,
				raw: match[0]
			});
		} else if (match.type === 'challengeWidget' && match.groups?.slug) {
			challengeSlugs.add(match.groups.slug);
			tokens.push({
				type: 'challengeWidget',
				slug: match.groups.slug,
				raw: match[0]
			});
		} else if (match.type === 'sliderWidget' && match.groups?.slug) {
			sliderSlugs.add(match.groups.slug);
			tokens.push({
				type: 'sliderWidget',
				slug: match.groups.slug,
				autoplay: Number(match.groups?.autoplay),
				raw: match[0]
			});
		} else if (match.type === 'tagWidget' && match.groups?.slug) {
			tagSlugs.add(match.groups.slug);
			tokens.push({
				type: 'tagWidget',
				slug: match.groups.slug,
				display: match.groups?.display,
				raw: match[0]
			});
		} else if (match.type === 'specificationWidget' && match.groups?.slug) {
			specificationSlugs.add(match.groups.slug);
			tokens.push({
				type: 'specificationWidget',
				slug: match.groups.slug,
				raw: match[0]
			});
		}
		index = match.index + match[0].length;
	}

	tokens.push({
		type: 'html',
		raw: trimPrefix(content.slice(index), '</p>')
	});
	const query =
		locals.user?.roleId === POS_ROLE_ID
			? { 'actionSettings.retail.visible': true }
			: { 'actionSettings.eShop.visible': true };

	const products = await collections.products
		.find({
			_id: { $in: [...productSlugs] },
			...query
		})
		.project<
			Pick<
				Product,
				| '_id'
				| 'price'
				| 'name'
				| 'shortDescription'
				| 'preorder'
				| 'availableDate'
				| 'type'
				| 'shipping'
				| 'actionSettings'
				| 'stock'
			>
		>({
			price: 1,
			shortDescription: locals.language
				? { $ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription'] }
				: 1,
			preorder: 1,
			name: locals.language ? { $ifNull: [`$translations.${locals.language}.name`, '$name'] } : 1,
			availableDate: 1,
			type: 1,
			shipping: 1,
			actionSettings: 1,
			stock: 1
		})
		.toArray();
	const challenges = await collections.challenges
		.find({
			_id: { $in: [...challengeSlugs] }
		})
		.project<Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>>({
			name: 1,
			goal: 1,
			progress: 1,
			endsAt: 1
		})
		.toArray();
	const sliders = await collections.sliders
		.find({
			_id: { $in: [...sliderSlugs] }
		})
		.toArray();

	const digitalFiles = await collections.digitalFiles
		.find({ productId: { $in: products.map((product) => product._id) } })
		.project<Pick<DigitalFile, '_id' | 'name' | 'productId'>>({
			name: 1,
			productId: 1
		})
		.sort({ createdAt: 1 })
		.toArray();
	const tags = await collections.tags
		.find({
			_id: { $in: [...tagSlugs] }
		})
		.toArray();
	const specifications = await collections.specifications
		.find({
			_id: { $in: [...specificationSlugs] }
		})
		.toArray();

	return {
		tokens,
		challenges,
		sliders,
		products,
		tags,
		specifications,
		pictures: await collections.pictures
			.find({
				$or: [
					{
						'slider._id': { $in: [...sliderSlugs] }
					},
					{
						'tag._id': { $in: [...tagSlugs] }
					},
					{
						productId: { $in: [...productSlugs] }
					}
				]
			})
			.sort({ createdAt: 1 })
			.toArray(),
		digitalFiles,
		roleId: locals.user?.roleId
	};
}

export type CmsToken = Awaited<ReturnType<typeof cmsFromContent>>['tokens'][number];
export type CmsProduct = Awaited<ReturnType<typeof cmsFromContent>>['products'][number];
export type CmsChallenge = Awaited<ReturnType<typeof cmsFromContent>>['challenges'][number];
export type CmsSlider = Awaited<ReturnType<typeof cmsFromContent>>['sliders'][number];
export type CmsTag = Awaited<ReturnType<typeof cmsFromContent>>['tags'][number];
export type CmsPicture = Awaited<ReturnType<typeof cmsFromContent>>['pictures'][number];
export type CmsDigitalFile = Awaited<ReturnType<typeof cmsFromContent>>['digitalFiles'][number];
export type CmsSpecification = Awaited<ReturnType<typeof cmsFromContent>>['specifications'][number];
