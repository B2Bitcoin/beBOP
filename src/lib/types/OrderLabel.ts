import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface OrderLabelTranslatableFields {
	name: string;
}

export interface OrderLabel extends Timestamps, OrderLabelTranslatableFields {
	_id: string;
	color: string;
	icon: string;
	translations?: Partial<Record<LanguageKey, Partial<OrderLabelTranslatableFields>>>;
}
