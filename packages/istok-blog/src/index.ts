import {
  SourcesSequence,
  ResourceListFilter,
  isGetListResultSuccess,
  isGetSetResultSuccess,
  Resource,
} from '@istok/core';
import { Identifiable } from '@istok/utils';
import { getPostMetadata, PostWithMetadata } from './metadata';

export { idToLocale, idToSlug, LocalizedBlogParams, idToPathParams, paramsToId } from './LocalizedBlog';

export type BlogParamsField = {
  slug: string[];
};

export type BlogParams<P extends object = {}, E extends object = {}> = E & {
  params: BlogParamsField & P;
};

export type IdToParams<P extends BlogParams> = (id: string) => P;
export type ParamsToId<P extends BlogParams> = (params: P) => string;

export type PostsListFilter = ResourceListFilter;

export const allPostsFilter: PostsListFilter = () => true;

export type Post = Resource<string>;
export type PostsIds = Identifiable<string>[];

export interface BlogOptions<P extends BlogParams> {
  idToParams: IdToParams<P>;
  paramsToId: ParamsToId<P>;
}

export class Blog<P extends BlogParams> {
  public idToParams!: IdToParams<P>;
  public paramsToId!: ParamsToId<P>;

  constructor(public sources: SourcesSequence<string, string>, options: BlogOptions<P>) {
    this.idToParams = options.idToParams;
  }

  async getPost(id: string) {
    const post = await this.sources.get(id);

    if (!isGetSetResultSuccess(post)) {
      throw new Error(`Failed to get post "${id}".`);
    }

    return post.resource;
  }

  async getPostsList(filter: PostsListFilter = allPostsFilter): Promise<PostsIds> {
    const list = await this.sources.getList(filter);

    if (!isGetListResultSuccess(list)) {
      throw new Error('Failed to get list of posts.');
    }

    return list.resources;
  }

  async getPosts(postsIds: PostsIds, filter: PostsListFilter = allPostsFilter) {
    const ids = postsIds.map(post => post.id).filter(filter);

    const resource = await Promise.all(ids.map(id => this.getPost(id)));

    return resource;
  }

  getPostsParams(postsIds: PostsIds) {
    return postsIds.map(p => p.id).map(this.idToParams);
  }

  async getPostMetadata(post: Post): Promise<PostWithMetadata & { slug: string }> {
    const metadata = await getPostMetadata(post);

    return {
      ...metadata,
      slug: this.idToParams(post.id).params.slug.join('/'),
    };
  }
}
