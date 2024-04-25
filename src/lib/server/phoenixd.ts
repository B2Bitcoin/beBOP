import { runtimeConfig } from './runtime-config';

export const isPhoenixdConfigured = () =>
	runtimeConfig.phoenixd.enabled && !!runtimeConfig.phoenixd.password;
