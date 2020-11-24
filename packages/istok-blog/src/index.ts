import {
  SourcesSequence,
  ResourceListFilter,
  isGetListResultSuccess,
  isGetSetResultSuccess,
  Resource,
} from '@istok/core';
import { Identifiable } from '@istok/utils';
import { getPostMetadata, MetadataPlugin, MetadataPluginResult, PostWithMetadata } from './metadata';

export { idToLocale, idToSlug, LocalizedBlogParams, idToPathParams, paramsToId } from './LocalizedBlog';

export { getSlugMetadata } from './MetadataSlug';

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

export interface BlogOptions<P extends BlogParams, F extends object> {
  idToParams: IdToParams<P>;
  paramsToId: ParamsToId<P>;
  metadata: MetadataPlugin<P, F>;
}

export class Blog<P extends BlogParams, F extends object> {
  public idToParams!: IdToParams<P>;
  public paramsToId!: ParamsToId<P>;

  private metadataPlugin!: MetadataPluginResult<F>;

  constructor(public sources: SourcesSequence<string, string>, options: BlogOptions<P, F>) {
    this.idToParams = options.idToParams;

    this.metadataPlugin = options.metadata({
      blog: this,
    });
  }

  private async fetchPostMetadata(post: Post) {
    const metadata = await getPostMetadata<PostWithMetadata<F>>(post);
    return metadata;
  }

  private enhanceMetadata(postWithMetadata: PostWithMetadata, fields: F) {
    return {
      ...postWithMetadata,
      metadata: {
        ...postWithMetadata.metadata,
        ...fields,
      },
    };
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

  async getPostMetadata(post: Post): Promise<PostWithMetadata<F>> {
    const metadata = await this.fetchPostMetadata(post);

    const enhanceMetadata = (fields: F): PostWithMetadata<F> => this.enhanceMetadata(metadata, fields);

    return this.metadataPlugin.getMetadata(post, {
      metadata,
      enhanceMetadata,
    });
  }
}
