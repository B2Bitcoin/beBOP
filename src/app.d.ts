// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />

import type { Role } from '$lib/types/Role';
import type { ObjectId } from 'mongodb';

declare global {
	namespace App {
		interface Error {
			status?: number;
		}
		interface Locals {
			status?: number;
			sessionId: string;
			countryCode?: string;
			user?: { _id: ObjectId; login: string; roleId: string; role?: Role };
			email?: string;
			npub?: string;
			sso?: Array<{
				provider: string;
				email?: string;
				avatarUrl?: string;
				name: string;
				id: string;
			}>;
			clientIp?: string;
			language: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
