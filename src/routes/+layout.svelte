<script>
	import '../app.css';
	import '@fontsource/outfit/700.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/500.css';
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/300.css';
	import '@fontsource/poppins/400.css';
	import '@fontsource/gloock/400.css';

	import { onMount } from 'svelte';

	onMount(() => {
		const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
		const scriptUrl = import.meta.env.VITE_PLAUSIBLE_SCRIPT_URL;

		const script = document.createElement('script');
		script.defer = true;
		script.dataset.domain = domain;
		script.src = scriptUrl;

		document.head.appendChild(script);
	});
</script>

<slot />
