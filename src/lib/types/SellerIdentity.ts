import type { CountryAlpha2 } from './Country';

export interface SellerIdentity {
	businessName: string;
	vatNumber?: string;

	address: {
		street: string;
		zip: string;
		city: string;
		country: CountryAlpha2;
		state?: string;
	};

	contact: {
		email: string;
		phone?: string;
	};

	bank?: {
		iban: string;
		bic: string;
	};

	invoice?: {
		issuerInfo?: string;
	};
}
