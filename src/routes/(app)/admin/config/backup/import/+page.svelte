<script lang="ts">
	let authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.json'];
	let file;
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
	</div>

	<button type="submit" class="btn btn-black self-start">Submit</button>
</form>
