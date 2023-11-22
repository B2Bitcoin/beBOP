import { SUMUP_API_KEY, SUMUP_CURRENCY, SUMUP_MERCHANT_CODE } from '$env/static/private';
import { CURRENCIES } from '$lib/types/Currency';
import { typedInclude } from '$lib/utils/typedIncludes';

export const isSumupEnabled =
	!!SUMUP_API_KEY &&
	!!SUMUP_MERCHANT_CODE &&
	!!SUMUP_CURRENCY &&
	typedInclude(CURRENCIES, SUMUP_CURRENCY);
