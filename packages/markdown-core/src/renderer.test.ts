import { describe, it, expect } from 'vitest';
import { Renderer } from './renderer';
import { Parser } from './parser';
import { Tokenizer } from './tokenizer';
import Markdown from './index';

describe('Renderer', () => {
  const tokenizer = new Tokenizer();
  const parser = new Parser();
  const renderer = new Renderer();

  const toHtml = (markdown: string): string => {
    const tokens = tokenizer.tokenize(markdown);
    const ast = parser.parse(tokens);
    return renderer.render(ast);
  };

  describe('Block Elements', () => {
    it('should render headings with id', () => {
      const html = toHtml('# Hello World');
      expect(html).toBe('<h1 id="hello-world">Hello World</h1>\n');
    });

    it('should render different heading levels', () => {
      expect(toHtml('## Level 2')).toContain('<h2');
      expect(toHtml('### Level 3')).toContain('<h3');
      expect(toHtml('#### Level 4')).toContain('<h4');
    });

    it('should render paragraphs', () => {
      const html = toHtml('This is a paragraph.');
      expect(html).toBe('<p>This is a paragraph.</p>\n');
    });

    it('should render code blocks with language class', () => {
      const html = toHtml('```typescript\nconst x = 1;\n```');
      expect(html).toContain('<pre><code class="language-typescript">');
      expect(html).toContain('const x = 1;');
    });

    it('should render horizontal rules', () => {
      const html = toHtml('---');
      expect(html).toBe('<hr>\n');
    });

    it('should render blockquotes', () => {
      const html = toHtml('> This is a quote');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('This is a quote');
    });

    it('should render unordered lists', () => {
      const html = toHtml('- Item 1\n- Item 2');
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
    });
  });

  describe('Inline Elements', () => {
    it('should render bold text', () => {
      const html = toHtml('This is **bold** text');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('should render italic text', () => {
      const html = toHtml('This is *italic* text');
      expect(html).toContain('<em>italic</em>');
    });

    it('should render inline code', () => {
      const html = toHtml('Use `console.log()`');
      expect(html).toContain('<code>console.log()</code>');
    });

    it('should render links', () => {
      const html = toHtml('[Click here](https://example.com)');
      expect(html).toContain('<a href="https://example.com">Click here</a>');
    });

    it('should render links with title', () => {
      const html = toHtml('[Click](https://example.com "Example")');
      expect(html).toContain('title="Example"');
    });

    it('should render images', () => {
      const html = toHtml('![Alt text](image.png)');
      expect(html).toContain('<img src="image.png" alt="Alt text">');
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in text', () => {
      const html = toHtml('<script>alert("xss")</script>');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape quotes in attributes', () => {
      const html = toHtml('[Click](https://example.com "title with \\"quotes\\"")');
      expect(html).not.toContain('""');
    });
  });

  describe('Integration with Markdown class', () => {
    it('should render markdown to HTML', () => {
      const md = new Markdown();
      const html = md.render('# Hello **World**');

      expect(html).toContain('<h1');
      expect(html).toContain('<strong>World</strong>');
    });

    it('should respect options', () => {
      const md = new Markdown({ headerIds: false });
      const html = md.render('# Title');

      expect(html).toBe('<h1>Title</h1>\n');
      expect(html).not.toContain('id=');
    });

    it('should render complex document', () => {
      const md = new Markdown();
      const markdown = `# Title

This is a **bold** paragraph with *italic* text.

\`\`\`javascript
console.log('Hello');
\`\`\`

- Item 1
- Item 2

> Blockquote

---

[Link](https://example.com)
`;
      const html = md.render(markdown);

      expect(html).toContain('<h1');
      expect(html).toContain('<p>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<pre><code');
      expect(html).toContain('<ul>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<hr>');
      expect(html).toContain('<a href=');
    });
  });
});
