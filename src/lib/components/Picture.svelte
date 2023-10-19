<script lang="ts">
	import type { Picture } from '$lib/types/Picture';

	export let picture: Picture | undefined;
	let className = '';
	export { className as class };
	export let style = '';

	let matchedWidth: number | null = null;
	let matchedHeight: number | null = null;

	$: {
		const match4px = className.match(/(\s|^)(max-)?w-(\d+)(\s|$)/);
		if (match4px) {
			matchedWidth = parseInt(match4px[3]) * 4;
		} else {
			const matchPx = className.match(/(\s|^)(max-)?w-\[(\d+)px](\s|$)/);
			if (matchPx) {
				matchedWidth = parseInt(matchPx[3]);
			} else {
				matchedWidth = null;
			}
		}
	}

	$: {
		const match4px = className.match(/(\s|^)(max-)?h-(\d+)(\s|$)/);
		if (match4px) {
			matchedHeight = parseInt(match4px[3]) * 4;
		} else {
			const matchPx = className.match(/(\s|^)(max-)?h-\[(\d+)px](\s|$)/);
			if (matchPx) {
				matchedHeight = parseInt(matchPx[3]);
			} else {
				matchedHeight = null;
			}
		}
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
	} ${style};`;
</script>

{#if picture}
	<img
		alt={picture.name}
		width={picture.storage.formats[0].width}
		height={picture.storage.formats[0].height}
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
