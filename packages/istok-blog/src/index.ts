import { ResourceListFilter, isGetListResultSuccess, isGetSetResultSuccess, Resource, Source } from '@istok/core';
import { Identifiable } from '@istok/utils';
import { MetadataBase, getPostMetadata, MetadataPlugin, MetadataPluginResult, PostWithMetadata } from './metadata';

export {
  makeAllLocalesMetadataResolver,
  localeFilter,
  idToLocale,
  idToSlug,
  LocalizedBlogParams,
  idToPathParams,
  paramsToId,
} from './LocalizedBlog';

export { getSlugMetadata } from './MetadataSlug';
export { MetadataBase };

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

export interface BlogOptions<
  P extends BlogParams,
  InlineMetadata extends object,
  F extends object,
  GlobalMeta extends object
> {
  idToParams: IdToParams<P>;
  paramsToId: ParamsToId<P>;
  metadata: MetadataPlugin<P, InlineMetadata, F, GlobalMeta>;
}

export interface BlogSources {
  posts: Source<string, string>;
  internal: Source<string, string>;
}

export class Blog<P extends BlogParams, InlineMetadata extends object, F extends object, GlobalMeta extends object> {
  public idToParams!: IdToParams<P>;
  public paramsToId!: ParamsToId<P>;

  private metadataPlugin!: MetadataPluginResult<InlineMetadata, F, GlobalMeta>;

  constructor(public sources: BlogSources, options: BlogOptions<P, InlineMetadata, F, GlobalMeta>) {
    this.idToParams = options.idToParams;

    this.metadataPlugin = options.metadata({
      blog: this,
    });
  }

  private async fetchPostMetadata(post: Post) {
    const metadata = await getPostMetadata<InlineMetadata>(post);
    return metadata;
  }

  private enhanceMetadata(postWithMetadata: PostWithMetadata<InlineMetadata & GlobalMeta>, fields: F) {
    return {
      ...postWithMetadata,
      metadata: {
        ...postWithMetadata.metadata,
        ...fields,
      },
    };
  }

  async getPost(id: string) {
    const post = await this.sources.posts.get(id);

    if (!isGetSetResultSuccess(post)) {
      throw new Error(`Failed to get post "${id}".`);
    }

    return post.resource;
  }

  async getPostsList(filter: PostsListFilter = allPostsFilter): Promise<PostsIds> {
    const list = await this.sources.posts.getList(filter);

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

  getPostMetadata = async (post: Post): Promise<PostWithMetadata<InlineMetadata & F & GlobalMeta>> => {
    const { metadata: inlineMetadata, content } = await this.fetchPostMetadata(post);
    const globalMetadata: GlobalMeta = await this.getActualGlobalMeta(post.id);

    const metadata = {
      metadata: {
        ...inlineMetadata,
        ...globalMetadata,
      },
      content,
    };

    const enhanceMetadata = (fields: F) => this.enhanceMetadata(metadata, fields);

    return this.metadataPlugin.getMetadata(post, {
      metadata,
      enhanceMetadata,
    });
  };

  async getActualGlobalMeta(currentPostId: string) {
    const getListResult = await this.sources.internal.get('list');
    const currentPostSlug = this.idToParams(currentPostId).params.slug.join('/');

    let needRebuildMeta = false;

    if (!isGetSetResultSuccess(getListResult)) {
      needRebuildMeta = true;
    } else {
      const data = JSON.parse(getListResult.resource.data as string);
      if (data.invalidated) {
        needRebuildMeta = true;
      } else {
        return data.posts[currentPostSlug];
      }
    }

    if (needRebuildMeta) {
      const postsList = await this.getPostsList();

      const meta = await this.metadataPlugin.buildGlobalMetadata(postsList);

      await this.sources.internal.set('list', JSON.stringify({ invalidated: false, posts: meta }));

      return meta[currentPostSlug];
    }
  }

  getPostsMetadata = async (posts: Post[]) => {
    const postsMetadataPromises = posts.map(post => this.getPostMetadata(post));
    return Promise.all(postsMetadataPromises);
  };
}
