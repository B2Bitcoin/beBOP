<script lang="ts">
	import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';

	export let data;

	let beginsAt = data.beginsAt;
	let endsAt = data.endsAt;
	let endsAtElement: HTMLInputElement;

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

	function confirmDelete(event: Event) {
		if (!confirm('Would you like to delete this Challenge?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="text-3xl">Edit a challenge</h1>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4" on:submit={checkForm}>
	<label class="form-label">
		Challenge slug for CMS integration
		<input type="text" disabled class="form-input" value={data.challenge._id} />
	</label>

	<label class="form-label">
		Challenge name
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="name"
			value={data.challenge.name}
			placeholder="Challenge name"
			required
		/>
	</label>

	<label class="form-label">
		Mode
		<select class="form-input" value={data.challenge.mode} disabled>
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
			value={data.challenge.goal.amount}
			placeholder={data.challenge.mode === 'moneyAmount' ? 'Amount (SAT)' : 'Quantity'}
			required
		/>
	</label>

	<div class="flex flex-wrap gap-4">
		<label class="form-label">
			Beginning date

			<input class="form-input" type="date" name="beginsAt" bind:value={beginsAt} required />
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
				bind:value={endsAt}
				bind:this={endsAtElement}
				on:input={() => endsAtElement?.setCustomValidity('')}
			/>
		</label>
	</div>

	<div class="flex flex-col gap-4 w-[30%]">
		<h2 class="text-xl">Products</h2>
		<select multiple name="productIds" value={data.challenge.productIds}>
			{#each data.products as product}
				<option value={product._id}>
					{product.name}
				</option>
			{/each}
		</select>
	</div>

	<div class="flex flex-row justify-between gap-2">
		<input type="submit" class="btn btn-blue text-white" formaction="?/update" value="Update" />
		<a href="/challenges/{data.challenge._id}" class="btn btn-gray">View</a>

		<input
			type="submit"
			class="btn btn-red text-white ml-auto"
			formaction="?/delete"
			value="Delete"
			on:click={confirmDelete}
		/>
	</div>
</form>
