/*
  Localized blog id scheme: 

  slug/parts/locale(.ext)

  1. locale is the last part of id separated from slug with '/'.
  2. slug is the all parts except the last one.
*/

import { IdToParams } from './';

export type LocalizedBlogParams = {
  params: {
    slug: string[];
  };
  locale: string;
};

export function idToLocale(id: string) {
  const parts = id.split('/');
  const [locale] = parts[parts.length - 1].split('.');

  if (!locale) {
    throw new Error(`Failed to determine locale of post "${id}".`);
  }

  return locale;
}

export function idToSlug(id: string) {
  const allParts = id.split('/');
  const slug = allParts.slice(0, allParts.length - 1);
  if (slug.length === 0) {
    throw new Error(`Failed to determine slug of post "${id}".`);
  }

  return slug;
}

export const paramsToId = (extension: string) => ({ params, locale }: LocalizedBlogParams): string => {
  return params.slug.join('/') + '/' + locale + extension;
};

export const idToPathParams: IdToParams<LocalizedBlogParams> = id => {
  return {
    params: {
      slug: idToSlug(id),
    },
    locale: idToLocale(id),
  };
};
