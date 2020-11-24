import matter from 'gray-matter';

import { Post } from './';

export type MetadataBase<E extends object = {}> = E & {
  date: string;
  title: string;
};

export type PostWithMetadata<E extends object = {}> = {
  content: string;
  metadata: MetadataBase<E>;
};

export async function getPostMetadata<E extends object = {}>(post: Post): Promise<PostWithMetadata<E>> {
  const { data: metadata, content } = matter(post.data);

  return {
    metadata: metadata as MetadataBase<E>,
    content,
  };
}
