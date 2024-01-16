import type { Challenge } from '$lib/types/Challenge';
import type { DigitalFile } from '$lib/types/DigitalFile';
import type { Product } from '$lib/types/Product';
import { POS_ROLE_ID } from '$lib/types/User';
import { trimPrefix } from '$lib/utils/trimPrefix';
import { trimSuffix } from '$lib/utils/trimSuffix';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { collections } from './database';
import { ALLOW_JS_INJECTION, ORIGIN } from '$env/static/private';
import type { PickDeep } from 'type-fest';
import type { Specification } from '$lib/types/Specification';
import type { Tag } from '$lib/types/Tag';
import type { ContactForm } from '$lib/types/ContactForm';
import { mapKeys } from '$lib/utils/mapKeys';
import { runtimeConfig } from './runtime-config';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function cmsFromContent(
	content: string,
	locals: Partial<PickDeep<App.Locals, 'user.roleId' | 'language' | 'email' | 'sso'>>
) {
	const PRODUCT_WIDGET_REGEX =
		/\[Product=(?<slug>[\p{L}\d_-]+)(?:[?\s]display=(?<display>[a-z0-9-]+))?\]/giu;
	const CHALLENGE_WIDGET_REGEX = /\[Challenge=(?<slug>[a-z0-9-]+)\]/giu;
	const SLIDER_WIDGET_REGEX =
		/\[Slider=(?<slug>[\p{L}\d_-]+)(?:[?\s]autoplay=(?<autoplay>[\d]+))?\]/giu;
	const TAG_WIDGET_REGEX =
		/\[Tag=(?<slug>[\p{L}\d_-]+)(?:[?\s]display=(?<display>[a-z0-9-]+))?\]/giu;
	const SPECIFICATION_WIDGET_REGEX = /\[Specification=(?<slug>[\p{L}\d_-]+)\]/giu;
	const PICTURE_WIDGET_REGEX =
		/\[Picture=(?<slug>[\p{L}\d_-]+)((?:[?\s]width=(?<width>\d+))?(?:[?\s]height=(?<height>\d+))?(?:[?\s]fit=(?<fit>(cover|contain)))?)*\]/giu;
	const CONTACTFORM_WIDGET_REGEX = /\[Form=(?<slug>[a-z0-9-]+)\]/gi;

	const productSlugs = new Set<string>();
	const challengeSlugs = new Set<string>();
	const sliderSlugs = new Set<string>();
	const tagSlugs = new Set<string>();
	const specificationSlugs = new Set<string>();
	const pictureSlugs = new Set<string>();
	const contactFormSlugs = new Set<string>();

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
		| {
				type: 'pictureWidget';
				slug: string;
				raw: string;
				fit?: 'cover' | 'contain';
				width?: number;
				height?: number;
		  }
		| { type: 'contactFormWidget'; slug: string; raw: string }
	> = [];

	const productMatches = content.matchAll(PRODUCT_WIDGET_REGEX);
	const challengeMatches = content.matchAll(CHALLENGE_WIDGET_REGEX);
	const sliderMatches = content.matchAll(SLIDER_WIDGET_REGEX);
	const tagMatches = content.matchAll(TAG_WIDGET_REGEX);
	const specificationMatches = content.matchAll(SPECIFICATION_WIDGET_REGEX);
	const contactFormMatches = content.matchAll(CONTACTFORM_WIDGET_REGEX);
	const pictureMatches = content.matchAll(PICTURE_WIDGET_REGEX);

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
		),
		...[...contactFormMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'contactFormWidget' })
		),
		...[...pictureMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'pictureWidget' })
		)
	].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

	for (const match of orderedMatches) {
		const html = trimPrefix(trimSuffix(content.slice(index, match.index), '<p>'), '</p>');
		tokens.push({
			type: 'html',
			raw: ALLOW_JS_INJECTION === 'true' ? html : purify.sanitize(html)
		});
		if (match.groups?.slug) {
			switch (match.type) {
				case 'productWidget':
					productSlugs.add(match.groups.slug);
					tokens.push({
						type: 'productWidget',
						slug: match.groups.slug,
						display: match.groups?.display,
						raw: match[0]
					});
					break;
				case 'challengeWidget':
					challengeSlugs.add(match.groups.slug);
					tokens.push({
						type: 'challengeWidget',
						slug: match.groups.slug,
						raw: match[0]
					});
					break;
				case 'sliderWidget':
					sliderSlugs.add(match.groups.slug);
					tokens.push({
						type: 'sliderWidget',
						slug: match.groups.slug,
						autoplay: Number(match.groups?.autoplay),
						raw: match[0]
					});
					break;
				case 'tagWidget':
					tagSlugs.add(match.groups.slug);
					tokens.push({
						type: 'tagWidget',
						slug: match.groups.slug,
						display: match.groups?.display,
						raw: match[0]
					});
					break;
				case 'specificationWidget':
					specificationSlugs.add(match.groups.slug);
					tokens.push({
						type: 'specificationWidget',
						slug: match.groups.slug,
						raw: match[0]
					});
					break;
				case 'pictureWidget':
					pictureSlugs.add(match.groups.slug);
					// With multiple options, to handle any ordering for the options, we need to parse the string again
					const raw = match[0];
					const fit = /[?\s]fit=(?<fit>(cover|contain))/.exec(raw)?.groups?.fit as
						| 'cover'
						| 'contain'
						| undefined;
					const width = /[?\s]width=(?<width>\d+)/.exec(raw)?.groups?.width;
					const height = /[?\s]height=(?<height>\d+)/.exec(raw)?.groups?.height;
					tokens.push({
						type: 'pictureWidget',
						slug: match.groups.slug,
						raw,
						fit,
						width: width ? Number(width) : undefined,
						height: height ? Number(height) : undefined
					});
					break;
				case 'contactFormWidget':
					contactFormSlugs.add(match.groups.slug);
					tokens.push({
						type: 'contactFormWidget',
						slug: match.groups.slug,
						raw: match[0]
					});
					break;
			}
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
		.project<Pick<Tag, '_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'>>(
			{
				name: 1,
				title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
				subtitle: { $ifNull: [`$translations.${locals.language}.subtitle`, '$subtitle'] },
				content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
				shortContent: {
					$ifNull: [`$translations.${locals.language}.shortContent`, '$shortContent']
				},
				cta: { $ifNull: [`$translations.${locals.language}.cta`, '$cta'] }
			}
		)
		.toArray();
	const specifications = await collections.specifications
		.find({
			_id: { $in: [...specificationSlugs] }
		})
		.project<Pick<Specification, '_id' | 'content' | 'title'>>({
			title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
			content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] }
		})
		.toArray();
	const contactForms = await collections.contactForms
		.find({
			_id: { $in: [...contactFormSlugs] }
		})
		.project<
			Pick<
				ContactForm,
				'_id' | 'content' | 'target' | 'subject' | 'displayFromField' | 'prefillWithSession'
			>
		>({
			content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
			target: 1,
			displayFromField: 1,
			prefillWithSession: 1,
			subject: { $ifNull: [`$translations.${locals.language}.subject`, '$subject'] }
		})
		.toArray();
	return {
		tokens,
		challenges,
		sliders,
		products,
		tags,
		specifications,
		contactForms,
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
					},
					{
						_id: { $in: [...pictureSlugs] }
					}
				]
			})
			.sort({ createdAt: 1 })
			.toArray(),
		digitalFiles,
		roleId: locals.user?.roleId,
		sessionEmail: locals.email || locals.sso?.find((sso) => sso.email)?.email
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
export type CmsContactForm = Awaited<ReturnType<typeof cmsFromContent>>['contactForms'][number];
