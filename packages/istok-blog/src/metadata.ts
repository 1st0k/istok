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

export type EnhanceMetadata<InlineMetadata extends object, F extends object> = (
  fields: F
) => PostWithMetadata<InlineMetadata & F>;

export type MetadataPluginContext<P extends BlogParams, InlineMetadata extends object, F extends object> = {
  blog: Blog<P, InlineMetadata, F>;
};

export type MetadataPluginResult<InlineMetadata extends object, F extends object> = {
  getMetadata(
    post: Post,
    { metadata }: { metadata: PostWithMetadata; enhanceMetadata: EnhanceMetadata<InlineMetadata, F> }
  ): PostWithMetadata<InlineMetadata & F>;
};

export type MetadataPlugin<P extends BlogParams, InlineMetadata extends object, F extends object> = (
  ctx: MetadataPluginContext<P, InlineMetadata, F>
) => MetadataPluginResult<InlineMetadata, F>;

export async function getPostMetadata<InlineMetadata extends object>(
  post: Post
): Promise<PostWithMetadata<InlineMetadata>> {
  const { data: metadata, content } = matter(post.data);

  return {
    metadata: metadata as MetadataBase<InlineMetadata>,
    content,
  };
}
