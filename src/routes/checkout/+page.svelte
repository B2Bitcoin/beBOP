<main class="mx-auto max-w-7xl py-10 px-6">
	<div class="w-full rounded-xl bg-white border-gray-300 border p-6 flex flex-col gap-6">
		<h1 class="page-title">Checkout</h1>

		<section class="gap-4 grid grid-cols-6">
			<h2 class="font-light text-2xl col-span-6">Shipment info</h2>

			<label class="form-label col-span-3">
				First name
				<input type="text" class="form-input" name="firstName" required />
			</label>

			<label class="form-label col-span-3">
				Last name
				<input type="text" class="form-input" name="lastName" required />
			</label>

			<label class="form-label col-span-6">
				Address
				<input type="text" class="form-input" name="address" required />
			</label>

			<label class="form-label col-span-3">
				Country
				<select name="country" class="form-input" required>
					<option value="FRA">France</option>
					<option value="CHF">Swiss</option>
					<option value="USA">USA</option>
				</select>
			</label>

			<span class="col-span-3" />

			<label class="form-label col-span-2">
				State

				<input type="text" name="state" class="form-input" />
			</label>
			<label class="form-label col-span-2">
				City

				<input type="text" name="city" class="form-input" required />
			</label>
			<label class="form-label col-span-2">
				Zip code

				<input type="text" name="zipCode" class="form-input" required />
			</label>
		</section>

		<section class="gap-4 flex flex-col">
			<h2 class="font-light text-2xl">Payment</h2>

			<label class="form-label">
				Payment method

				<div class="grid grid-cols-2 gap-4 items-center">
					<select name="paymentMethod" class="form-input" required>
						<option value="walletA">Wallet A</option>
					</select>
					<a href="/connect" class="underline text-blue"> Connect another wallet </a>
				</div>
			</label>
		</section>

		<section class="gap-4 flex flex-col">
			<h2 class="font-light text-2xl">Feed & Notifications</h2>

			{#each ['Payment status', 'Product changes', 'Newsletter'] as feedTitle}
				<article class="rounded border border-gray-300 overflow-hidden flex flex-col">
					<div
						class="pl-4 py-2 bg-gray-190 border-b border-gray-300 text-base font-light text-gray-800"
					>
						{feedTitle}
					</div>
					<div class="p-4 flex flex-col gap-3">
						<label class="form-label">
							Email
							<input type="email" class="form-input" />
						</label>
						<label class="form-label">
							Phone
							<input type="email" class="form-input" />
						</label>
					</div>
				</article>
			{/each}
		</section>

		<button class="btn btn-black btn-xl">Proceed</button>
	</div>
</main>
