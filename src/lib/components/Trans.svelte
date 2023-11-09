<script lang="ts">
	import { useI18n } from '$lib/i18n';

	useI18n();

	export let key: string;

	$: tokens = getTokens(key);

	function getTokens(key: string) {
		const ret: Array<string | { key: string }> = [];

		let index = 0;

		do {
			let nextIndex = key.indexOf('%{', index);

			if (nextIndex === -1) {
				ret.push(key.slice(index));
				break;
			}

			let end = key.indexOf('}', nextIndex);

			if (end === -1) {
				ret.push(key.slice(index));
				break;
			}

			ret.push({ key: key.slice(nextIndex + 2, end) });

			index = end + 1;
		} while (index < key.length);

		return ret;
	}
</script>

{#each tokens as token}
	{#if typeof token === 'string'}
		{token}
	{:else}
		<!-- No dynamic slot names available yet :( -->
		<slot />
	{/if}
{/each}
