import { Source, Entity, QueryParams, Identifiable } from '@istok/core';
import { MetadataBase, getPostMetadata, MetadataPlugin, MetadataPluginResult, PostWithMetadata } from './metadata';
import { getSlugMetadata } from './MetadataSlug';

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

export type PostListQueryParams = QueryParams;

export const allPostsFilter: PostListQueryParams = {
  limit: 0,
  offset: 0,
  filter() {
    return true;
  },
};

export type Post = Entity<string>;
export type PostsIds = Identifiable[];

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
  posts: Source<string>;
  internal: Source<string>;
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

    if (post.kind === 'Error') {
      throw new Error(`Failed to get post "${id}".`);
    }

    return post.data;
  }

  async getPostsList(params: PostListQueryParams): Promise<PostsIds> {
    const list = await this.sources.posts.query(params);

    if (list.kind === 'Error') {
      throw new Error('Failed to get list of posts.');
    }

    return list.data;
  }

  async getPosts(postsIds: PostsIds, params: PostListQueryParams = allPostsFilter) {
    const ids = postsIds.map(post => post.id).filter(params.filter ?? Boolean);

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

  async getActualGlobalMeta(currentPostId: string): Promise<GlobalMeta> {
    const getListResult = await this.sources.internal.get('list');
    const currentPostSlug = getSlugMetadata(this, currentPostId);

    if (getListResult.kind === 'Success') {
      try {
        const data = JSON.parse(getListResult.data.entity);
        if (data.invalidated === false) {
          return data.posts[currentPostSlug];
        }
      } catch (e) {}
    }

    const postsList = await this.getPostsList({});

    const meta = await this.metadataPlugin.buildGlobalMetadata(postsList);

    await this.sources.internal.set('list', JSON.stringify({ invalidated: false, posts: meta }));

    return meta[currentPostSlug];
  }

  getPostsMetadata = async (posts: Post[]) => {
    const postsMetadataPromises = posts.map(post => this.getPostMetadata(post));
    return Promise.all(postsMetadataPromises);
  };
}
