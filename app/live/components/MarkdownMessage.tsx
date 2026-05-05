"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        p: ({ children }) => (
          <p className="text-[15px] text-white/90 leading-relaxed mb-3 last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-white/80">{children}</em>
        ),
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-white mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-white mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-white/90 mt-3 mb-1.5">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-white/90">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-white/90">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-[15px] text-white/90 leading-relaxed">{children}</li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00E0FF] hover:text-[#7A2CFF] underline underline-offset-2 transition-colors"
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[#FF3CAC] text-[13px] font-mono">
                {children}
              </code>
            );
          }
          return (
            <pre className="p-3 rounded-xl bg-[#0B0B16] border border-white/[0.06] overflow-x-auto mb-3">
              <code className="text-[13px] font-mono text-white/80 leading-relaxed">
                {children}
              </code>
            </pre>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#7A2CFF] pl-3 py-1 my-3 bg-white/[0.02] rounded-r-lg">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-white/[0.08] my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
