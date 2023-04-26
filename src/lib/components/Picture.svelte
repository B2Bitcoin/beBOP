<script lang="ts">
	import type { Picture } from '$lib/types/Picture';

	export let picture: Picture | undefined;
	let className = '';
	export { className as class };
	export let style = '';

	let matchedWidth: number | null = null;
	let matchedHeight: number | null = null;

	$: if (/(\s|^)w-(\d+)(\s|$)/.test(className)) {
		matchedWidth = parseInt(className.match(/(\s|^)w-(\d+)(\s|$)/)![2]) * 4;
	} else if (/(\s|^)w-\[(\d+)px](\s|$)/.test(className)) {
		matchedWidth = parseInt(className.match(/(\s|^)w-\[(\d+)px](\s|$)/)![2]);
	} else {
		matchedWidth = null;
	}

	$: if (/(\s|^)h-(\d+)(\s|$)/.test(className)) {
		matchedHeight = parseInt(className.match(/(\s|^)h-(\d+)(\s|$)/)![2]) * 4;
	} else if (/(\s|^)h-\[(\d+)px](\s|$)/.test(className)) {
		matchedHeight = parseInt(className.match(/(\s|^)h-\[(\d+)px](\s|$)/)![2]) * 4;
	} else {
		matchedHeight = null;
	}

	let computedWidth: number | null = null;
	let computedHeight: number | null = null;

	$: {
		if (matchedWidth !== null) {
			computedWidth = null;
		} else if (matchedHeight !== null && picture) {
			computedWidth = Math.round(
				(matchedHeight / picture.storage.original.height) * picture.storage.original.width
			);
		} else {
			computedWidth = null;
		}
	}

	$: {
		if (matchedHeight !== null) {
			computedHeight = null;
		} else if (matchedWidth !== null && picture) {
			computedHeight = Math.round(
				(matchedWidth / picture.storage.original.width) * picture.storage.original.height
			);
		} else {
			computedHeight = null;
		}
	}

	$: computedStyle = `${computedWidth !== null ? `width: ${computedWidth}px;` : ''} ${
		computedHeight !== null ? `height: ${computedHeight}px;` : ''
	} ${style}`;
</script>

{#if picture}
	<img
		alt={picture.name}
		srcset={picture.storage.formats
			.map((format) => `/picture/raw/${picture?._id}/format/${format.width} ${format.width}w`)
			.join(', ')}
		sizes={matchedWidth ?? computedWidth !== null
			? `${matchedWidth ?? computedWidth}px`
			: undefined}
		class={className}
		style={computedStyle}
		{...$$restProps}
		on:keypress
		on:click
		on:load
	/>
{/if}

<style>
	img.hover-zoom {
		transition: 400ms;

		transform: scale(1);
	}

	img:hover.hover-zoom {
		transform: scale(1.2);
	}
</style>
