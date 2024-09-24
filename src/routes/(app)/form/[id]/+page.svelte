<script>
	import ContactForm from '$lib/components/ContactForm.svelte';

	export let data;
</script>

<ContactForm contactForm={data.contactForm} sessionEmail={data.email} />
