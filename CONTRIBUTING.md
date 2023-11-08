# Contributing

## Localisation

There are json files in `src/lib/translations` for each language. You can add a new language by creating a new file, and adding it to the `src/lib/translations/index.ts` file.

In the svelte page/components, make sure to call `useI18n()` once at top level to set the correct locale for SSR (which can have parallel requests in different locales).
