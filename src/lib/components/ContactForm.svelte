<script lang="ts">
	import { useI18n } from '$lib/i18n';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
	import type { ContactForm } from '$lib/types/ContactForm';
	import { MAX_NAME_LIMIT } from '$lib/types/Product';

	export let contactForm: Pick<ContactForm, 'subject' | 'content' | 'target'>;

	let className = '';
	export { className as class };

	let subject = contactForm.subject;
	let content = contactForm.content;
	const { t } = useI18n();
</script>

<div class="relative mx-auto tagWidget flex flex-col gap-4 tagWidget-main p-6 rounded {className}">
	<label class="form-label">
		Subject
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="title"
			placeholder="title"
			bind:value={subject}
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
	<a href="mailto:{contactForm.target}?subject={subject}&body={content}" class="btn tagWidget-cta"
		>{t('contact.form.contactUs')}</a
	>
</div>
