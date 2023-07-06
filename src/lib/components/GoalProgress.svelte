<script lang="ts">
	export let text: string;
	export let percentage: number;
	export let goal: number;
	export let score: number;
	let newPercentage = (goal * 100) / score;
	let className = '';
	export { className as class };
</script>

<div class="relative mt-6 pt-6 {className}">
	<div
		class="absolute inset-0 rounded-[3px] flex justify-end {percentage == 100
			? 'bg-green-500'
			: percentage > 100
			? 'bg-jagger-900'
			: 'bg-gradient-to-r from-red-500 to-green-500 via-yellow-500'}"
	>
		<div
			data-text={text}
			style="background-position: {percentage}% 0%"
			class="-mt-6 h-6 bg-[length:100px_50px] {percentage == 100
				? 'bg-green-500'
				: percentage > 100
				? 'bg-jagger-900'
				: ' bg-gradient-to-r from-red-500 to-green-500 via-yellow-500'} w-[2px] relative before:content-[attr(data-text)] before:text-gray-800 before:absolute {percentage <
			50
				? 'before:left-[6px]'
				: 'before:right-1'} before:-top-1 before:text-base before:whitespace-nowrap"
		/>
		<div
			class="h-6 bg-gradient-to-b from-gray-250 to-white to-45% border border-l-0 border-gray-360 rounded-r-[3px]"
			style="width: {100 - percentage}%"
		/>
	</div>
	<div
		class="absolute inset-0 rounded-[3px] flex justify-end {percentage >= 100
			? 'bg-green-500'
			: ''}"
		style="width: calc({Math.round(newPercentage)}%);"
	>
		{#if percentage <= 100}
			<div data-text={text} style="background-position: {percentage}% 0%" />
		{:else}
			<div
				data-text={goal}
				style="background-position: {percentage}% 0%"
				class="bg-[length:100px_50px] w-[2px] relative before:content-[attr(data-text)] before:text-white items-center before:absolute {percentage <
				50
					? 'before:left-[6px]'
					: 'before:right-1'} before:-top-1 before:text-base before:whitespace-nowrap"
			/>
		{/if}
	</div>
</div>
