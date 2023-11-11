<script lang="ts">
	import { useI18n } from '$lib/i18n';

	const { t } = useI18n();

	export let key: string;

	$: tokens = getTokens(key);

	function getTokens(key: string) {
		let translation = t(key);
		const props = Object.fromEntries(
			[...translation.matchAll(/%{([^}]+)}/g)].map((match) => [match[1], match[0]])
		);
		// Alternative is fetching the raw translation from the messages store
		translation = t(key, props);
		const ret: Array<string | { key: string }> = [];

		let index = 0;

		do {
			let nextIndex = translation.indexOf('%{', index);

			if (nextIndex === -1) {
				ret.push(translation.slice(index));
				break;
			}

			let end = translation.indexOf('}', nextIndex);

			if (end === -1) {
				ret.push(translation.slice(index));
				break;
			}

			ret.push(translation.slice(index, nextIndex));
			ret.push({ key: translation.slice(nextIndex + 2, end) });

			index = end + 1;
		} while (index < translation.length);

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
