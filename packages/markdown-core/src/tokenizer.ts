import type { Token, TokenType } from '@markdown/shared';

export interface TokenizerRule {
  name: TokenType;
  pattern: RegExp;
  parse: (match: RegExpMatchArray, src: string) => Omit<Token, 'type'> & { consumed: number };
}

export interface TokenizerOptions {
  gfm?: boolean;
  breaks?: boolean;
}

export class Tokenizer {
  private rules: TokenizerRule[] = [];
  public readonly options: TokenizerOptions;

  constructor(options: TokenizerOptions = {}) {
    this.options = {
      gfm: true,
      breaks: false,
      ...options,
    };
    this.initializeRules();
  }

  private initializeRules(): void {
    this.rules = [
      this.headingRule(),
      this.codeBlockRule(),
      this.hrRule(),
      this.blockquoteRule(),
      this.listRule(),
      this.paragraphRule(),
    ];
  }

  tokenize(src: string): Token[] {
    const tokens: Token[] = [];
    let remaining = src;

    while (remaining.length > 0) {
      let matched = false;

      for (const rule of this.rules) {
        const match = rule.pattern.exec(remaining);
        
        if (match && match.index === 0) {
          const result = rule.parse(match, remaining);
          tokens.push({
            type: rule.name,
            ...result,
          } as Token);
          
          remaining = remaining.slice(result.consumed);
          matched = true;
          break;
        }
      }

      if (!matched) {
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  }

  private headingRule(): TokenizerRule {
    return {
      name: 'heading',
      pattern: /^(#{1,6})\s+(.+?)(?:\n|$)/,
      parse: (match) => ({
        raw: match[0],
        text: match[2]?.trim() ?? '',
        depth: match[1]?.length ?? 1,
        tokens: this.tokenizeInline(match[2] ?? ''),
        consumed: match[0].length,
      }),
    };
  }

  private codeBlockRule(): TokenizerRule {
    return {
      name: 'code_block',
      pattern: /^```(\w*)\n([\s\S]*?)```(?:\n|$)/,
      parse: (match) => ({
        raw: match[0],
        text: match[2] ?? '',
        lang: match[1] || undefined,
        consumed: match[0].length,
      }),
    };
  }

  private hrRule(): TokenizerRule {
    return {
      name: 'hr',
      pattern: /^(?:[-*_]){3,}(?:\n|$)/,
      parse: (match) => ({
        raw: match[0],
        consumed: match[0].length,
      }),
    };
  }

  private blockquoteRule(): TokenizerRule {
    return {
      name: 'blockquote',
      pattern: /^(?:>\s?.+(?:\n|$))+/,
      parse: (match) => {
        const raw = match[0];
        const text = raw
          .split('\n')
          .map(line => line.replace(/^>\s?/, ''))
          .join('\n')
          .trim();
        
        return {
          raw,
          text,
          tokens: this.tokenizeInline(text),
          consumed: raw.length,
        };
      },
    };
  }

  private listRule(): TokenizerRule {
    return {
      name: 'list',
      pattern: /^(?:[\t ]*[-*+]|\d+\.)\s+.+(?:\n(?:[\t ]*[-*+]|\d+\.)\s+.+)*/,
      parse: (match) => {
        const raw = match[0];
        const items = raw.split('\n').map(line => {
          const itemMatch = line.match(/^[\t ]*(?:[-*+]|\d+\.)\s+(.+)/);
          return itemMatch?.[1] ?? '';
        });

        return {
          raw,
          text: items.join('\n'),
          tokens: items.map(item => ({
            type: 'list_item' as TokenType,
            raw: item,
            text: item,
            tokens: this.tokenizeInline(item),
          })),
          consumed: raw.length,
        };
      },
    };
  }

  private paragraphRule(): TokenizerRule {
    return {
      name: 'paragraph',
      pattern: /^.+(?:\n(?!#{1,6}\s|```|[-*_]{3,}|>\s|[-*+]\s|\d+\.\s).+)*/,
      parse: (match) => {
        const raw = match[0];
        const text = raw.trim();
        
        return {
          raw,
          text,
          tokens: this.tokenizeInline(text),
          consumed: raw.length,
        };
      },
    };
  }

  tokenizeInline(src: string): Token[] {
    const tokens: Token[] = [];
    let remaining = src;

    const inlineRules: TokenizerRule[] = [
      this.codeInlineRule(),
      this.boldRule(),
      this.italicRule(),
      this.linkRule(),
      this.imageRule(),
      this.textRule(),
    ];

    while (remaining.length > 0) {
      let matched = false;

      for (const rule of inlineRules) {
        const match = rule.pattern.exec(remaining);
        
        if (match && match.index === 0) {
          const result = rule.parse(match, remaining);
          tokens.push({
            type: rule.name,
            ...result,
          } as Token);
          
          remaining = remaining.slice(result.consumed);
          matched = true;
          break;
        }
      }

      if (!matched) {
        if (tokens.length > 0 && tokens[tokens.length - 1]?.type === 'text') {
          const lastToken = tokens[tokens.length - 1];
          if (lastToken) {
            lastToken.raw += remaining[0];
            lastToken.text = (lastToken.text ?? '') + remaining[0];
          }
        } else {
          tokens.push({
            type: 'text',
            raw: remaining[0] ?? '',
            text: remaining[0] ?? '',
            consumed: 1,
          } as Token);
        }
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  }

  private codeInlineRule(): TokenizerRule {
    return {
      name: 'code_inline',
      pattern: /^`([^`]+)`/,
      parse: (match) => ({
        raw: match[0],
        text: match[1] ?? '',
        consumed: match[0].length,
      }),
    };
  }

  private boldRule(): TokenizerRule {
    return {
      name: 'bold',
      pattern: /^\*\*(.+?)\*\*|^__(.+?)__/,
      parse: (match) => ({
        raw: match[0],
        text: match[1] ?? match[2] ?? '',
        consumed: match[0].length,
      }),
    };
  }

  private italicRule(): TokenizerRule {
    return {
      name: 'italic',
      pattern: /^\*([^*]+)\*|^_([^_]+)_/,
      parse: (match) => ({
        raw: match[0],
        text: match[1] ?? match[2] ?? '',
        consumed: match[0].length,
      }),
    };
  }

  private linkRule(): TokenizerRule {
    return {
      name: 'link',
      pattern: /^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/,
      parse: (match) => ({
        raw: match[0],
        text: match[1] ?? '',
        href: match[2],
        title: match[3],
        consumed: match[0].length,
      }),
    };
  }

  private imageRule(): TokenizerRule {
    return {
      name: 'image',
      pattern: /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/,
      parse: (match) => ({
        raw: match[0],
        text: match[1] ?? '',
        href: match[2],
        title: match[3],
        consumed: match[0].length,
      }),
    };
  }

  private textRule(): TokenizerRule {
    return {
      name: 'text',
      pattern: /^[^*_`\[!]+/,
      parse: (match) => ({
        raw: match[0],
        text: match[0],
        consumed: match[0].length,
      }),
    };
  }
}
