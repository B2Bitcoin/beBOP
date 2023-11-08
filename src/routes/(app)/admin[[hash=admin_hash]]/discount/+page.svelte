<script lang="ts">
	export let data;
</script>

<a href="{data.adminPrefix}/discount/new" class="underline block">Add discount</a>

<h1 class="text-3xl">List of discount</h1>
<ul>
	{#each data.discounts as discount}
		<li>
			<a href="{data.adminPrefix}/discount/{discount._id}" class="underline text-blue">
				{discount.name}
			</a>
			- <span class="text-gray-550">[Discount={discount._id}]</span>
		</li>
	{:else}
		No discounts yet
	{/each}
</ul>
