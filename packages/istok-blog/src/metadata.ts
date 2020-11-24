import matter from 'gray-matter';

import { Post, Blog, BlogParams } from './';

export type MetadataBase<E extends object = {}> = E & {
  date: string;
  title: string;
};

export type PostWithMetadata<E extends object = {}> = {
  content: string;
  metadata: MetadataBase<E>;
};

export type EnhanceMetadata<F extends object> = (fields: F) => PostWithMetadata<F>;

export type MetadataPluginContext<P extends BlogParams, F extends object> = {
  blog: Blog<P, F>;
};

export type MetadataPluginResult<F extends object> = {
  getMetadata(
    post: Post,
    { metadata }: { metadata: PostWithMetadata; enhanceMetadata: EnhanceMetadata<F> }
  ): PostWithMetadata<F>;
};

export type MetadataPlugin<P extends BlogParams, F extends object> = (
  ctx: MetadataPluginContext<P, F>
) => MetadataPluginResult<F>;

export async function getPostMetadata<E extends object = {}>(post: Post): Promise<PostWithMetadata<E>> {
  const { data: metadata, content } = matter(post.data);

  return {
    metadata: metadata as MetadataBase<E>,
    content,
  };
}
