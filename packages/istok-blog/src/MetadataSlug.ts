import { Blog, BlogParams, Post } from '.';

export const getSlugMetadata = <
  P extends BlogParams,
  InlineMetadata extends object,
  F extends object,
  GlobalMeta extends object
>(
  blog: Blog<P, InlineMetadata, F, GlobalMeta>,
  post: Post
) => {
  return blog.idToParams(post.id).params.slug.join('/');
};
