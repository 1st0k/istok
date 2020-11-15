// import pluginTester from 'babel-plugin-tester';
import { transformAsync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';

import createBabelPluginIstokResource from './babel-plugin-istok-resource';

// pluginTester({
//   plugin: BabelPluginExuperyResource,
//   tests: [
//     {
//       code:
//         '<img src="https://firebasestorage.googleapis.com/v0/b/snov-e63cb.appspot.com/o/snov-digital-blog-media%2Fpretty%20face%20))).jpg?alt=media" width="512" heiht="512" />',
//     },
//   ],
// });

const code = '<img data-istok-resource="pretty%20face%20)))" width={512} height={512} />';

it('should replace data-istok-source with src on img tag', async done => {
  const result = await transformAsync(code, {
    presets: [presetReact, presetEnv],
    plugins: [
      createBabelPluginIstokResource({
        resourceToURL: x => `https://cdn.com/${x}.jpg`,
      }),
    ],
    configFile: false,
  });

  expect(result).toBeTruthy();
  expect(result?.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    /*#__PURE__*/
    React.createElement(\\"img\\", {
      \\"data-istok-resource\\": \\"pretty%20face%20)))\\",
      width: 512,
      height: 512,
      src: \\"https://cdn.com/pretty%20face%20))).jpg\\"
    });"
  `);

  done();
});
