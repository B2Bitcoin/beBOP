<script lang="ts">
	let className = '';
	export { className as class };
</script>

<div class="fixed inset-0 flex items-center justify-center z-10 {className} max-w-[95vw]">
	<div class="relative bg-gray-40 rounded drop-shadow-[0_4px_10px_rgba(0,0,0,0.13)]">
		<slot />
	</div>
</div>
