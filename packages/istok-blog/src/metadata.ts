import matter from 'gray-matter';

import { Post } from './';

export type MetadataBase = {
  date: string;
  title: string;
};

export type PostWithMetadata<M extends MetadataBase = MetadataBase> = {
  content: string;
  metadata: M;
};

export async function getPostMetadata<M extends MetadataBase = MetadataBase>(post: Post): Promise<PostWithMetadata<M>> {
  const { data: metadata, content } = matter(post.data);

  return {
    metadata: metadata as M,
    content,
  };
}
