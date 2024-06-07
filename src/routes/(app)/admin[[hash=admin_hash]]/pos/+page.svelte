<script lang="ts">
	import { MultiSelect } from 'svelte-multiselect';
	export let data;
</script>

<h1 class="text-3xl">POS</h1>

<form method="post" class="flex flex-col gap-6">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="form-label"
		>Product Tags
		<MultiSelect
			name="posTouchTag"
			options={data.tags.map((tag) => ({
				value: tag._id,
				label: tag.name
			}))}
			selected={data.posTouchTag?.map((tagId) => ({
				value: tagId,
				label: data.tags.find((tag) => tag._id === tagId)?.name ?? tagId
			})) ?? []}
		/>
	</label>
	<input type="submit" value="Update" class="btn btn-blue self-start" />
</form>
