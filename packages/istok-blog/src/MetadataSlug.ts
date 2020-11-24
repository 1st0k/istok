import { Blog, BlogParams, Post } from '.';

export const getSlugMetadata = <P extends BlogParams, F extends object>(blog: Blog<P, F>, post: Post) => {
  return blog.idToParams(post.id).params.slug.join('/');
};
