import { runtimeConfig } from './runtime-config';

export function adminPrefix(): string {
	return runtimeConfig.adminHash ? `/admin-${runtimeConfig.adminHash}` : '/admin';
}
