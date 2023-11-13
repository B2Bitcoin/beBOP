<script lang="ts">
	import { useI18n } from '$lib/i18n';

	const { t } = useI18n();

	export let key: string;
	export let params: Record<string, string | number | undefined> = {};

	const SLOT_REGEX = /<(\d+)>(.*?)<\/\d+>/g;

	let tokens: Array<string | { content: string; slot: string }> = [];
	$: (tokens = getTokens()), key, params;

	function getTokens() {
		const translation = t(key, params);
		const slotMatches = translation.matchAll(SLOT_REGEX);
		const ret: Array<string | { content: string; slot: string }> = [];

		let index = 0;

		for (const match of slotMatches) {
			ret.push(translation.slice(index, match.index));
			ret.push({ content: match[2], slot: match[1] });
			index = (match.index ?? 0) + match[0].length;
		}

		return ret;
	}
</script>

{#each tokens as token}
	{#if typeof token === 'string'}
		{token}
	{:else if token.slot === '0'}
		<slot name="0" translation={token.content} />
	{:else if token.slot === '1'}
		<slot name="1" translation={token.content} />
	{:else if token.slot === '2'}
		<slot name="2" translation={token.content} />
	{:else if token.slot === '3'}
		<slot name="3" translation={token.content} />
	{/if}
{/each}
