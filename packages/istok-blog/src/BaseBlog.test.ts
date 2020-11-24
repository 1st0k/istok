import { createMemorySource, createSourcesSequence } from '@istok/core';
import { Blog, IdToParams } from './index';
import { idToPathParams, LocalizedBlogParams } from './LocalizedBlog';

const posts = {
  'hello/ru': 'привет',
  'hello/en': 'hi',
};

function setupBaseBlog(posts: Record<string, string>, idToParams: IdToParams<LocalizedBlogParams>) {
  const blog = new Blog(
    createSourcesSequence([
      {
        source: createMemorySource<string>({
          initialResources: posts,
        }),
      },
    ]),
    {
      idToParams,
    }
  );

  return blog;
}

describe(`BaseBlog`, () => {
  it(`should get list of posts with default filter`, async done => {
    const blog = setupBaseBlog(posts, idToPathParams);

    const list = await blog.getPostsList();

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

    const list = await blog.getPostsList();
    const postsData = await blog.getPosts(list);

    expect(postsData).toMatchInlineSnapshot(`
      Array [
        Object {
          "data": "привет",
          "id": "hello/ru",
        },
        Object {
          "data": "hi",
          "id": "hello/en",
        },
      ]
    `);

    done();
  });

  it(`should get params of a post`, async done => {
    const blog = setupBaseBlog(posts, idToPathParams);

    const list = await blog.getPostsList();

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
});
