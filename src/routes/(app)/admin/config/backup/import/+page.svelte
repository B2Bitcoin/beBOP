<script lang="ts">
	import type { ImportTypeTypes } from '$lib/types/Backup';

	let authorizedExtensions = ['.json'];

	let importType: ImportTypeTypes = 'global';
	let importOrders: boolean = false;
	let passedChallenges: boolean = false;
</script>

<h1 class="text-3xl">Import backup</h1>
<form method="post" enctype="multipart/form-data">
	<div class="group">
		<label for="file">Upload your file</label>
		<input
			type="file"
			id="file"
			name="fileToUpload"
			accept={authorizedExtensions.join(',')}
			required
		/>

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

		<label class="checkbox-label">
			<input type="checkbox" class="form-checkbox" name="importOrders" checked={importOrders} />
			Orders
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				class="form-checkbox"
				name="passedChallenges"
				checked={passedChallenges}
			/>
			Passed challenges
		</label>
	</div>

	<button type="submit" class="btn btn-black self-start">Submit</button>
</form>
