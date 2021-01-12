import { Blog, BlogParams } from '.';

export const getSlugMetadata = <
  P extends BlogParams,
  InlineMetadata extends object,
  F extends object,
  GlobalMeta extends object
>(
  blog: Blog<P, InlineMetadata, F, GlobalMeta>,
  postId: string
): string => {
  return blog.idToParams(postId).params.slug.join('/');
};
