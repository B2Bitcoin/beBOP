<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
	import type { ContactForm } from '$lib/types/ContactForm';
	import { MAX_NAME_LIMIT } from '$lib/types/Product';

	export let contactForm: Pick<ContactForm, 'title' | 'content'>;
	export let target: string;

	let className = '';
	export { className as class };

	const { t } = useI18n();
	let title = contactForm.title;
	let content = contactForm.content;
</script>

<div class="relative mx-auto tagWidget flex flex-col gap-4 tagWidget-main p-6 rounded {className}">
	<label class="form-label">
		Title
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="title"
			bind:value={title}
		/>
	</label>

	Content

	<textarea
		name="content"
		cols="20"
		rows="5"
		placeholder="message"
		maxlength={MAX_CONTENT_LIMIT}
		bind:value={content}
		class="form-input block w-full"
	/>
	<a href="mailto:{target}?subject={title}&body={content}" class="btn tagWidget-cta"
		>Contact our team</a
	>
</div>
