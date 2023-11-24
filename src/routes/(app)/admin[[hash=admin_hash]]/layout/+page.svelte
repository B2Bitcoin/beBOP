<script lang="ts">
	export let data;
</script>

<h1 class="text-3xl">Layout</h1>

<form method="post" class="flex flex-col gap-4">
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="usersDarkDefaultTheme"
			class="form-checkbox"
			checked={data.usersDarkDefaultTheme}
		/>
		Use dark theme as default theme for users
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="employeesDarkDefaultTheme"
			class="form-checkbox"
			checked={data.employeesDarkefaulTheme}
		/>
		Use dark theme as default theme for employees
	</label>
	<h2 class="text-2xl">Top bar</h2>

	<label class="form-label">
		Brand name
		<input type="text" name="brandName" class="form-input" value={data.brandName} />
	</label>

	<p>
		To change the logo, go to <a href="{data.adminPrefix}/picture" class="text-link hover:underline"
			>pictures</a
		>, add a picture, and set it as logo
	</p>

	<h3 class="text-xl">Links</h3>

	{#each [...data.links.topbar, { href: '', label: '' }] as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="topbarLinks[{i}].label" class="form-input" value={link.label} />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="topbarLinks[{i}].href" class="form-input" value={link.href} />
			</label>
		</div>
	{/each}

	<h2 class="text-2xl">Nav bar</h2>

	<h3 class="text-xl">Links</h3>

	{#each [...data.links.navbar, { href: '', label: '' }] as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="navbarLinks[{i}].label" class="form-input" value={link.label} />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="navbarLinks[{i}].href" class="form-input" value={link.href} />
			</label>
		</div>
	{/each}

	<h2 class="text-2xl">Footer</h2>

	<h3 class="text-xl">Links</h3>

	{#each [...data.links.footer, { href: '', label: '' }] as link, i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="footerLinks[{i}].label" class="form-input" value={link.label} />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="footerLinks[{i}].href" class="form-input" value={link.href} />
			</label>
		</div>
	{/each}

	<button class="btn btn-black self-start" type="submit">Update</button>
</form>
