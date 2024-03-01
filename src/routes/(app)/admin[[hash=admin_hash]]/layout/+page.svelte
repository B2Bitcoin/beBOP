<script lang="ts">
	import { MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product.js';

	export let data;
</script>

<form method="post" class="flex flex-col gap-4">
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="usersDarkDefaultTheme"
			class="form-checkbox"
			checked={data.usersDarkDefaultTheme}
		/>
		Use Dark mode by default for users
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="employeesDarkDefaultTheme"
			class="form-checkbox"
			checked={data.employeesDarkefaulTheme}
		/>
		Use Dark mode by default for employees
	</label>
	<h2 class="text-2xl">Top bar</h2>

	<label class="form-label">
		Brand name
		<input type="text" name="brandName" class="form-input" value={data.brandName} />
	</label>

	<p>
		To change the logo, go to <a
			href="{data.adminPrefix}/picture"
			class="body-hyperlink hover:underline">pictures</a
		>, add a picture, and set it as logo
	</p>
	<p>
		To change the favicon, go to <a
			href="{data.adminPrefix}/picture"
			class="body-hyperlink hover:underline">pictures</a
		>, add a picture, and set it as favicon
	</p>
	<label class="form-label">
		Website title
		<input type="text" name="websiteTitle" class="form-input" value={data.websiteTitle} />
	</label>

	<label class="form-label">
		Website description
		<textarea
			name="websiteShortDescription"
			cols="30"
			rows="2"
			placeholder="Shown in social media previews"
			maxlength={MAX_SHORT_DESCRIPTION_LIMIT}
			class="form-input block w-full"
			value={data.websiteShortDescription}
		/>
	</label>

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
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="displayPoweredBy"
			class="form-checkbox"
			checked={data.displayPoweredBy}
		/>
		Display "Powered by beBOP"
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="displayCompanyInfo"
			class="form-checkbox"
			checked={data.displayCompanyInfo}
		/>
		Display company identity & company contact
	</label>

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

	<h2 class="text-2xl">Social network icons</h2>

	<h3 class="text-xl">Links</h3>

	{#each [...data.links.socialNetworkIcons, { name: '', svg: '', href: '' }] as icon, i}
		<div class="flex gap-4">
			<label class="form-label">
				Name
				<input
					type="text"
					name="socialNetworkIcons[{i}].name"
					class="form-input"
					value={icon.name}
				/>
			</label>
			<label class="form-label">
				SVG
				<textarea
					name="socialNetworkIcons[{i}].svg"
					cols="30"
					rows="5"
					maxlength="10000"
					class="form-input"
					value={icon.svg}
				/>
			</label>
			<label class="form-label">
				Url
				<input
					type="text"
					name="socialNetworkIcons[{i}].href"
					class="form-input"
					value={icon.href}
				/>
			</label>
		</div>
	{/each}

	<button class="btn btn-black self-start" type="submit">Update</button>
</form>
