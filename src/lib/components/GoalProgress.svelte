<script lang="ts">
	export let text: string;
	export let percentage: number;

	let className = '';
	export { className as class };
</script>

<div class="pt-6 {className}">
	<div
		class="bg-gradient-to-r from-green-500 to-red-500 via-yellow-500 rounded-[3px] flex justify-end"
	>
		<div
			data-text={text}
			class="-mt-6 h-6 w-0 border border-red-500 relative before:content-[attr(data-text)] before:text-gray-800 before:absolute {percentage <
			50
				? 'before:left-1'
				: 'before:right-1'} before:-top-1 before:text-base before:whitespace-nowrap"
		/>
		<div
			class="h-6 bg-gradient-to-b from-gray-250 to-white to-45% border border-l-0 border-gray-360 rounded-r-[3px]"
			style="width: {100 - percentage}%"
		/>
	</div>
</div>
