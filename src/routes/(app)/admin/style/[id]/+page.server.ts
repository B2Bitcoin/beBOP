import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { styleFormStructure, type Style } from '$lib/types/Style';
import { collections } from '$lib/server/database';

export const load = async ({ params }) => {
	const style = await collections.styles.findOne({ _id: params.id });

	return {
		style
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const styleValidationSchema = createZodSchemaFromStructure(styleFormStructure);

		const parsed = styleValidationSchema.parse(json);

		const transformedStyle: Style = transformToStyle(parsed);

		await collections.styles.insertOne(transformedStyle);

		throw redirect(303, '/admin/style');
	}
};

const createZodSchemaFromStructure = (structure) => {
	const schema = {
		name: z.string()
	};

	for (const [sectionKey, fields] of Object.entries(structure)) {
		for (const field of fields.elements) {
			if (field.isColor) {
				const lightKey = `${sectionKey}_${field.name}_light`;
				const darkKey = `${sectionKey}_${field.name}_dark`;
				schema[lightKey] = z.string().max(6);
				schema[darkKey] = z.string().max(6);
			} else {
				const key = `${sectionKey}_${field.name}`;
				schema[key] = z.string();
			}
		}
	}

	return z.object(schema);
};

function transformToStyle(data: any): Style {
	const result = {
		_id: crypto.randomUUID(),
		name: data.name
	};

	for (const key in data) {
		if (key === 'name') {
			continue;
		}

		const parts = key.split('_');
		const theme = parts.pop();

		let current: any = result;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!current[part]) {
				if (i === parts.length - 1 && theme) {
					current[part] = {};
				} else {
					current[part] = {};
				}
			}
			current = current[part];
		}

		if (theme) {
			current[theme] = data[key];
		} else {
			current = data[key];
		}
	}

	return result as Style;
}
