import type { Thing, WithContext } from 'schema-dts';

export type Schema = Thing | WithContext<Thing>;

export function serializeSchema(thing: Schema) {
	return `<script type="application/ld+json">${JSON.stringify(thing)}</script>`;
}
