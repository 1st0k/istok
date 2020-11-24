import { SourcesSequence, ResourceListFilter, isGetListResultSuccess, isGetSetResultSuccess } from '@istok/core';
import { Identifiable } from '@istok/utils';

export { idToLocale, idToSlug, LocalizedBlogParams, idToPathParams, paramsToId } from './LocalizedBlog';

export type IdToParams<P extends object> = (id: string) => P;
export type ParamsToId<P extends object> = (params: P) => string;

export interface BlogOptions<P extends object> {
  idToParams: IdToParams<P>;
  paramsToId: ParamsToId<P>;
}

export type PostsListFilter = ResourceListFilter;

export const allPostsFilter: PostsListFilter = () => true;

export type PostsIds = Identifiable<string>[];

export class Blog<P extends object> {
  public idToParams!: IdToParams<P>;
  public paramsToId!: ParamsToId<P>;

  constructor(public sources: SourcesSequence<string, string>, options: BlogOptions<P>) {
    this.idToParams = options.idToParams;
  }

  async getPost(id: string) {
    const data = await this.sources.get(id);

    if (!isGetSetResultSuccess(data)) {
      throw new Error(`Failed to get post "${id}".`);
    }

    return data.resource;
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

    const data = await Promise.all(ids.map(id => this.getPost(id)));

    return data;
  }

  getPostsParams(postsIds: PostsIds) {
    return postsIds.map(p => p.id).map(this.idToParams);
  }
}
