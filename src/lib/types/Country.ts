export const COUNTRIES = {
	CH: 'Switzerland',
	FR: 'France',
	BE: 'Belgium'
};

export type CountryAlpha2 = keyof typeof COUNTRIES;

export const COUNTRY_ALPHA2S = Object.keys(COUNTRIES) as [CountryAlpha2, ...CountryAlpha2[]];
