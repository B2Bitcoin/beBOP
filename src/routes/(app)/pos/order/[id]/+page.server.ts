import { error, redirect } from '@sveltejs/kit';
import { actions as adminOrderActions } from '../../../admin[[hash=admin_hash]]/order/[id]/+page.server';
import { collections } from '$lib/server/database';
import { isAllowedOnPage } from '$lib/types/Role';
import { adminPrefix } from '$lib/server/admin';
import { userIdentifier } from '$lib/server/user';
import { POS_ROLE_ID } from '$lib/types/User';

export const actions = {
	addPayment: async function (event) {
		const { id } = event.params;
		const order = await collections.orders.findOne({ _id: id });

		if (!order?.user.userId?.equals(event.locals.user?._id ?? '')) {
			if (
				event.locals.user?.role &&
				!isAllowedOnPage(event.locals.user.role, `${adminPrefix()}/order/${id}`, 'write')
			) {
				throw error(403, 'Order does not belong to this POS account.');
			}
		}

		const addPayment = adminOrderActions.addPayment;

		// @ts-expect-error different route but compatible
		return addPayment(event);
	},
	saveNote: async function ({ params, request, locals }) {
		const data = await request.formData();
		const { noteContent } = z
			.object({
				noteContent: z.string().min(1)
			})
			.parse({
				noteContent: data.get('noteContent')
			});
		await collections.orders.updateOne(
			{
				_id: params.id
			},
			{
				$push: {
					notes: {
						content: noteContent,
						createdAt: new Date(),
						role: POS_ROLE_ID,
						...(locals.user && { userId: locals.user._id }),
						...(userIdentifier(locals).npub && { npub: userIdentifier(locals).npub }),
						...(userIdentifier(locals).email && { email: userIdentifier(locals).email })
					}
				}
			}
		);
		throw redirect(303, `/order/${params.id}/notes`);
	}
};
