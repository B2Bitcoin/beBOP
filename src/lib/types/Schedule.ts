import { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface EventSchedule {
	title: string;
	shortDescription?: string;
	description?: string;
	beginsAt: Date;
	endsAt?: Date;
	location?: {
		name: string;
		link: string;
	};
	url?: string;
	unavailabity?: {
		label: 'postponed' | 'canceled' | 'soldOut';
		isUnavailable: boolean;
	};
	is_archived?: boolean;
}

export interface ScheduleTranslatableFields {
	events: EventSchedule[];
}

export interface Schedule extends Timestamps, ScheduleTranslatableFields {
	_id: string;
	name: string;
	pastEventDelay: number;
	displayPastEvents: boolean;
	displayPastEventsAfterFuture: boolean;
	sortByEventDateDesc: boolean;

	translations?: Partial<Record<LanguageKey, Partial<ScheduleTranslatableFields>>>;
}
