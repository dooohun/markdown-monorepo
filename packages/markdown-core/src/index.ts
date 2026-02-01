import type { Token, ParseResult } from '@markdown/shared';
import { Tokenizer, type TokenizerOptions } from './tokenizer';

export interface MarkdownOptions extends TokenizerOptions {
  sanitize?: boolean;
}

export class Markdown {
  public readonly options: MarkdownOptions;
  private tokenizer: Tokenizer;

  constructor(options: MarkdownOptions = {}) {
    this.options = {
      gfm: true,
      breaks: false,
      sanitize: true,
      ...options,
    };
    this.tokenizer = new Tokenizer(this.options);
  }

  parse(text: string): ParseResult {
    const tokens = this.tokenize(text);
    
    return {
      ast: {
        type: 'document',
        children: [],
      },
      tokens,
      errors: [],
    };
  }

  tokenize(text: string): Token[] {
    return this.tokenizer.tokenize(text);
  }
}

export { Tokenizer } from './tokenizer';
export type { TokenizerRule, TokenizerOptions } from './tokenizer';
export default Markdown;