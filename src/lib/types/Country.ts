export const COUNTRIES = {
	CHE: 'Switzerland',
	FRA: 'France',
	BEL: 'Belgium'
};

export type CountryAlpha3 = keyof typeof COUNTRIES;

export const COUNTRY_ALPHA3S = Object.keys(COUNTRIES) as [CountryAlpha3, ...CountryAlpha3[]];
