import type { ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types';
import { Panel } from '@/components/panel';
import { nodeText, slugifyHeading } from '@/lib/toc';

export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      id={slugifyHeading(nodeText(children))}
      className="mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: (props) => <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground" {...props} />,
  p: (props) => <p className="mt-6 text-lg leading-relaxed text-muted" {...props} />,
  a: ({ href = "", ...props }) => {
    const isExternal = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        className="text-accent underline underline-offset-4 hover:opacity-80"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      />
    );
  },
  code: (props) => (
    <code
      className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-accent in-[pre]:rounded-none in-[pre]:bg-transparent in-[pre]:px-0 in-[pre]:py-0 in-[pre]:text-foreground"
      {...props}
    />
  ),
  // Plain fenced blocks (no language, e.g. ASCII diagrams) come through as a
  // literal <pre> untouched by rehype-pretty-code, so they keep the original
  // Panel-boxed look. A labeled block (```ts, ```sql, ...) gets highlighted
  // and carries a `data-language` attribute on this same tag; the Panel/card
  // chrome for those moves to the `figure` override below instead, so a
  // highlighted block isn't double-boxed.
  pre: ({
    "data-language": dataLanguage,
    children,
    ...props
  }: ComponentProps<"pre"> & { "data-language"?: string }) =>
    dataLanguage ? (
      <pre className="overflow-x-auto font-mono text-sm" data-language={dataLanguage} {...props}>
        {children}
      </pre>
    ) : (
      <Panel as="pre" className="mt-6 overflow-x-auto font-mono text-sm text-foreground" {...props}>
        {children}
      </Panel>
    ),
  // rehype-pretty-code renames a highlighted code fence's own <pre> to
  // <figure data-rehype-pretty-code-figure>, wrapping a fresh <pre><code>
  // pair inside it — this is the element that now needs the Panel treatment.
  figure: ({
    "data-rehype-pretty-code-figure": isHighlighted,
    children,
    ...props
  }: ComponentProps<"figure"> & { "data-rehype-pretty-code-figure"?: string }) =>
    isHighlighted !== undefined ? (
      <Panel
        as="figure"
        data-rehype-pretty-code-figure={isHighlighted}
        className="mt-6 overflow-x-auto font-mono text-sm"
        {...props}
      >
        {children}
      </Panel>
    ) : (
      <figure {...props}>{children}</figure>
    ),
  ul: (props) => <ul className="mt-6 ml-6 list-disc space-y-2 text-lg text-muted" {...props} />,
  ol: (props) => <ol className="mt-6 ml-6 list-decimal space-y-2 text-lg text-muted" {...props} />,
  blockquote: (props) => <blockquote className="mt-6 border-l-2 border-accent/40 pl-4 text-lg italic text-muted" {...props} />,
  img: ({ alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className="mt-6 w-full rounded-2xl border border-border"
      loading="lazy"
      {...props}
    />
  ),
  // GFM tables (remark-gfm) render as plain unstyled HTML by default, so give
  // them the site's own borders/surface tokens instead.
  table: (props) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-surface" {...props} />,
  th: (props) => (
    <th className="border-b border-border px-4 py-2 font-semibold text-foreground" {...props} />
  ),
  td: (props) => <td className="border-b border-border px-4 py-2 text-muted" {...props} />,
};
