<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Config</h1>
<form method="post" class="flex flex-col gap-6">
	<label class="flex gap-2 cursor-pointer items-center">
		<input
			type="checkbox"
			name="checkoutButtonOnProductPage"
			class="form-checkbox rounded-sm cursor-pointer"
			checked={data.checkoutButtonOnProductPage}
		/>
		checkoutButtonOnProductPage
	</label>
	<input type="submit" value="Update" class="btn btn-gray self-start" />
</form>
