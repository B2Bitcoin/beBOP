<script lang="ts">
	type ImportTypeTypes = 'global' | 'catalog' | 'shopConfig';

	export let data;
	export let form;

	let authorizedExtensions = ['.json'];

	let importType: ImportTypeTypes | string = data.importType ?? 'global';
	let importOrders = false;
	let includePastChallenges = false;
	let importFiles = false;
</script>

{#if form?.success}
	<p class="alert-success">Data imported</p>
{/if}

<h1 class="text-3xl">Import backup</h1>
<form method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
	<label for="file">Upload your file</label>
	<input
		type="file"
		id="file"
		name="fileToUpload"
		accept={authorizedExtensions.join(',')}
		required
	/>

	<div class="flex flex-col gap-2">
		<h2 class="text-2xl">Import type</h2>

		<label class="checkbox-label">
			<input
				type="radio"
				bind:group={importType}
				class="form-radio"
				name="importType"
				value="global"
			/>
			Global
		</label>

		<label class="checkbox-label">
			<input
				type="radio"
				bind:group={importType}
				class="form-radio"
				name="importType"
				value="catalog"
			/>
			Catalog
		</label>

		<label class="checkbox-label">
			<input
				type="radio"
				bind:group={importType}
				class="form-radio"
				name="importType"
				value="shopConfig"
			/>
			Shop configuration
		</label>
	</div>

	<div class="flex flex-col gap-2">
		<h2 class="text-2xl">Specific import</h2>

		<label class="checkbox-label">
			<input type="checkbox" class="form-checkbox" name="importOrders" checked={importOrders} />
			Orders
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				class="form-checkbox"
				name="includePastChallenges"
				checked={includePastChallenges}
			/>
			Passed challenges
		</label>

		<label class="checkbox-label">
			<input type="checkbox" class="form-checkbox" name="importFiles" bind:checked={importFiles} />
			Import Pictures & Digital Files
		</label>

		{#if importFiles}
			<label for="importTypeFiles">Choose import type:</label>
			<select id="importTypeFiles" name="importTypeFiles">
				<option value="basic">Basic</option>
				<option value="checkWarn">Check & warn</option>
				<option value="checkClean">Check & clean</option>
			</select>
		{/if}
	</div>

	<button type="submit" class="btn btn-black self-start">Import</button>
</form>
