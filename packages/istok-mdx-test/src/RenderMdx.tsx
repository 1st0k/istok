import React from 'react';
import { useMdx, HydrationParams } from '@istok/mdx-runtime';

interface RenderMdxProps {
  source: string;
  params: HydrationParams<any>;
}

export function RenderMdx({ source, params }: RenderMdxProps) {
  const renderedMdx = useMdx(source, params, { element: 'div' });
  return <div>{renderedMdx}</div>;
}
