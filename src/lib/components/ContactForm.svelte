<script lang="ts">
	import { page } from '$app/stores';
	import { useI18n } from '$lib/i18n';
	import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
	import type { ContactForm } from '$lib/types/ContactForm';
	import { MAX_NAME_LIMIT } from '$lib/types/Product';

	export let contactForm: Pick<ContactForm, '_id' | 'subject' | 'content' | 'target'>;

	let className = '';
	export { className as class };

	let subject = contactForm.subject;
	let content = contactForm.content;
	const { t } = useI18n();
</script>

<form
	method="post"
	action="{$page.url.pathname === '/' ? '/home' : ''}?/sendEmail"
	class="relative mx-auto tagWidget flex flex-col gap-4 tagWidget-main p-6 rounded {className}"
>
	<input class="form-input" type="hidden" name="target" bind:value={contactForm.target} />
	<label class="form-label">
		Subject
		<input
			class="form-input"
			type="text"
			maxlength={MAX_NAME_LIMIT}
			name="subject"
			placeholder="Subject"
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
	<button type="submit" class="btn tagWidget-cta">{t('contact.form.contactUs')}</button>
</form>
