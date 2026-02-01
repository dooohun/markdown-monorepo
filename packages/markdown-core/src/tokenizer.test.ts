import { describe, it, expect } from 'vitest';
import { Tokenizer } from './tokenizer';

describe('Tokenizer', () => {
  const tokenizer = new Tokenizer();

  describe('Block Tokens', () => {
    it('should tokenize headings', () => {
      const tokens = tokenizer.tokenize('# Heading 1\n## Heading 2');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({
        type: 'heading',
        text: 'Heading 1',
        depth: 1,
      });
      expect(tokens[1]).toMatchObject({
        type: 'heading',
        text: 'Heading 2',
        depth: 2,
      });
    });

    it('should tokenize code blocks', () => {
      const tokens = tokenizer.tokenize('```typescript\nconst x = 1;\n```');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'code_block',
        lang: 'typescript',
        text: 'const x = 1;\n',
      });
    });

    it('should tokenize horizontal rules', () => {
      const tokens = tokenizer.tokenize('---');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'hr',
      });
    });

    it('should tokenize blockquotes', () => {
      const tokens = tokenizer.tokenize('> This is a quote\n> Second line');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'blockquote',
        text: 'This is a quote\nSecond line',
      });
    });

    it('should tokenize unordered lists', () => {
      const tokens = tokenizer.tokenize('- Item 1\n- Item 2\n- Item 3');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'list',
      });
      expect(tokens[0]?.tokens).toHaveLength(3);
    });

    it('should tokenize paragraphs', () => {
      const tokens = tokenizer.tokenize('This is a paragraph.\nContinued on next line.');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        type: 'paragraph',
        text: 'This is a paragraph.\nContinued on next line.',
      });
    });
  });

  describe('Inline Tokens', () => {
    it('should tokenize bold text', () => {
      const tokens = tokenizer.tokenizeInline('This is **bold** text');
      
      const boldToken = tokens.find(t => t.type === 'bold');
      expect(boldToken).toMatchObject({
        type: 'bold',
        text: 'bold',
      });
    });

    it('should tokenize italic text', () => {
      const tokens = tokenizer.tokenizeInline('This is *italic* text');
      
      const italicToken = tokens.find(t => t.type === 'italic');
      expect(italicToken).toMatchObject({
        type: 'italic',
        text: 'italic',
      });
    });

    it('should tokenize inline code', () => {
      const tokens = tokenizer.tokenizeInline('Use `console.log()` for debugging');
      
      const codeToken = tokens.find(t => t.type === 'code_inline');
      expect(codeToken).toMatchObject({
        type: 'code_inline',
        text: 'console.log()',
      });
    });

    it('should tokenize links', () => {
      const tokens = tokenizer.tokenizeInline('Click [here](https://example.com "Example")');
      
      const linkToken = tokens.find(t => t.type === 'link');
      expect(linkToken).toMatchObject({
        type: 'link',
        text: 'here',
        href: 'https://example.com',
        title: 'Example',
      });
    });

    it('should tokenize images', () => {
      const tokens = tokenizer.tokenizeInline('![Alt text](image.png "Title")');
      
      const imageToken = tokens.find(t => t.type === 'image');
      expect(imageToken).toMatchObject({
        type: 'image',
        text: 'Alt text',
        href: 'image.png',
        title: 'Title',
      });
    });
  });

  describe('Mixed Content', () => {
    it('should tokenize complex markdown', () => {
      const markdown = `# Hello World

This is a **bold** paragraph with *italic* text.

\`\`\`javascript
console.log('Hello');
\`\`\`

- Item 1
- Item 2

> A blockquote

---
`;
      const tokens = tokenizer.tokenize(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.some(t => t.type === 'heading')).toBe(true);
      expect(tokens.some(t => t.type === 'paragraph')).toBe(true);
      expect(tokens.some(t => t.type === 'code_block')).toBe(true);
      expect(tokens.some(t => t.type === 'list')).toBe(true);
      expect(tokens.some(t => t.type === 'blockquote')).toBe(true);
      expect(tokens.some(t => t.type === 'hr')).toBe(true);
    });
  });
});
