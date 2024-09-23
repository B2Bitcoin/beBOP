import type { Timestamps } from './Timestamps';

export interface WidgetSlider extends Timestamps {
	_id: string;
	title: string;
	lines: string[];
}
