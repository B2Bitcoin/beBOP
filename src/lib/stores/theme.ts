import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const initialValue = 'light' as const;

const theme = writable<'light' | 'dark'>(initialValue);

theme.subscribe((value: string) => {
	if (browser) {
		window.localStorage.setItem('theme', value);
		if (value === 'light') {
			document.querySelector('html')?.classList.remove('dark');
		} else {
			document.querySelector('html')?.classList.add('dark');
		}
	}
});

export default theme;
