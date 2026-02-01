import type { ASTNode, RenderOptions } from '@markdown/shared';

export class Renderer {
  public readonly options: RenderOptions;

  constructor(options: RenderOptions = {}) {
    this.options = {
      sanitize: true,
      breaks: false,
      gfm: true,
      headerIds: true,
      headerPrefix: '',
      ...options,
    };
  }

  render(ast: ASTNode): string {
    return this.renderNode(ast);
  }

  private renderNode(node: ASTNode): string {
    switch (node.type) {
      case 'document':
      case 'root':
        return this.renderChildren(node);

      case 'heading':
        return this.renderHeading(node);

      case 'paragraph':
        return this.renderParagraph(node);

      case 'code_block':
        return this.renderCodeBlock(node);

      case 'code_inline':
        return this.renderCodeInline(node);

      case 'blockquote':
        return this.renderBlockquote(node);

      case 'list':
        return this.renderList(node);

      case 'list_item':
        return this.renderListItem(node);

      case 'bold':
        return this.renderBold(node);

      case 'italic':
        return this.renderItalic(node);

      case 'link':
        return this.renderLink(node);

      case 'image':
        return this.renderImage(node);

      case 'hr':
        return '<hr>\n';

      case 'newline':
        return this.options.breaks ? '<br>\n' : '\n';

      case 'text':
      default:
        return this.escapeHtml(node.value ?? '');
    }
  }

  private renderChildren(node: ASTNode): string {
    if (!node.children || node.children.length === 0) {
      return this.escapeHtml(node.value ?? '');
    }

    return node.children.map(child => this.renderNode(child)).join('');
  }

  private renderHeading(node: ASTNode): string {
    const level = (node.attributes?.['level'] as number) ?? 1;
    const content = this.renderChildren(node);
    const id = this.options.headerIds
      ? ` id="${this.options.headerPrefix}${this.slugify(node.value ?? '')}"`
      : '';

    return `<h${level}${id}>${content}</h${level}>\n`;
  }

  private renderParagraph(node: ASTNode): string {
    const content = this.renderChildren(node);
    return `<p>${content}</p>\n`;
  }

  private renderCodeBlock(node: ASTNode): string {
    const lang = node.attributes?.['language'] as string | undefined;
    const langClass = lang ? ` class="language-${lang}"` : '';
    const code = this.escapeHtml(node.value ?? '');

    return `<pre><code${langClass}>${code}</code></pre>\n`;
  }

  private renderCodeInline(node: ASTNode): string {
    const code = this.escapeHtml(node.value ?? '');
    return `<code>${code}</code>`;
  }

  private renderBlockquote(node: ASTNode): string {
    const content = this.renderChildren(node);
    return `<blockquote>\n<p>${content}</p>\n</blockquote>\n`;
  }

  private renderList(node: ASTNode): string {
    const items = this.renderChildren(node);
    return `<ul>\n${items}</ul>\n`;
  }

  private renderListItem(node: ASTNode): string {
    const content = this.renderChildren(node);
    return `<li>${content}</li>\n`;
  }

  private renderBold(node: ASTNode): string {
    const content = node.children
      ? this.renderChildren(node)
      : this.escapeHtml(node.value ?? '');
    return `<strong>${content}</strong>`;
  }

  private renderItalic(node: ASTNode): string {
    const content = node.children
      ? this.renderChildren(node)
      : this.escapeHtml(node.value ?? '');
    return `<em>${content}</em>`;
  }

  private renderLink(node: ASTNode): string {
    const href = this.escapeHtml((node.attributes?.['href'] as string) ?? '');
    const title = node.attributes?.['title']
      ? ` title="${this.escapeHtml(node.attributes['title'] as string)}"`
      : '';
    const content = node.children
      ? this.renderChildren(node)
      : this.escapeHtml(node.value ?? '');

    return `<a href="${href}"${title}>${content}</a>`;
  }

  private renderImage(node: ASTNode): string {
    const src = this.escapeHtml((node.attributes?.['href'] as string) ?? '');
    const alt = this.escapeHtml(node.value ?? '');
    const title = node.attributes?.['title']
      ? ` title="${this.escapeHtml(node.attributes['title'] as string)}"`
      : '';

    return `<img src="${src}" alt="${alt}"${title}>`;
  }

  private escapeHtml(text: string): string {
    if (!this.options.sanitize) {
      return text;
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
