<script>
	import IconMenu from '~icons/ant-design/menu-outlined';
	import IconBeyond from '$lib/components/icons/siteIcons/IconBeyond.svelte';
	import IconLeax from '$lib/components/icons/siteIcons/IconLeax.svelte';
	import IconBity from '$lib/components/icons/siteIcons/IconBity.svelte';
	import IconHolding from '$lib/components/icons/siteIcons/IconHolding.svelte';
	import IconPvhEditions from '$lib/components/icons/siteIcons/IconPvhEditions.svelte';
	import IconDenali from '$lib/components/icons/siteIcons/IconDenali.svelte';
	import IconDecouvreBitcoin from '$lib/components/icons/siteIcons/IconDecouvreBitcoin.svelte';
	import IconCoyotech from '$lib/components/icons/siteIcons/IconCoyotech.svelte';
	import IconAgiltoo from '$lib/components/icons/siteIcons/IconAgiltoo.svelte';
	import IconNpr from '$lib/components/icons/siteIcons/IconNpr.svelte';
	import IconNech from '$lib/components/icons/siteIcons/IconNech.svelte';
	import { slide } from 'svelte/transition';

	let topMenuOpen = false;
	let isMaintenance = false;

	let topbarLinks = [
		{ label: 'Store', href: '/store' },
		{ label: 'Prices', href: '/' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'About us', href: '/' },
		{ label: 'Connect', href: '/admin' }
	];

	let footerbarLink = [
		{ label: 'Work with us', href: '/' },
		{ label: 'About us', href: '/' },
		{ label: 'Contact', href: '/admin' }
	];
</script>

<svelte:head>
	<title>B2Bitcoin Bootik</title>
	<meta name="description" content="B2Bitcoin's official bootik" />
</svelte:head>

