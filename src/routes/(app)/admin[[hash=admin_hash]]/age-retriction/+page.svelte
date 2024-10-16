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
			name="ageRestriction"
			class="form-checkbox"
			checked={data.ageRestriction}
		/>
		My online business needs age limitation & validation
	</label>
	<label class="form-label">
		Legal reason
		<input type="input" name="ageLegalReason" class="form-input" value={data.ageLegalReason} />
	</label>
	<input type="submit" value="Update" class="btn btn-gray self-start" />
</form>
