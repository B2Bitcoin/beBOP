import { runtimeConfig } from '$lib/server/runtime-config';
import { redirect } from '@sveltejs/kit';
import { GET as GET_picture } from '../picture/raw/[id]/format/[width]/+server';
import { collections } from '$lib/server/database';
import { DEFAULT_LOGO } from '$lib/types/Picture';

export const GET = async () => {
	if (runtimeConfig.logoPictureId) {
		const picture = await collections.pictures.findOne({ _id: runtimeConfig.logoPictureId });

		if (picture) {
			const width = picture.storage.formats[0].width;

			//@ts-expect-error only params is needed
			return await GET_picture({ params: { id: picture._id, width: String(width) } });
		}
	}
	throw redirect(302, DEFAULT_LOGO);
};
