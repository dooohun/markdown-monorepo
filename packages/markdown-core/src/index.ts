import type { Token, ASTNode, ParseResult, RenderOptions } from '@markdown/shared';
import { Tokenizer, type TokenizerOptions } from './tokenizer';
import { Parser, type ParserOptions } from './parser';
import { Renderer } from './renderer';

export interface MarkdownOptions extends TokenizerOptions, ParserOptions, RenderOptions {}

export class Markdown {
  public readonly options: MarkdownOptions;
  private tokenizer: Tokenizer;
  private parser: Parser;
  private renderer: Renderer;

  constructor(options: MarkdownOptions = {}) {
    this.options = {
      gfm: true,
      breaks: false,
      sanitize: true,
      headerIds: true,
      headerPrefix: '',
      ...options,
    };
    this.tokenizer = new Tokenizer(this.options);
    this.parser = new Parser(this.options);
    this.renderer = new Renderer(this.options);
  }

  parse(text: string): ParseResult {
    const tokens = this.tokenize(text);
    const ast = this.buildAST(tokens);

    return {
      ast,
      tokens,
      errors: [],
    };
  }

  render(text: string): string {
    const { ast } = this.parse(text);
    return this.renderer.render(ast);
  }

  tokenize(text: string): Token[] {
    return this.tokenizer.tokenize(text);
  }

  buildAST(tokens: Token[]): ASTNode {
    return this.parser.parse(tokens);
  }

  renderAST(ast: ASTNode): string {
    return this.renderer.render(ast);
  }
}

export { Tokenizer } from './tokenizer';
export { Parser } from './parser';
export { Renderer } from './renderer';
export type { TokenizerRule, TokenizerOptions } from './tokenizer';
export type { ParserOptions } from './parser';
export default Markdown;