<script lang="ts">
	import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { addDays, addMonths } from 'date-fns';

	export let data;
	let mode = 'moneyAmount';
	let beginsAt = new Date().toJSON().slice(0, 10);
	let endsAt = addMonths(new Date(), 30).toJSON().slice(0, 10);
	let endsAtElement: HTMLInputElement;
	let selectedProduct: Product | null;
	let availableProductList: Product[] = data.products;
	let selectedProductList: Product[] = [];
	let productIds: String[] = [];

	function selectProduct(product: Product) {
		selectedProduct = product;
	}

	function addToSelectedProduct(product: Product) {
		selectedProductList = [...selectedProductList, product];
		productIds = [...productIds, product._id];
	}

	function removeFromAvailableProducts() {
		availableProductList = availableProductList.filter((product) => product !== selectedProduct!);
		selectedProduct = null; // Réinitialise l'élément sélectionné
	}

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

	<div class="flex flex-row space-x-12">
		<div class="flex flex-col gap-4 w-[25%]">
			<h2 class="text-xl">Selected items</h2>
			<div class="overflow-y-scroll h-40 border border-gray-400">
				<ul class="list-none cursor-default">
					{#each selectedProductList as product}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<li
							class:selected={selectedProduct === product}
							on:click={() => selectProduct(product)}
						>
							{product.name}
						</li>
					{/each}
				</ul>
			</div>
			<button
				class="self-start border border-gray-400 py-2 px-4 rounded inline-flex items-center"
				on:click={(evt) => {
					selectedProductList = selectedProductList.filter(
						(product) => product !== selectedProduct
					);
					availableProductList = selectedProduct
						? [...availableProductList, selectedProduct]
						: availableProductList;
					productIds = productIds.filter((productId) => productId !== selectedProduct?._id);
					selectedProduct = null;

					evt.preventDefault();
				}}
			>
				<span>Remove</span>
			</button>
		</div>

		<div class="flex flex-col gap-4 w-[50%]">
			<h2 class="text-xl">Available items</h2>
			<div class="overflow-y-scroll w-2/5 h-40 border border-gray-400">
				<ul class="list-none cursor-default">
					{#each availableProductList as product}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<li
							class:selected={selectedProduct === product}
							on:click={() => selectProduct(product)}
						>
							{product.name}
						</li>
					{/each}
				</ul>
			</div>
			<button
				class=" self-start border border-gray-400 py-2 px-4 rounded inline-flex items-center"
				on:click={(evt) => {
					selectedProduct ? addToSelectedProduct(selectedProduct) : null;
					removeFromAvailableProducts();

					evt.preventDefault();
				}}
			>
				<span>Add</span>
			</button>
		</div>
	</div>
	<input type="hidden" bind:value={productIds} name="productIds" />

	<input type="submit" class="btn btn-blue self-start text-white" value="Submit" />
</form>

<style>
	.selected {
		background-color: rgb(165, 165, 172);
	}
</style>
