import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Components } from "react-markdown";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

import { Element } from "hast";

interface CodeProps {
  node?: Element;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeProps> = ({
  inline,
  className,
  children,
  ...props
}) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1];

  if (!inline && language) {
    return (
      <SyntaxHighlighter
        {...props}
        style={atomDark}
        language={language}
        PreTag="div"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    );
  }

  return (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

const components: Components = {
  // @ts-expect-error - `code` is not a valid React component
  code: CodeBlock,
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};
