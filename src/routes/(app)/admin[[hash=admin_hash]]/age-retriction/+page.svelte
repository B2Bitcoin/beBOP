<script lang="ts">
	export let data;
	export let form;
</script>

<h1 class="text-2xl">Age restriction</h1>
{#if form?.success}
	<div class="alert alert-success">{form.success}</div>
{/if}
<form method="post" class="flex flex-col gap-4" action="?/update">
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="age.restriction"
			class="form-checkbox"
			checked={data.age.restriction}
		/>
		My online business needs age limitation & validation
	</label>
	<label class="form-label">
		Legal reason
		<input type="input" name="age.legalReason" class="form-input" value={data.age.legalReason} />
	</label>
	<input type="submit" value="Update" class="btn btn-gray self-start" />
</form>
