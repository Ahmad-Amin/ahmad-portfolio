import type { MDXComponents } from 'mdx/types';
import { Panel } from '@/components/panel';

export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-12 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" {...props} />,
  h3: (props) => <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground" {...props} />,
  p: (props) => <p className="mt-6 text-lg leading-relaxed text-muted" {...props} />,
  a: (props) => <a className="text-accent underline underline-offset-4 hover:opacity-80" {...props} />,
  code: (props) => (
    <code
      className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-accent in-[pre]:rounded-none in-[pre]:bg-transparent in-[pre]:px-0 in-[pre]:py-0 in-[pre]:text-foreground"
      {...props}
    />
  ),
  pre: (props) => <Panel as="pre" className="mt-6 overflow-x-auto font-mono text-sm text-foreground" {...props} />,
  ul: (props) => <ul className="mt-6 ml-6 list-disc space-y-2 text-lg text-muted" {...props} />,
  ol: (props) => <ol className="mt-6 ml-6 list-decimal space-y-2 text-lg text-muted" {...props} />,
  blockquote: (props) => <blockquote className="mt-6 border-l-2 border-accent/40 pl-4 text-lg italic text-muted" {...props} />,
};
