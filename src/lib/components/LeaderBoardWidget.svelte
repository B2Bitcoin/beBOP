<script lang="ts">
	import GoalProgress from './GoalProgress.svelte';
	import PriceTag from './PriceTag.svelte';
	import { useI18n } from '$lib/i18n';
	import Trans from './Trans.svelte';
	import type { Leaderboard } from '$lib/types/Leaderboard';
	import type { Product } from '$lib/types/Product';
	import type { Picture } from '$lib/types/Picture.ts';
	import { groupBy } from 'lodash-es';
	import type { SetRequired } from 'type-fest';
	import PictureComponent from './Picture.svelte';

	let className = '';
	export { className as class };
	export let leaderboard: Pick<
		Leaderboard,
		'_id' | 'name' | 'progress' | 'endsAt' | 'mode' | 'beginsAt'
	>;
	export let products: Pick<Product, '_id' | 'name' | 'shortDescription'>[];
	export let pictures: Picture[];
	const { t, locale } = useI18n();
	$: productById = Object.fromEntries(products.map((product) => [product._id, product]));
	$: picturesByProduct = groupBy(
		pictures.filter((picture): picture is SetRequired<Picture, 'productId'> => !!picture.productId),
		'productId'
	);
</script>

{#each leaderboard.progress as progress}
	<div class="rounded p-4 flex flex-col {className}">
		<div class="flex justify-between items-center">
			<div class="flex flex-row gap-4">
				<PictureComponent
					picture={picturesByProduct[productById[progress.product]._id][0]}
					class="my-5 w-[90px] h-[90px]"
				/>
				<div class="flex flex-col gap-4">
					<h3 class="font-medium text-[22px] body-title">
						{productById[progress.product].name}
					</h3>

					{productById[progress.product].shortDescription}
				</div>
			</div>
			<span class="text-base font-light body-secondaryText"
				>{#if leaderboard.beginsAt > new Date()}
					{t('challenge.beginsAt', {
						days: Math.floor(
							(leaderboard.beginsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
						)
					})}
				{:else if leaderboard.endsAt < new Date()}
					{t('challenge.ended')}
				{:else}
					<Trans key="challenge.endsAt">
						<time
							datetime={leaderboard.endsAt.toJSON()}
							slot="0"
							title={leaderboard.endsAt.toLocaleString($locale)}
						>
							{leaderboard.endsAt.toLocaleDateString($locale)}
						</time>
						<time
							datetime={leaderboard.endsAt.toJSON()}
							slot="1"
							title={leaderboard.endsAt.toLocaleString($locale)}
						>
							{leaderboard.endsAt.toLocaleTimeString($locale, {
								minute: '2-digit',
								hour: '2-digit'
							})}
						</time>
					</Trans>
				{/if}
			</span>
		</div>
		<GoalProgress
			class="font-bold mt-3 body-title"
			text={leaderboard.mode === 'moneyAmount'
				? Number(Math.max(0, progress.amount))
						.toLocaleString($locale, {
							style: 'currency',
							currency: progress.currency,
							minimumFractionDigits: 0
						})
						.toString()
				: Math.max(progress.amount, 0).toString()}
			goal={1000}
			progress={progress.amount}
		/>
		<div class="flex justify-between mt-1 items-right">
			<!-- <a href="/" class="body-hyperlink underline">How can I contribute?</a> -->
			<p />
			{#if progress.amount === 1000}
				<p>{t('challenge.goalMet')}</p>
			{:else if progress.amount > 1000 && leaderboard.mode === 'moneyAmount' && progress.currency}
				<div class="flex flex-row body-secondaryText gap-1">
					<Trans key="challenge.moneyAmount.goalOvershot">
						<PriceTag
							amount={progress.amount}
							class="text-gray-800 text-base"
							currency={progress.currency}
							main
							slot="0"
						/>
						<PriceTag
							amount={1000}
							class="text-gray-800 text-base"
							currency={progress.currency}
							main
							slot="1"
						/>
					</Trans>
				</div>
			{:else if progress.amount > 1000 && !progress.currency}
				<div class="flex flex-row body-secondaryText gap-1">
					{t('challenge.totalProducts.goalOvershot', {
						progress: progress.amount.toLocaleString($locale),
						goal: 1000
					})}
				</div>
			{:else if progress.currency}
				<PriceTag amount={1000} class="text-gray-800 text-base" currency={progress.currency} main />
			{:else}
				{t('challenge.numProducts', { count: 1000 })}
			{/if}
		</div>
	</div>
{/each}
