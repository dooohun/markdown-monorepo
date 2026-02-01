import { describe, it, expect } from 'vitest';
import { Parser } from './parser';
import { Tokenizer } from './tokenizer';
import type { Token } from '@markdown/shared';

describe('Parser', () => {
  const tokenizer = new Tokenizer();
  const parser = new Parser();

  describe('Basic Parsing', () => {
    it('should create a document node as root', () => {
      const tokens: Token[] = [];
      const ast = parser.parse(tokens);

      expect(ast.type).toBe('document');
      expect(ast.children).toEqual([]);
    });

    it('should parse heading tokens to AST nodes', () => {
      const tokens = tokenizer.tokenize('# Hello World');
      const ast = parser.parse(tokens);

      expect(ast.type).toBe('document');
      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0]).toMatchObject({
        type: 'heading',
        value: 'Hello World',
        attributes: { level: 1 },
      });
    });

    it('should parse code block with language attribute', () => {
      const tokens = tokenizer.tokenize('```typescript\nconst x = 1;\n```');
      const ast = parser.parse(tokens);

      expect(ast.children?.[0]).toMatchObject({
        type: 'code_block',
        attributes: { language: 'typescript' },
      });
    });

    it('should parse links with href and title attributes', () => {
      const tokens = tokenizer.tokenize('[Click here](https://example.com "Example")');
      const ast = parser.parse(tokens);

      const paragraph = ast.children?.[0];
      const link = paragraph?.children?.find(c => c.type === 'link');

      expect(link).toMatchObject({
        type: 'link',
        value: 'Click here',
        attributes: {
          href: 'https://example.com',
          title: 'Example',
        },
      });
    });

    it('should parse images with href attribute', () => {
      const tokens = tokenizer.tokenize('![Alt text](image.png)');
      const ast = parser.parse(tokens);

      const paragraph = ast.children?.[0];
      const image = paragraph?.children?.find(c => c.type === 'image');

      expect(image).toMatchObject({
        type: 'image',
        value: 'Alt text',
        attributes: {
          href: 'image.png',
        },
      });
    });
  });

  describe('Nested Tokens', () => {
    it('should parse inline tokens as children', () => {
      const tokens = tokenizer.tokenize('This is **bold** text');
      const ast = parser.parse(tokens);

      const paragraph = ast.children?.[0];
      expect(paragraph?.children).toBeDefined();
      expect(paragraph?.children?.some(c => c.type === 'bold')).toBe(true);
    });

    it('should parse heading with inline tokens', () => {
      const tokens = tokenizer.tokenize('# Hello **World**');
      const ast = parser.parse(tokens);

      const heading = ast.children?.[0];
      expect(heading?.children?.some(c => c.type === 'bold')).toBe(true);
    });
  });

  describe('Complex Document', () => {
    it('should parse a complete markdown document', () => {
      const markdown = `# Title

This is a **bold** paragraph.

\`\`\`javascript
console.log('Hello');
\`\`\`

- Item 1
- Item 2

> Blockquote
`;
      const tokens = tokenizer.tokenize(markdown);
      const ast = parser.parse(tokens);

      expect(ast.type).toBe('document');
      expect(ast.children?.length).toBeGreaterThan(0);

      const types = ast.children?.map(c => c.type);
      expect(types).toContain('heading');
      expect(types).toContain('paragraph');
      expect(types).toContain('code_block');
      expect(types).toContain('list');
      expect(types).toContain('blockquote');
    });
  });
});
