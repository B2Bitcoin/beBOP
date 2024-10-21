import { collections } from '$lib/server/database';
import { omit } from 'lodash-es';
import { load as catalogLoad } from './catalog/+page.server';
import { cmsFromContent } from '$lib/server/cms';
import { redirect } from '@sveltejs/kit';
import { addYears } from 'date-fns';
import { ObjectId } from 'mongodb';

export const load = async ({ locals }) => {
	const cmsPage = await collections.cmsPages.findOne(
		{
			_id: 'home'
		},
		{
			projection: {
				content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
				mobileContent: {
					$ifNull: [`$translations.${locals.language}.mobileContent`, '$mobileContent']
				},
				title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
				shortDescription: {
					$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
				},
				fullScreen: 1,
				maintenanceDisplay: 1
			}
		}
	);

	if (!cmsPage) {
		return {
			// @ts-expect-error only locals is needed
			catalog: catalogLoad({ locals })
		};
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(
			{ content: cmsPage.content, mobileContent: cmsPage.mobileContent },
			locals
		),
		layoutReset: cmsPage.fullScreen
	};
};

export const actions = {
	navigate: async ({ locals }) => {
		await collections.sessions.findOneAndUpdate(
			{
				sessionId: locals.sessionId
			},
			{
				$set: {
					updatedAt: new Date(),
					acceptAgeLimitation: true,
					expiresAt: addYears(new Date(), 1)
				},
				$setOnInsert: {
					createdAt: new Date(),
					_id: new ObjectId()
				}
			},
			{ upsert: true }
		);
		throw redirect(303, `/`);
	}
};
