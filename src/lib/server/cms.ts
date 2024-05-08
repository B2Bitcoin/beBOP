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
import type { Specification } from '$lib/types/Specification';
import type { Tag } from '$lib/types/Tag';
import type { ContactForm } from '$lib/types/ContactForm';
import type { Countdown } from '$lib/types/Countdown';
import type { Gallery } from '$lib/types/Gallery';

const window = new JSDOM('').window;

const purify = DOMPurify(window);

purify.addHook('afterSanitizeAttributes', function (node) {
	// set all elements owning target to target=_blank
	if ('target' in node) {
		node.setAttribute('target', '_blank');
		node.setAttribute('rel', 'noopener');
	}
});
type TokenObject =
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
	| { type: 'countdownWidget'; slug: string; raw: string }
	| { type: 'tagProducts'; slug: string; display: string | undefined; raw: string }
	| {
			type: 'galleryWidget';
			slug: string;
			display: string | undefined;
			raw: string;
	  };
export async function cmsFromContent(
	{ content, mobileContent }: { content: string; mobileContent?: string },
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
	const CONTACTFORM_WIDGET_REGEX = /\[Form=(?<slug>[\p{L}\d_-]+)\]/giu;
	const COUNTDOWN_WIDGET_REGEX = /\[Countdown=(?<slug>[\p{L}\d_-]+)\]/giu;
	const TAG_PRODUCTS_REGEX =
		/\[TagProducts=(?<slug>[\p{L}\d_-]+)(?:[?\s]display=(?<display>[a-z0-9-]+))?\]/giu;
	const GALLERY_WIDGET_REGEX =
		/\[Gallery=(?<slug>[\p{L}\d_-]+)(?:[?\s]display=(?<display>[a-z0-9-]+))?\]/giu;

	const productSlugs = new Set<string>();
	const challengeSlugs = new Set<string>();
	const sliderSlugs = new Set<string>();
	const tagSlugs = new Set<string>();
	const specificationSlugs = new Set<string>();
	const pictureSlugs = new Set<string>();
	const contactFormSlugs = new Set<string>();
	const countdownFormSlugs = new Set<string>();
	const tagProductsSlugs = new Set<string>();
	const gallerySlugs = new Set<string>();

	const tokens: {
		desktop: Array<TokenObject>;
		mobile?: Array<TokenObject>;
	} = {
		desktop: [],
		mobile: mobileContent ? [] : undefined
	};

	const productMatches = content.matchAll(PRODUCT_WIDGET_REGEX);
	const challengeMatches = content.matchAll(CHALLENGE_WIDGET_REGEX);
	const sliderMatches = content.matchAll(SLIDER_WIDGET_REGEX);
	const tagMatches = content.matchAll(TAG_WIDGET_REGEX);
	const specificationMatches = content.matchAll(SPECIFICATION_WIDGET_REGEX);
	const contactFormMatches = content.matchAll(CONTACTFORM_WIDGET_REGEX);
	const pictureMatches = content.matchAll(PICTURE_WIDGET_REGEX);
	const countdownMatches = content.matchAll(COUNTDOWN_WIDGET_REGEX);
	const tagProductsMatches = content.matchAll(TAG_PRODUCTS_REGEX);
	const galleryMatches = content.matchAll(GALLERY_WIDGET_REGEX);
	const productMatchesMobile = mobileContent
		? mobileContent.matchAll(PRODUCT_WIDGET_REGEX)
		: ''.matchAll(PRODUCT_WIDGET_REGEX);
	const challengeMatchesMobile = mobileContent
		? mobileContent.matchAll(CHALLENGE_WIDGET_REGEX)
		: ''.matchAll(CHALLENGE_WIDGET_REGEX);
	const sliderMatchesMobile = mobileContent
		? mobileContent.matchAll(SLIDER_WIDGET_REGEX)
		: ''.matchAll(SLIDER_WIDGET_REGEX);
	const tagMatchesMobile = mobileContent
		? mobileContent.matchAll(TAG_WIDGET_REGEX)
		: ''.matchAll(TAG_WIDGET_REGEX);
	const specificationMatchesMobile = mobileContent
		? mobileContent.matchAll(SPECIFICATION_WIDGET_REGEX)
		: ''.matchAll(SPECIFICATION_WIDGET_REGEX);
	const contactFormMatchesMobile = mobileContent
		? mobileContent.matchAll(CONTACTFORM_WIDGET_REGEX)
		: ''.matchAll(CONTACTFORM_WIDGET_REGEX);
	const pictureMatchesMobile = mobileContent
		? mobileContent.matchAll(PICTURE_WIDGET_REGEX)
		: ''.matchAll(PICTURE_WIDGET_REGEX);
	const countdownMatchesMobile = mobileContent
		? mobileContent.matchAll(COUNTDOWN_WIDGET_REGEX)
		: ''.matchAll(COUNTDOWN_WIDGET_REGEX);
	const tagProductsMatchesMobile = mobileContent
		? mobileContent.matchAll(TAG_PRODUCTS_REGEX)
		: ''.matchAll(TAG_PRODUCTS_REGEX);
	const galleryMatchesMobile = mobileContent
		? mobileContent.matchAll(GALLERY_WIDGET_REGEX)
		: ''.matchAll(GALLERY_WIDGET_REGEX);

	const index = 0;

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
		),
		...[...countdownMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'countdownWidget' })
		),
		...[...tagProductsMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'tagProducts' })
		),
		...[...galleryMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'galleryWidget' })
		)
	].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

	const orderedMatchesMobile = [
		...[...productMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'productWidget' })
		),
		...[...challengeMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'challengeWidget' })
		),
		...[...sliderMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'sliderWidget' })
		),
		...[...tagMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'tagWidget' })
		),
		...[...specificationMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'specificationWidget' })
		),
		...[...contactFormMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'contactFormWidget' })
		),
		...[...pictureMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'pictureWidget' })
		),
		...[...countdownMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'countdownWidget' })
		),
		...[...tagProductsMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'tagProducts' })
		),
		...[...galleryMatchesMobile].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'galleryWidget' })
		)
	].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

	const processMatches = (
		matches: (RegExpMatchArray & {
			index: number;
			type: string;
		})[],
		token: TokenObject[],
		content: string,
		index: number
	) => {
		for (const match of matches) {
			const html = trimPrefix(trimSuffix(content.slice(index, match.index), '<p>'), '</p>');
			token.push({
				type: 'html',
				raw: ALLOW_JS_INJECTION === 'true' ? html : purify.sanitize(html, { ADD_ATTR: ['target'] })
			});
			if (match.groups?.slug) {
				switch (match.type) {
					case 'productWidget':
						productSlugs.add(match.groups.slug);
						token.push({
							type: 'productWidget',
							slug: match.groups.slug,
							display: match.groups?.display,
							raw: match[0]
						});
						break;
					case 'challengeWidget':
						challengeSlugs.add(match.groups.slug);
						token.push({
							type: 'challengeWidget',
							slug: match.groups.slug,
							raw: match[0]
						});
						break;
					case 'sliderWidget':
						sliderSlugs.add(match.groups.slug);
						token.push({
							type: 'sliderWidget',
							slug: match.groups.slug,
							autoplay: Number(match.groups?.autoplay),
							raw: match[0]
						});
						break;
					case 'tagWidget':
						tagSlugs.add(match.groups.slug);
						token.push({
							type: 'tagWidget',
							slug: match.groups.slug,
							display: match.groups?.display,
							raw: match[0]
						});
						break;
					case 'specificationWidget':
						specificationSlugs.add(match.groups.slug);
						token.push({
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
						token.push({
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
						token.push({
							type: 'contactFormWidget',
							slug: match.groups.slug,
							raw: match[0]
						});
						break;
					case 'countdownWidget':
						countdownFormSlugs.add(match.groups.slug);
						token.push({
							type: 'countdownWidget',
							slug: match.groups.slug,
							raw: match[0]
						});
						break;
					case 'tagProducts':
						tagProductsSlugs.add(match.groups.slug);
						token.push({
							type: 'tagProducts',
							slug: match.groups.slug,
							display: match.groups?.display,
							raw: match[0]
						});
						break;
					case 'galleryWidget':
						gallerySlugs.add(match.groups.slug);
						token.push({
							type: 'galleryWidget',
							slug: match.groups.slug,
							display: match.groups?.display,
							raw: match[0]
						});
						break;
				}
			}
			index = match.index + match[0].length;
		}
		token.push({
			type: 'html',
			raw: trimPrefix(content.slice(index), '</p>')
		});
	};

	processMatches(orderedMatches, tokens.desktop, content, index);
	if (mobileContent?.length && tokens.mobile) {
		processMatches(orderedMatchesMobile, tokens.mobile, mobileContent, index);
	}

	const query =
		locals.user?.roleId === POS_ROLE_ID
			? { 'actionSettings.retail.visible': true }
			: { 'actionSettings.eShop.visible': true };

	const products = await collections.products
		.find({
			$or: [{ tagIds: { $in: [...tagProductsSlugs] } }, { _id: { $in: [...productSlugs] } }],
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
				| 'tagIds'
				| 'alias'
				| 'isTicket'
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
			stock: 1,
			tagIds: 1,
			alias: 1,
			isTicket: 1
		})
		.toArray();
	const challenges = await collections.challenges
		.find({
			_id: { $in: [...challengeSlugs] }
		})
		.project<
			Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt' | 'mode' | 'beginsAt'>
		>({
			name: 1,
			goal: 1,
			progress: 1,
			endsAt: 1,
			beginsAt: 1,
			mode: 1
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
	const countdowns = await collections.countdowns
		.find({
			_id: { $in: [...countdownFormSlugs] }
		})
		.project<Pick<Countdown, '_id' | 'title' | 'description' | 'endsAt'>>({
			title: {
				$ifNull: [`$translations.${locals.language}.title`, '$title']
			},
			description: { $ifNull: [`$translations.${locals.language}.description`, '$description'] },
			endsAt: 1
		})
		.toArray();
	const galleries = await collections.galleries
		.find({
			_id: { $in: [...gallerySlugs] }
		})
		.project<Pick<Gallery, '_id' | 'name' | 'principal' | 'secondary'>>({
			name: 1,
			principal: { $ifNull: [`$translations.${locals.language}.principal`, '$principal'] },
			secondary: { $ifNull: [`$translations.${locals.language}.secondary`, '$secondary'] }
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
		countdowns,
		galleries,
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
						productId: { $in: [...products.map((product) => product._id)] }
					},
					{
						galleryId: { $in: [...gallerySlugs] }
					},
					{
						_id: { $in: [...pictureSlugs] }
					}
				]
			})
			.sort({ createdAt: 1 })
			.toArray(),
		digitalFiles,
		roleId: locals.user?.roleId
	};
}

export type CmsTokens = Awaited<ReturnType<typeof cmsFromContent>>['tokens'];
export type CmsProduct = Awaited<ReturnType<typeof cmsFromContent>>['products'][number];
export type CmsChallenge = Awaited<ReturnType<typeof cmsFromContent>>['challenges'][number];
export type CmsSlider = Awaited<ReturnType<typeof cmsFromContent>>['sliders'][number];
export type CmsTag = Awaited<ReturnType<typeof cmsFromContent>>['tags'][number];
export type CmsPicture = Awaited<ReturnType<typeof cmsFromContent>>['pictures'][number];
export type CmsDigitalFile = Awaited<ReturnType<typeof cmsFromContent>>['digitalFiles'][number];
export type CmsSpecification = Awaited<ReturnType<typeof cmsFromContent>>['specifications'][number];
export type CmsContactForm = Awaited<ReturnType<typeof cmsFromContent>>['contactForms'][number];
export type CmsCountdown = Awaited<ReturnType<typeof cmsFromContent>>['countdowns'][number];
export type CmsGallery = Awaited<ReturnType<typeof cmsFromContent>>['galleries'][number];
