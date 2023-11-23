import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const initialValue = 'light';

const theme = writable<string>(initialValue);

theme.subscribe((value: string) => {
	if (browser) {
		window.localStorage.setItem('theme', value);
	}
});

export default theme;
