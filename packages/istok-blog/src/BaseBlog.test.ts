import { createMemorySource } from '@istok/core';
import { Blog, IdToParams } from './index';
import { idToPathParams, LocalizedBlogParams, makeAllLocalesMetadataResolver, paramsToId } from './LocalizedBlog';
import { getSlugMetadata } from './MetadataSlug';

const posts = {
  'hello/ru': 'привет',
  'hello/en': 'hi',
};

function setupBaseBlog<T extends object = {}>(
  posts: Record<string, string>,
  idToParams: IdToParams<LocalizedBlogParams>
) {
  const blog = new Blog<LocalizedBlogParams, T, { slug: string }, { allLocales: string[] }>(
    {
      posts: createMemorySource<string>({
        initialResources: posts,
      }),
      internal: createMemorySource<string>(),
    },
    {
      metadata: ({ blog }) => {
        return {
          buildGlobalMetadata: makeAllLocalesMetadataResolver(blog),
          getMetadata(post, { enhanceMetadata }) {
            const enhancedMetadata = enhanceMetadata({
              slug: getSlugMetadata(blog, post.id),
            });

            return enhancedMetadata;
          },
        };
      },
      idToParams,
      paramsToId: paramsToId(''),
    }
  );

  return blog;
}

describe(`BaseBlog`, () => {
  it(`should get list of posts with default filter`, async done => {
    const blog = setupBaseBlog(posts, idToPathParams);

    const list = await blog.getPostsList({});

    expect(list).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": "hello/ru",
        },
        Object {
          "id": "hello/en",
        },
      ]
    `);

    done();
  });

  it(`should get posts data`, async done => {
    const blog = setupBaseBlog(posts, idToPathParams);

    const list = await blog.getPostsList({});
    const postsData = await blog.getPosts(list);

    expect(postsData).toMatchInlineSnapshot(`
      Array [
        Object {
          "entity": "привет",
          "id": "hello/ru",
        },
        Object {
          "entity": "hi",
          "id": "hello/en",
        },
      ]
    `);

    done();
  });

  it(`should get params of a post`, async done => {
    const blog = setupBaseBlog(posts, idToPathParams);

    const list = await blog.getPostsList({});

    const params = blog.getPostsParams(list);

    expect(params).toMatchInlineSnapshot(`
      Array [
        Object {
          "locale": "ru",
          "params": Object {
            "slug": Array [
              "hello",
            ],
          },
        },
        Object {
          "locale": "en",
          "params": Object {
            "slug": Array [
              "hello",
            ],
          },
        },
      ]
    `);

    done();
  });

  it(`should get post metadata`, async done => {
    const blog = setupBaseBlog(posts, idToPathParams);

    const post = await blog.getPost('hello/ru');
    const metadata = await blog.getPostMetadata(post);

    expect(metadata).toMatchInlineSnapshot(`
      Object {
        "content": "привет",
        "metadata": Object {
          "allLocales": Array [
            "ru",
            "en",
          ],
          "slug": "hello",
        },
      }
    `);

    done();
  });
});
