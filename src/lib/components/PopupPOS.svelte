<script lang="ts">
	let className = '';
	export { className as class };
</script>

<div class="fixed inset-0 flex items-center justify-center z-10 {className} max-w-[95vw]">
	<div
		class="relative bg-gray-40 rounded drop-shadow-[0_4px_10px_rgba(0,0,0,0.13)] after:absolute after:z-20 after:top-0 after:right-[30px] after:w-0 after:h-0 after:-bottom-1 after:-translate-y-full after:border-l-[10px] after:border-l-transparent after:border-r-[10px] after:border-r-transparent after:border-b-[18px] after:border-b-gray-40"
	>
		<slot />
	</div>
</div>
