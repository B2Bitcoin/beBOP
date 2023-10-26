<script lang="ts">
	import { generateId } from '$lib/utils/generateId';
	import { upperFirst } from '$lib/utils/upperFirst';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let name = '';
	let slug = '';
	let formElement: HTMLFormElement;
	let fileMainPicture: FileList;
	let fileFullPicture: FileList;
	let fileWideBanner: FileList;
	let fileSlimBanner: FileList;
	let fileAvatar: FileList;

	let submitting = false;
	async function handleSubmit() {
		try {
			submitting = true;
			// Need to load here, or for some reason, some inputs disappear afterwards
			const formData = new FormData(formElement);

			const mainPictureId = await filesUpload(fileMainPicture);
			formData.set('mainPictureId', mainPictureId);
			const fullPictureId = await filesUpload(fileFullPicture);
			formData.set('fullPictureId', fullPictureId);
			const wideBannerId = await filesUpload(fileWideBanner);
			formData.set('wideBannerId', wideBannerId);
			const slimBannerId = await filesUpload(fileSlimBanner);
			formData.set('slimBannerId', slimBannerId);
			const avatarId = await filesUpload(fileAvatar);
			formData.set('avatarId', avatarId);

			const finalResponse = await fetch(formElement.action, {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await finalResponse.text());

			if (result.type === 'success') {
				// rerun all `load` functions, following the successful update
				await invalidateAll();
			}

			applyAction(result);
		} finally {
			submitting = true;
		}
	}
	async function filesUpload(files: FileList) {
		const fileSize = files[0].size;
		const fileName = files[0].name;

		const response = await fetch('/admin/picture/prepare', {
			method: 'POST',
			body: JSON.stringify({
				fileName,
				fileSize
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(await response.text());
		}

		const body = await response.json();

		const { uploadUrl, pictureId } = body;

		const uploadResponse = await fetch(uploadUrl, {
			method: 'PUT',
			body: files[0]
		});

		if (!uploadResponse.ok) {
			throw new Error(await uploadResponse.text());
		}
		return pictureId;
	}
</script>

<h1 class="text-3xl">Add a tag</h1>

<form
	method="post"
	class="flex flex-col gap-4"
	bind:this={formElement}
	on:submit|preventDefault={handleSubmit}
>
	<label class="form-label">
		tag name
		<input
			class="form-input"
			type="text"
			name="name"
			placeholder="Tag name"
			bind:value={name}
			on:change={() => (slug = generateId(name, false))}
			on:input={() => (slug = generateId(name, false))}
			required
		/>
	</label>

	<label class="form-label">
		Slug

		<input
			class="form-input block"
			type="text"
			name="slug"
			placeholder="Slug"
			bind:value={slug}
			title="Only lowercase letters, numbers and dashes are allowed"
			required
		/>
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" name="widgetUseOnly" />
		For widget use only
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" name="productTagging" />
		Available for product tagging
	</label>
	<label class="checkbox-label">
		<input class="form-checkbox" type="checkbox" name="useLightDark" />
		Use light/dark inverted mode
	</label>
	<div class="flex flex-col gap-4 w-[20em]">
		<label class="form-label">
			Tag family
			<select class="form-input" name="family">
				{#each ['creators', 'events', 'retailers', 'temporal'] as family}
					<option value={family}>{upperFirst(family)}</option>
				{/each}
			</select>
		</label>
	</div>

	<label class="form-label">
		Tag title
		<input class="form-input" type="text" name="title" placeholder="Tag title" required />
	</label>
	<label class="form-label">
		Tag subtitle
		<input class="form-input" type="text" name="subtitle" placeholder="Tag subtitle" required />
	</label>
	<label class="form-label">
		Short content
		<textarea name="shortContent" cols="30" rows="2" class="form-input" />
	</label>
	<label class="form-label">
		Full content
		<textarea name="content" cols="30" rows="10" maxlength="10000" class="form-input" />
	</label>

	<input type="hidden" name="mainPictureId" />
	<label class="form-label">
		Main picture
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="block"
			bind:files={fileMainPicture}
			required
			disabled={submitting}
		/>
	</label>
	<input type="hidden" name="fullPictureId" />
	<label class="form-label">
		Full picture
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="block"
			bind:files={fileFullPicture}
			required
			disabled={submitting}
		/>
	</label>
	<input type="hidden" name="wideBannerId" />
	<label class="form-label">
		Wide banner
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="block"
			bind:files={fileWideBanner}
			required
			disabled={submitting}
		/>
	</label>
	<input type="hidden" name="slimBannerId" />
	<label class="form-label">
		Slim banner
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="block"
			bind:files={fileSlimBanner}
			required
			disabled={submitting}
		/>
	</label>
	<input type="hidden" name="avatarId" />
	<label class="form-label">
		Avatar
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="block"
			bind:files={fileAvatar}
			required
			disabled={submitting}
		/>
	</label>

	<h3 class="text-xl">CTAs</h3>
	{#each [0, 1, 2] as i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="ctaLinks[{i}].label" class="form-input" />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="ctaLinks[{i}].href" class="form-input" />
			</label>
		</div>
	{/each}
	<h3 class="text-xl">Links menu</h3>
	{#each [0, 1, 2, 3, 4] as i}
		<div class="flex gap-4">
			<label class="form-label">
				Text
				<input type="text" name="menuLinks[{i}].label" class="form-input" />
			</label>
			<label class="form-label">
				Url
				<input type="text" name="menuLinks[{i}].href" class="form-input" />
			</label>
		</div>
	{/each}
	<label class="form-label">
		CSS override
		<textarea name="cssOverride" cols="30" rows="10" maxlength="10000" class="form-input" />
	</label>

	<input
		type="submit"
		class="btn btn-blue self-start text-white"
		value="Submit"
		disabled={submitting}
	/>
</form>
