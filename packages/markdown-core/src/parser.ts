import type { Token, ASTNode, ASTNodeType } from '@markdown/shared';

export interface ParserOptions {
  gfm?: boolean;
}

export class Parser {
  public readonly options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      gfm: true,
      ...options,
    };
  }

  parse(tokens: Token[]): ASTNode {
    const root: ASTNode = {
      type: 'document',
      children: [],
    };

    for (const token of tokens) {
      const node = this.tokenToNode(token);
      root.children?.push(node);
    }

    return root;
  }

  private tokenToNode(token: Token): ASTNode {
    const baseNode: ASTNode = {
      type: token.type as ASTNodeType,
      value: token.text,
      attributes: this.extractAttributes(token),
    };

    if (token.tokens && token.tokens.length > 0) {
      baseNode.children = token.tokens.map(t => this.tokenToNode(t));
    }

    return baseNode;
  }

  private extractAttributes(token: Token): Record<string, string | number | boolean> {
    const attributes: Record<string, string | number | boolean> = {};

    if (token.depth !== undefined) {
      attributes['level'] = token.depth;
    }

    if (token.lang) {
      attributes['language'] = token.lang;
    }

    if (token.href) {
      attributes['href'] = token.href;
    }

    if (token.title) {
      attributes['title'] = token.title;
    }

    return attributes;
  }
}
