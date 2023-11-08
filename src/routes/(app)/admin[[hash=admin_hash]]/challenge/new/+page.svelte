<script lang="ts">
	import { MAX_NAME_LIMIT } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays, addMonths } from 'date-fns';

	export let data;
	let mode = 'moneyAmount';
	let beginsAt = new Date().toJSON().slice(0, 10);
	let endsAt = addMonths(new Date(), 30).toJSON().slice(0, 10);
	let endsAtElement: HTMLInputElement;
	let availableProductList = data.products;

	function checkForm(event: SubmitEvent) {
		if (endsAt < beginsAt) {
			endsAtElement.setCustomValidity('End date must be after beginning date');
			endsAtElement.reportValidity();
			event.preventDefault();
			return;
		} else {
			endsAtElement.setCustomValidity('');
		}
	}
</script>

<h1 class="text-3xl">Add a challenge</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4" on:submit={checkForm}>
	<label class="form-label">
		Challenge name
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="name"
			placeholder="Challenge name"
			required
		/>
	</label>

	<label class="form-label">
		Mode
		<select class="form-input" name="mode" bind:value={mode}>
			{#each ['moneyAmount', 'totalProducts'] as option}
				<option value={option}>{upperFirst(option)}</option>
			{/each}
		</select>
	</label>

	<label class="form-label">
		Goal
		<input
			class="form-input"
			type="number"
			name="goalAmount"
			min="0"
			placeholder={mode === 'moneyAmount' ? 'Amount (SAT)' : 'Quantity'}
			required
		/>
	</label>

	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Beginning date

			<input class="form-input" type="date" name="beginsAt" required bind:value={beginsAt} />
		</label>
	</div>
	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Ending date

			<input
				class="form-input"
				type="date"
				required
				name="endsAt"
				min={addDays(new Date(), 1).toJSON().slice(0, 10)}
				bind:value={endsAt}
				bind:this={endsAtElement}
				on:input={() => endsAtElement?.setCustomValidity('')}
			/>
		</label>
	</div>

	<label class="form-label"
		>Products
		<select multiple name="productIds" class="form-input min-h-[20rem]">
			{#each availableProductList as product}
				<option value={product._id}>
					{product.name}
				</option>
			{/each}
		</select>
		<p class="text-gray-600 text-sm">
			You can hold Ctrl to select indivdual items, or Shift to select multiple items at once
		</p>
	</label>

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>
