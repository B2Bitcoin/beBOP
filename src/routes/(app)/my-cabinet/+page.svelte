<script>
	import IconDownArrow from '$lib/components/icons/IconDownArrow.svelte';
	import IconDownload from '$lib/components/icons/IconDownload.svelte';
	import IconGrid from '$lib/components/icons/IconGrid.svelte';
	import IconList from '$lib/components/icons/IconList.svelte';
	import IconSearch from '$lib/components/icons/IconSearch.svelte';
	import IconSuscription from '$lib/components/icons/IconSuscription.svelte';
</script>

<div class="mx-auto max-w-7xl mb-6">
	<div class="flex flex-col h-[140px] bg-gray-200 rounded-lg gap-2">
		<div class="flex items-center px-6 gap-4">
			<h1 class="text-5xl font-bold text-[22px] py-6">My Cabinet</h1>

			<span class="grow" />
			<select class="form-input max-w-[10rem]">
				<option value="All my wallets"> All my wallets </option>
				<option value="Wallet A"> Wallet A </option>
				<option value="Wallet B"> Wallet B </option>
				<option value="Wallet C"> Wallet C </option>
			</select>
			<IconList />
			<IconGrid />
		</div>
		<div class="flex items-center justify-end">
			<div class="bg-white p-1 px-6 h-[35px] rounded-[15px] text-gray-550">Purchasing History</div>
			<div class="bg-white p-1 px-6 h-[35px] rounded-[15px] text-gray-550">Subscription</div>
			<div class="bg-white p-1 px-6 h-[35px] rounded-[15px] text-gray-550">My Emblems</div>
			<div class="bg-white p-1 px-6 h-[35px] rounded-[15px] text-gray-550">
				Downloadable Products
			</div>
		</div>
	</div>
	<div class="flex items-center h-[100px] rounded-lg bg-gray-100 px-6 gap-6">
		<span class="">6 items.</span>
		<span class="grow" />
		<a href="/categories" class="flex gap-2 items-center">Categories <IconDownArrow /></a>
		<form action="/search" method="post" class="max-w-[300px] grow relative">
			<input type="text" name="search" class="form-input pr-8 border-gray-300" />
			<IconSearch class="absolute right-2 top-0 bottom-0 my-auto" />
		</form>
		<div class="flex items-center">
			<span class="w-[100px] text-gray-550">Sort by:</span>
			<select class="form-input max-w-[10rem] w-full">
				<option value="All my wallets"> Purchase date </option>
				<option value="Wallet A"> product name </option>
				<option value="Wallet B"> Order </option>
				<option value="Wallet C"> Wallet C </option>
			</select>
		</div>
	</div>
	<div class="items-center pt-6 flex flex-col">
		<div class="w-full flex items-center gap-6 px-6 grow">
			<div class="flex gap-4">
				<img
					class="h-[80px] w-[70px]"
					src="https://labookinerie.com/picture/raw/my-cabinet-1-j0nzXL/format/100"
					alt="My Cabinet 1"
				/>
				<div class="flex flex-col gap-2">
					<span class="grow text-2xl">Procreate Brushes Set</span>
					<div class="flex items-center">
						<div class="w-2 h-2 m-2 bg-green-500 rounded-full" />
						<span class="text-gray-550 mr-4">Wallet A</span>
						<IconSuscription />
						<span class="text-yellow-500 ml-2">By subscription</span>
					</div>
					<span class="text-gray-550">List of product details, separated by comma.</span>
				</div>
			</div>
			<span class="grow" />
			<div class="flex gap-10">
				<a href="/" class="underline text-blue-800">Give away a copy</a>
				<div class="flex gap-2">
					<IconDownload />
					<a href="/" class="text-gray-550">Download</a>
				</div>
			</div>
		</div>
		<hr class="border-gray-300 my-4 w-full" />
		<div class="w-full flex items-center gap-6 px-6 grow">
			<div class="flex gap-4">
				<img
					class="h-[80px] w-[70px]"
					src="https://labookinerie.com/picture/raw/my-cabinet-3-S79ZEz/format/100"
					alt="My cabinet 2"
				/>
				<div class="flex flex-col gap-2 max-w-3xl">
					<span class="grow text-2xl">Joel + Ellie Wallpaper!</span>
					<div class="flex items-center">
						<div class="w-2 h-2 m-2 bg-blue-200 rounded-full" />
						<span class="text-gray-550 mr-4">Wallet B</span>
					</div>
					<span class="text-gray-550"
						>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
						consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</span
					>
				</div>
			</div>
			<span class="grow" />
			<div class="flex gap-10">
				<a href="/" class="underline text-blue-800">Give away a copy</a>
				<div class="flex gap-2">
					<IconDownload />
					<a href="/" class="text-gray-550">Download</a>
				</div>
			</div>
		</div>
		<hr class="border-gray-300 my-4 w-full" />
		<div class="w-full flex items-center gap-6 px-6 grow">
			<div class="flex gap-4">
				<img
					class="h-[80px] w-[70px]"
					src="https://labookinerie.com/picture/raw/my-cabinet-2-xDvRi8/format/100"
					alt="My cabinet 3"
				/>
				<div class="flex flex-col gap-2 max-w-3xl">
					<span class="grow text-2xl">FEBRUARY PNG PACK!</span>
					<div class="flex items-center">
						<div class="w-2 h-2 m-2 bg-purple-500 rounded-full" />
						<span class="text-gray-550 mr-4">Wallet C</span>
						<IconSuscription />
						<span class="text-yellow-500 ml-2">By subscription</span>
					</div>
					<span class="text-gray-550"
						>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
						consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</span
					>
				</div>
			</div>
			<span class="grow" />
			<div class="flex gap-10">
				<a href="/" class="underline text-blue-800">Give away a copy</a>
				<div class="flex gap-2">
					<IconDownload />
					<a href="/" class="text-gray-550">Download</a>
				</div>
			</div>
		</div>
		<hr class="border-gray-300 my-4 w-full" />
		<div class="w-full flex items-center gap-6 px-6 grow">
			<div class="flex gap-4">
				<img
					class="h-[80px] w-[70px]"
					src="https://labookinerie.com/picture/raw/my-cabinet-1-j0nzXL/format/100"
					alt="My Cabinet 1"
				/>
				<div class="flex flex-col gap-2">
					<span class="grow text-2xl">Procreate Brushes Set</span>
					<div class="flex items-center">
						<div class="w-2 h-2 m-2 bg-green-500 rounded-full" />
						<span class="text-gray-550 mr-4">Wallet A</span>
						<IconSuscription />
						<span class="text-yellow-500 ml-2">By subscription</span>
					</div>
					<span class="text-gray-550">List of product details, separated by comma.</span>
				</div>
			</div>
			<span class="grow" />
			<div class="flex gap-10">
				<a href="/" class="underline text-blue-800">Give away a copy</a>
				<div class="flex gap-2">
					<IconDownload />
					<a href="/" class="text-gray-550">Download</a>
				</div>
			</div>
		</div>
		<hr class="border-gray-300 my-4 w-full" />
		<div class="w-full flex items-center gap-6 px-6 grow">
			<div class="flex gap-4">
				<img
					class="h-[80px] w-[70px]"
					src="https://labookinerie.com/picture/raw/my-cabinet-3-S79ZEz/format/100"
					alt="My cabinet 2"
				/>
				<div class="flex flex-col gap-2 max-w-3xl">
					<span class="grow text-2xl">Joel + Ellie Wallpaper!</span>
					<div class="flex items-center">
						<div class="w-2 h-2 m-2 bg-blue-200 rounded-full" />
						<span class="text-gray-550 mr-4">Wallet B</span>
					</div>
					<span class="text-gray-550"
						>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
						consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</span
					>
				</div>
			</div>
			<span class="grow" />
			<div class="flex gap-10">
				<a href="/" class="underline text-blue-800">Give away a copy</a>
				<div class="flex gap-2">
					<IconDownload />
					<a href="/" class="text-gray-550">Download</a>
				</div>
			</div>
		</div>
		<hr class="border-gray-300 my-4 w-full" />
		<div class="w-full flex items-center gap-6 px-6 grow">
			<div class="flex gap-4">
				<img
					class="h-[80px] w-[70px]"
					src="https://labookinerie.com/picture/raw/my-cabinet-2-xDvRi8/format/100"
					alt="My cabinet 3"
				/>
				<div class="flex flex-col gap-2 max-w-3xl">
					<span class="grow text-2xl">FEBRUARY PNG PACK!</span>
					<div class="flex items-center">
						<div class="w-2 h-2 m-2 bg-purple-500 rounded-full" />
						<span class="text-gray-550 mr-4">Wallet C</span>
						<IconSuscription />
						<span class="text-yellow-500 ml-2">By subscription</span>
					</div>
					<span class="text-gray-550"
						>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
						consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</span
					>
				</div>
			</div>
			<span class="grow" />
			<div class="flex gap-10">
				<a href="/" class="underline text-blue-800">Give away a copy</a>
				<div class="flex gap-2">
					<IconDownload />
					<a href="/" class="text-gray-550">Download</a>
				</div>
			</div>
		</div>

		<hr class="border-gray-300 my-4 w-full" />

		<nav>
			<ul class="list-style-none flex">
				<li>
					<a
						class="pointer-events-none relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-500 transition-all duration-300 dark:text-neutral-400"
						href="#!">&lt;</a
					>
				</li>
				<li>
					<a
						class="pointer-events-none relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-500 transition-all duration-300 dark:text-neutral-400"
						href="#!">&lt;&lt;</a
					>
				</li>
				<li>
					<a
						class="relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
						href="#!">1</a
					>
				</li>
				<li aria-current="page">
					<a
						class="relative block rounded-full bg-gray-300 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all duration-300"
						href="#!"
						>2
						<span
							class="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
							>(current)</span
						>
					</a>
				</li>
				<li>
					<a
						class="relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
						href="#!">3</a
					>
				</li>
				<li>
					<a
						class="relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
						href="#!">&gt;&gt;</a
					>
				</li>
				<li>
					<a
						class="relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
						href="#!">&gt;</a
					>
				</li>
			</ul>
		</nav>
	</div>
</div>

<style>
	.text-yellow-500 {
		color: #e4c315;
	}
	.text-blue-800 {
		color: #2271b1;
	}
	.bg-purple-500 {
		background-color: #704aa0;
	}
</style>
