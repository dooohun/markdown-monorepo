import { useState } from 'react';
import { Markdown } from '@markdown/core';
import { useTheme } from './hooks';

const INITIAL_MARKDOWN = `# Markdown Editor

This is a **bold** text and this is *italic* text.

## Code Examples

Inline code: \`console.log('Hello')\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Lists

- Item 1
- Item 2
- Item 3

## Blockquote

> This is a blockquote.
> It can span multiple lines.

## Links & Images

[Visit GitHub](https://github.com)

---

That's all for now!
`;

export default function App() {
  const [text, setText] = useState(INITIAL_MARKDOWN);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const markdown = new Markdown();
  const html = markdown.render(text);

  return (
    <div className="editor-container">
      <div className="editor-panel">
        <div className="panel-header">
          <h3 className="panel-title">Editor</h3>
          <div className="theme-toggle">
            <button
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
              onClick={() => setTheme('system')}
              title={`System (${resolvedTheme})`}
            >
              Auto
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              title="Dark mode"
            >
              Dark
            </button>
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              title="Light mode"
            >
              Light
            </button>
          </div>
        </div>
        <textarea
          className="editor-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write markdown here..."
        />
      </div>
      <div className="preview-panel">
        <div className="panel-header">
          <h3 className="panel-title">Preview</h3>
        </div>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}