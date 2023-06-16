<script lang="ts">
	export let form;
</script>

<h1 class="text-3xl">Emails</h1>

{#if form?.success}
	<p class="border border-green-400 p-2 text-green-600 rounded">Email sent</p>
{/if}

<form method="post" class="flex flex-col gap-6">
	<label class="form-label">To <input type="email" name="to" required class="form-input" /></label>
	<label class="form-label"
		>Subject <input type="text" name="subject" required class="form-input" /></label
	>
	<label class="form-label">
		Body
		<textarea name="body" class="form-input" />
	</label>
	<button type="submit" class="btn btn-black self-start">Send</button>
</form>
