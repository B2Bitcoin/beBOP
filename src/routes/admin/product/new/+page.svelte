<main class="p-4">
	<h1 class="text-3xl">Add a product</h1>

	<form method="post" enctype="multipart/form-data">
		<label class="block my-4 leading-8">
			Product name
			<input class="form-input block" type="text" name="name" placeholder="Product name" required />
		</label>

		<label class="block my-4 leading-8">
			Price
			<input
				class="form-input"
				type="number"
				name="priceAmount"
				placeholder="Price (BTC)"
				step="any"
				required
			/>
		</label>

		<input type="hidden" name="priceCurrency" value="BTC" />

		<label class="block w-full mt-4">
			Short description
			<textarea
				name="shortDescription"
				cols="30"
				rows="2"
				maxlength="250"
				class="form-input block w-full"
			/>
		</label>

		<label class="block w-full mt-4">
			Description
			<textarea
				name="description"
				cols="30"
				rows="10"
				maxlength="10000"
				class="form-input block w-full"
			/>
		</label>

		<label class="block my-4 leading-8">
			Picture
			<input type="file" name="picture" accept="image/jpeg,image/png" class="block" required />
		</label>

		<input type="submit" class="btn btn-blue text-white" value="Submit" />
	</form>
</main>