<div data-sveltekit-preload-data={isMaintenance ? 'tap' : 'hover'} style="display: contents;">
	<header class="bg-purple-100 items-center flex h-[50px]">
		<div class="mx-auto max-w-4xl flex items-center gap-6 px-6 grow">
			<a class="flex items-center gap-4" href="/">
				<span class="font-bold text-[22px] font-display">LaBookinerie.</span>
			</a>
			<span class="grow" />
			<nav class="flex gap-10 text-[14px] font-semibold">
				{#each topbarLinks as link}
					<a href={link.href} class="hidden sm:inline">{link.label}</a>
				{/each}
			</nav>
			<button
				class="inline-flex flex-col justify-center sm:hidden cursor-pointer text-4xl transition"
				class:rotate-90={topMenuOpen}
				on:click={() => (topMenuOpen = !topMenuOpen)}
			>
				<IconMenu />
			</button>
		</div>
	</header>
	{#if topMenuOpen}
		<nav
			transition:slide
			class="bg-gray-850 flex flex-col sm:hidden text-[22px] font-semibold border-x-0 border-b-0 border-opacity-25 border-t-1 border-white px-10 py-4 text-white"
		>
			{#each topbarLinks as link}
				<a class="py-4" href={link.href}>{link.label}</a>
			{/each}
		</nav>
	{/if}
	<div class="bg-purple-100 h-[300px]">
		<div class="mx-auto max-w-3xl px-12 grow">
			<h2 class="text-4xl text-center mt-[100px] font-display font-bold">
				They write. You read. Nothing more. Nothing less.
			</h2>
		</div>
	</div>
	<div class="h-[820px] items-center flex flex-col">
		<div class="mx-auto max-w-4xl flex px-12 gap-4 mt-12 mb-12">
			<img class="h-[700px] w-[50%]" src="recurso.png" alt="Main logo" />

			<div class="w-full">
				<h2 class="text-3xl mb-2 font-display">The philosophy.</h2>
				<p class="text-sm text-purple-500">
					We love books. We love to write them, we love to publish them, we love to make them, and
					we love to share them. Writing is about sharing, and sharing is caring. Our publisher’s
					job is to take work from an author and make it the best in order to be read by as much
					readers as possible. Even with the book business, we have an ideal of allowing a connexion
					directly between the author and the reader. Some kind of peer-to-peer publishing.
				</p>
				<p class="text-sm mt-4 mb-4 text-purple-500">
					That’s why, in 2023, PVH Éditions decided to release the Ludomire collection in CC-BY-SA
					licence (read more about it here). And that’s also why, in the same year, PVH Éditions
					goes in partnership with B2Bitcoin to release LaBookinerie.ch, the first publishing
					showcase based on LaBootikerie’s peer-2-peer product.
				</p>
				<h2 class="text-3xl mb-6 mt-6 font-display">The product.</h2>
				<p class="text-sm text-purple-500">It’s not BtoC, it’s P2P”</p>
				<p class="text-sm mt-2 mb-4 text-purple-500">
					Bootiks are simple, easy-to-use online selling platforms, based on peer-to-peer payment
					solutions and architecture philosophy. From the classical modular eshop frameworks to
					online patronage, billing and crowdfunding tools, Bootiks allow creators to share with
					their supports on the same place, for lesser fees, and with a thing for privacy respect.
				</p>
				<p class="text-sm text-purple-500">
					Imagine a world where you just create and share content. A world where you don’t have to
					wait for banks and centralized platforms greenlight to meet your public. A world where
					your public doesn’t have to manage multiple accounts to support and back you up. A world
					where you don’t have to follow study courses to understand how to valorize your work to
					stick to huge companies needs.
				</p>
			</div>
		</div>
	</div>
	<div class="bg-purple-500 h-[200px] flex justify-center items-center">
		<div class="mx-auto max-w-3xl px-12 text-center">
			<h1 class="text-4xl font-display text-white">
				You make. You set. You share. They buy. They back. They tip. That’s all.
			</h1>
		</div>
	</div>

	<div class="bg-purple-100 h-[550px] flex">
		<div class="mx-auto max-w-4xl px-6 gap-2 grow">
			<h1 class="text-4xl mt-12 mb-8 font-display">The Makers.</h1>
			<div class="flex gap-4">
				<h1 class="text-l uppercase">B2Bitcoin cooperative</h1>
				<hr class="w-[620px] h-px mt-4 bg-gray-200 border-0 dark:bg-gray-400" />
			</div>
			<div class="grid grid-cols-5 mt-2 mb-8 gap-6 flex justify-center items-center">
				<IconPvhEditions />
				<IconBeyond />
				<IconLeax />
				<IconHolding />
				<IconBity />
				<IconDenali />
				<IconDecouvreBitcoin />
			</div>
			<div class="flex gap-4">
				<h1 class="text-l uppercase">Bootik helpers</h1>
				<hr class="w-[700px] h-px mt-4 bg-gray-200 border-0 dark:bg-gray-400" />
			</div>
			<div class="grid grid-cols-5 mt-2 gap-6 flex justify-center items-center">
				<IconCoyotech />
				<IconAgiltoo />
			</div>
		</div>
	</div>
	<div class="grow h-[1550px] bg-gray-75">
		<div class="mx-auto max-w-4xl px-6 gap-2 grow">
			<h1 class="text-4xl font-display mt-12">The Publisher.</h1>
			<h1 class="text-2xl mt-8 mb-4 font-display">
				PVH Éditions: A Publishing Company for Speculative and Science Fiction.
			</h1>
			<p class="text-purple-500">
				PVH Éditions is a publishing company specialized in speculative and science fiction,
				including but not limited to fantasy, folklore, art-books, and role-playing games. In
				addition, PVH Editions works in collaboration with authors and illustrators based on a
				global project that involves adapting books to alternative formats. Through creative
				editorial design, PVH Editions develops and enriches initial projects, while establishing
				the value of creative freedom and transparency. The company aims to promote fantasy and
				science fiction genres through different collections.
			</p>
			<p class="mt-4 text-purple-500">
				PVH Éditions also embraces a philosophy of sharing, innovation, peer-to-peer collaboration,
				and fun. Over the years, they have conducted several experiments, such as:
			</p>
			<ul class="list-disc ml-8 text-purple-500">
				<li>
					In 2014, they launched a Thelia-based platform for selling DRM-free and pay-what-you-want
					ebooks.
				</li>
				<li>In 2023, they released their book collection under the CC-BY-SA license.</li>
			</ul>
			<p class="mt-4 text-purple-500">
				Now, PVH Éditions is excited to introduce the new LaBookinerie experience, made possible by
				LaBootikerie.
			</p>
			<h1 class="text-2xl mt-4 mb-2 font-display">
				An SFFF Editor: Publishing Works of Imagination.
			</h1>

			<p>
				At PVH Éditions, we publish works from the literature of the imagination, encompassing
				various genres such as:
			</p>
			<ul class="list-disc ml-8 text-purple-500">
				<li>Science Fiction</li>
				<li>Fantasy</li>
				<li>Fantastic</li>
				<li>Anticipation</li>
				<li>Tales and legends</li>
			</ul>
			<div class="flex mt-4 gap-6">
				<div class="flex flex-col gap-1">
					<h1 class="text-l font-display">Promoting Imagination Through Unique Collections.</h1>
					<p class="text-sm text-purple-500">
						We welcome all formats, including novels, short stories, comics, art-books,
						book-universes, and role-playing manuals. Our Ludomire collection, in particular, is
						well-suited for novels and short stories. We prioritize quality over quantity and
						carefully select the texts we publish. When choosing a text, we take the time to refine
						the editorial project in close collaboration with the author. Our goal is to create
						professionally illustrated books that inspire, ensuring that the author who trusted us
						is proud of the end result.
					</p>
				</div>
				<div class="flex flex-col gap-1">
					<h1 class="text-l font-display">Insights into the Works.</h1>
					<p class="text-sm text-purple-500">
						Providing insights into the works we publish, we strive to add extra dimensions
						consistent with their unique perspectives. This may involve unconventional editorial
						treatments, such as different printing characteristics or special licenses. We also
						explore derivative products such as supplements, series, alternative formats, and games.
						As a publisher, we aim to extend the immersive experience for our readers and provide
						authors and illustrators with opportunities to deepen their worlds. Through our
						editorial creativity, we contribute to the enrichment of our projects.
					</p>
				</div>
				<div class="flex flex-col gap-1">
					<h1 class="text-l font-display">An Interest in Free Culture.</h1>
					<p class="text-sm text-purple-500">
						Embracing the spirit of free culture, we hold a genuine appreciation for internet
						culture, peer-to-peer sharing, and borderless exchange. Without radicalism, we embrace
						experimentation in our work processes and editorial activities. We do not pursue those
						who share our works and refrain from implementing protection on our e-books, ensuring an
						uncompromised experience for our audience. We are about to launch a collection under
						Creative Commons licenses and are eager to foster a community of authors and readers who
						share our curiosity for free creation.
					</p>
				</div>
			</div>
			<h1 class="text-4xl mt-12 font-display">The Stories.</h1>
			<div class="flex mt-4 gap-6">
				<div class="flex flex-col gap-1">
					<div
						class="h-[50px] w-[50px] bg-purple-300 mb-4 flex justify-center items-center rounded-[30px]"
					>
						<h1 class="text-l">Logo</h1>
					</div>
					<p class="text-md text-purple-500 font-semibold">by PVH Éditions</p>
					<p class="text-sm text-purple-500">
						Bootik pilot from a SFFF book-publisher point-of-view.
					</p>
				</div>
				<div class="flex flex-col gap-1">
					<div
						class="h-[50px] w-[150px] bg-purple-300 mb-4 flex justify-center items-center rounded-lg"
					>
						<h1 class="text-l">Logo</h1>
					</div>
					<p class="text-md text-purple-500 font-semibold">by PVH Labs</p>
					<p class="text-sm text-purple-500">
						Fundraising platform for videogame and cultural software development studio.
					</p>
				</div>
				<div class="flex flex-col gap-1">
					<div
						class="h-[50px] w-[50px] bg-purple-300 mb-4 flex justify-center items-center rounded-[30px]"
					>
						<h1 class="text-l">Logo</h1>
					</div>
					<p class="text-md text-purple-500 font-semibold">by B2Bitcoin</p>
					<p class="text-sm text-purple-500">Short-term homestay in the countryside.</p>
				</div>
				<div class="flex flex-col gap-1">
					<div
						class="h-[50px] w-[150px] bg-purple-300 mb-4 flex justify-center items-center rounded-lg"
					>
						<h1 class="text-l">Logo</h1>
					</div>
					<p class="text-md text-purple-500 font-semibold">by SCI Montarouet</p>
					<p class="text-sm text-purple-500">Short-term homestay in the countryside.</p>
				</div>
			</div>
			<h1 class="text-4xl mt-12 mb-12 font-display">Our Partners.</h1>
			<div class="grid grid-cols-2 mt-2 mb-8 gap-10 flex justify-center items-center">
				<IconNpr />
				<IconNech />
			</div>
		</div>
	</div>
	<div class="bg-purple-100 h-[550px] flex">
		<div class="mx-auto max-w-4xl px-6 gap-2">
			<h1 class="text-4xl mt-12 mb-8 font-display">Get in touch.</h1>
			<div class=" gap-6 flex">
				<form method="post" class="flex flex-col gap-2 items-end">
					<div class="flex gap-4">
						<label class="form-label">
							Name
							<input type="text" name="name" class="form-input" />
						</label>

						<label class="form-label">
							Email
							<input class="form-input" type="text" name="email" required />
						</label>
					</div>
					<label class="form-label">
						Message
						<textarea name="message" maxlength="10000" class="form-input w-[450px] h-[100px]" />
					</label>

					<div class="mt-8">
						<input type="submit" class="btn bg-purple-500 text-white" value="Send" />
					</div>
				</form>
				<img class="h-[180px] mt-8 w-[50%]" src="map.png" alt="Map card" />
			</div>
		</div>
	</div>
	<footer class="bg-purple-500 h-[90px] items-center flex">
		<div class="mx-auto max-w-3xl px-6 flex items-center gap-2 text-gray-550 grow">
			<span class="font-display text-2xl text-white"> LaBookinerie. </span>
			<div class="ml-auto flex gap-4 items-center">
				{#each footerbarLink as link}
					<a href={link.href} class="text-white">{link.label}</a>
				{/each}
			</div>
		</div>
	</footer>
</div>

<style>
	.bg-purple-100 {
		background-color: #f3ebfa;
	}
	.bg-purple-500 {
		background-color: #704aa0;
	}
	.bg-purple-300 {
		background-color: #9579b5;
	}
	.text-purple-500 {
		color: #704aa0;
	}
</style>
