<script lang="ts">
	let mode: 'flatFee' | 'perProduct' = 'flatFee';
</script>

<h1 class="text-3xl">Delivery fees config</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="checkbox-label">
		<input type="radio" group={mode} class="form-radio" name="mode" value="flatFee" />
		Flat fee
	</label>

	<label class="checkbox-label">
		<input type="radio" group={mode} class="form-radio" name="mode" value="perProduct" />
		Fee depending on product
	</label>
</form>
