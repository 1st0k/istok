import matter from 'gray-matter';

import { Post, Blog, BlogParams, PostsIds } from './';

export type MetadataBase<E extends object = {}> = E & {
  date: string;
  title: string;
};

export type PostWithMetadata<E extends object = {}> = {
  content: string;
  metadata: MetadataBase<E>;
};

export type EnhanceMetadata<InlineMetadata extends object, F extends object, GlobalMeta extends object> = (
  fields: F
) => PostWithMetadata<InlineMetadata & F & GlobalMeta>;

export type MetadataPluginContext<
  P extends BlogParams,
  InlineMetadata extends object,
  F extends object,
  GlobalMeta extends object
> = {
  blog: Blog<P, InlineMetadata, F, GlobalMeta>;
};

export type MetadataPluginResult<InlineMetadata extends object, F extends object, GlobalMeta extends object> = {
  getMetadata(
    post: Post,
    context: {
      metadata: PostWithMetadata<InlineMetadata & GlobalMeta>;
      enhanceMetadata: EnhanceMetadata<InlineMetadata, F, GlobalMeta>;
    }
  ): PostWithMetadata<InlineMetadata & F & GlobalMeta>;
  buildGlobalMetadata(postsIds: PostsIds): Promise<Record<string, GlobalMeta>>;
};

export type MetadataPlugin<
  P extends BlogParams,
  InlineMetadata extends object,
  F extends object,
  GlobalMeta extends object
> = (
  ctx: MetadataPluginContext<P, InlineMetadata, F, GlobalMeta>
) => MetadataPluginResult<InlineMetadata, F, GlobalMeta>;

export async function getPostMetadata<InlineMetadata extends object>(
  post: Post
): Promise<PostWithMetadata<InlineMetadata>> {
  const { data: metadata, content } = matter(post.data);

  return {
    metadata: metadata as MetadataBase<InlineMetadata>,
    content,
  };
}
