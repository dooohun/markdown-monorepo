# Markdown Editor

마크다운 편집기를 **Turborepo 모노레포**로 구현한 프로젝트입니다.

마크다운 문법은 [Markdown Guide](https://www.markdownguide.org/basic-syntax/)를 참고했습니다.

## 기술 스택

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Frontend**: React 19, Vite
- **Testing**: Vitest

## 프로젝트 구조

```
markdown-monorepo/
├── apps/
│   └── editor/              # 마크다운 에디터 UI (React)
│
├── packages/
│   ├── markdown-core/       # 마크다운 파서 핵심 로직
│   │   ├── tokenizer.ts     # 텍스트 → 토큰 변환
│   │   ├── parser.ts        # 토큰 → AST 변환
│   │   └── renderer.ts      # AST → HTML 변환
│   │
│   └── shared/              # 공유 타입 및 유틸
│       └── types/           # Token, ASTNode, ParseResult 등
│
├── turbo.json               # Turborepo 설정
├── pnpm-workspace.yaml      # pnpm 워크스페이스 설정
└── tsconfig.json            # TypeScript 기본 설정
```

## 패키지 설명

### `@markdown/core`

마크다운 파서의 핵심 로직을 담당합니다.

**파이프라인:**
```
Text → Tokenizer → Token[] → Parser → AST → Renderer → HTML
```

**지원 문법:**
| Block 요소 | Inline 요소 |
|-----------|------------|
| Heading (`#`) | Bold (`**text**`) |
| Paragraph | Italic (`*text*`) |
| Code Block (` ``` `) | Inline Code (`` `code` ``) |
| Blockquote (`>`) | Link (`[text](url)`) |
| List (`-`, `1.`) | Image (`![alt](src)`) |
| HR (`---`) | |

### `@markdown/shared`

모든 패키지에서 공유하는 타입을 정의합니다.

- `Token`, `TokenType` - 토큰 타입
- `ASTNode`, `ASTNodeType` - AST 노드 타입
- `ParseResult`, `ParseError` - 파싱 결과 타입
- `RenderOptions` - 렌더링 옵션
- `EditorState` - 에디터 상태

### `@markdown/editor`

React 기반 마크다운 에디터 UI입니다.

- 실시간 미리보기
- 다크/라이트 테마 지원
- 시스템 테마 자동 감지

## 실행 방법

### 요구사항

- Node.js 18+
- pnpm 9+

### 개발 서버

```bash
# 전체 프로젝트 개발 모드 실행
pnpm dev

# 에디터만 실행 (http://localhost:5173)
pnpm --filter @markdown/editor dev
```

### 빌드

```bash
# 전체 빌드
pnpm build
```

### 테스트

```bash
# 전체 테스트
pnpm test

# 특정 패키지 테스트
pnpm --filter @markdown/core test
```

## 빌드 파이프라인

Turborepo가 의존성 순서에 따라 자동으로 빌드합니다:

```
@markdown/shared:build
        ↓
@markdown/core:build (shared에 의존)
        ↓
@markdown/editor:lint → @markdown/editor:build (core에 의존)
```
