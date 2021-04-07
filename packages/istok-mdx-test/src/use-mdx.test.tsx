import React from 'react';

import { render } from '@testing-library/react';
import { render as renderMdx } from '@istok/mdx-compile';

import { RenderMdx } from './RenderMdx';

const source = `
# header

<div>{value}</div>
`;

const scope = {
  value: 420,
};

test('should use mdx', async done => {
  const { compiledSource, contentHtml } = await renderMdx(source, { scope });
  const { getByText } = render(<RenderMdx source={compiledSource} params={{ contentHtml, scope }} />);

  setTimeout(() => {
    expect(getByText('420')).toBeInTheDocument();
    done();
  }, 1);
});
