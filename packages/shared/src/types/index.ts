export type TokenType =
  | 'heading'
  | 'paragraph'
  | 'code_block'
  | 'code_inline'
  | 'blockquote'
  | 'list'
  | 'list_item'
  | 'bold'
  | 'italic'
  | 'link'
  | 'image'
  | 'hr'
  | 'newline'
  | 'text';

export interface Token {
  type: TokenType;
  raw: string;
  text?: string;
  depth?: number;
  lang?: string;
  href?: string;
  title?: string;
  tokens?: Token[];
}

export type ASTNodeType = TokenType | 'document' | 'root';

export interface ASTNode {
  type: ASTNodeType;
  children?: ASTNode[];
  value?: string;
  attributes?: Record<string, string | number | boolean>;
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  ast: ASTNode;
  tokens: Token[];
  errors: ParseError[];
}

/** Description of gfm 
 * @see https://github.github.com/gfm/
 */
export interface RenderOptions {
  sanitize?: boolean;
  breaks?: boolean;
  gfm?: boolean;
  headerIds?: boolean;
  headerPrefix?: string;
}

export interface EditorState {
  content: string;
  cursorPosition: number;
  selection?: {
    start: number;
    end: number;
  };
}