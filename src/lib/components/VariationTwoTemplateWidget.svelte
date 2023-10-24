<script lang="ts">

	let className = '';
	export { className as class };

	$: baseClasses = 'h-[500px]  bg-gray-240 mx-auto flex flex-col gap-4 p-6 rounded ';
</script>

<div class="{baseClasses} {className}">
	<!-- <a href="/product/{product._id}" class="flex w-[50%]">
		<PictureComponent {picture} sizes="800px" class="h-auto w-full object-cover" />
	</a>
	<div class="flex flex-col m-2 text-end w-[50%]">
		<h2 class="text-4xl pb-2 uppercase">{product.name}</h2>
		<h2 class="text-lg pb-2">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat.
		</h2>
		<h2 class="text-md">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor
			sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
			magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in.
		</h2>
		<div class="flex text-centern justify-between pt-2">
			<div class="bg-blue-500 font-semibold text-white text-xl text-center w-[100px] p-1">CTA1</div>
			<div class="bg-blue-500 font-semibold text-white text-xl text-center w-[100px] p-1">CTA2</div>
		</div>
	</div> -->

	<div class="bg-[url(https://imgur.com/rjdvjFT.png)] background-image h-[100%]" />

	<div>
		<h2 class="text-md">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor
			sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
			magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in.
		</h2>
	</div>
</div>

<style>
	.background-image {
		background-size: auto 100%;
		background-repeat: no-repeat;
		background-position: left top;
	}
</style>
