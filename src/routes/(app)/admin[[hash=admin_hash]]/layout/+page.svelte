<script lang="ts">
	import { MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product.js';
	import { upperFirst } from 'lodash-es';

	export let data;
	let viewportContentWidth = data.viewportContentWidth;
	let viewportFor = data.viewportFor;
	async function confirmSubmit(event: Event) {
		if (
			viewportFor === 'employee' &&
			!confirm(
				"Mobile-friendly display is still under construction. Are you sure ? This option is meant to be use to check your be-BOP with mobile specific display as an employee. For now, it's mean to be a temporary, and can reduce useability of the back-office to your team and POS session. Are you really sure ?"
			)
		) {
			event.preventDefault();
		}
		if (
			viewportFor === 'visitors' &&
			!confirm(
				"Mobile-friendly display is still under construction. Are you sure ? This option is meant to be use to give your visitors a mobile-friendly experience. For now, it's mean to be a temporary, and can degrade display of CMS and other pages of user journey. Are you really sure ?"
			)
		) {
			event.preventDefault();
		}
		if (
			viewportFor === 'everyone' &&
			!confirm(
				"Mobile-friendly display is still under construction. Are you sure ? This option is meant to be use on a public test phase of your be-BOP and to provide mobile-friendly experience. For now, it's mean to be a temporary, and can degrade both visitors and employees journey, as POS session. Are you really sure ?"
			)
		) {
			event.preventDefault();
		}
	}
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
		Display "Powered by be-BOP"
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
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="displayMainShopInfo"
			class="form-checkbox"
			checked={data.displayMainShopInfo}
		/>
		Display main shop informations
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
	<h2 class="text-2xl">Mobile Display</h2>
	<h2>Allow you to customize be-bop default behavior on mobile</h2>
	<h2>Default configuration is:</h2>
	<code class="font-mono">meta name="viewport" content="width=1000"</code>

	<label class="form-label">
		Viewport width (default: 1000)
		<input
			type="number"
			name="viewportContentWidth"
			class="form-input"
			max="1000"
			bind:value={viewportContentWidth}
		/>
	</label>
	<label class="form-label">
		Use content="width=device-width" for:
		<select class="form-input" name="viewportFor" required bind:value={viewportFor}>
			{#each ['no-one', 'employee', 'visitors', 'everyone'] as value}
				<option {value} selected={data.viewportFor === value}>{upperFirst(value)}</option>
			{/each}
		</select>
	</label>
	<label class="checkbox-label">
		<input
			type="checkbox"
			name="hideCmsZonesOnMobile"
			class="form-checkbox"
			checked={data.hideCmsZonesOnMobile}
		/>
		Hide every CMS additional zone on mobile (product, cart, checkout and order page)
	</label>
	<button class="btn btn-black self-start" type="submit" on:click={confirmSubmit}>Update</button>
</form>
