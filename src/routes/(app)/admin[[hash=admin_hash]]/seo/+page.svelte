<script lang="ts">
	export let data;
</script>

<h1 class="text-2xl">SEO Config</h1>
<form method="post" class="flex flex-col gap-4">
	<label class="checkbox-label">
		<input type="checkbox" name="enableSEO" class="form-checkbox" checked={data.enableSEO} />
		Enable SEO cloak
	</label>
</form>
