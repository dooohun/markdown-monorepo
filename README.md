## Markdown Editor
마크다운 편집기를 모노레포로 구현한 프로젝트입니다.
마크다운 문법은 [markdown-guide](https://www.markdownguide.org/basic-syntax/)를 참고했습니다.

## Markdown Editor 구현
### markdown-core
markdown-core는 마크다운 편집기의 핵심 기능을 구현한 모듈입니다.
markdown-core는 다음과 같은 기능을 구현합니다.
- tokenizer
- parser
- lexer

### apps - markdown-editor
markdown-editor는 마크다운 편집기의 UI를 구현한 모듈입니다.
markdown-editor는 다음과 같은 기능을 구현합니다.
- 사용자가 입력한 마크다운 텍스트를 markdown-core로 전달합니다.


### apps - markdown-preview
markdown-preview는 마크다운 편집기의 미리보기를 구현한 모듈입니다.
markdown-preview는 다음과 같은 기능을 구현합니다.
- markdown-editor에서 입력한 마크다운 텍스트를 markdown-core로 전달합니다.
- markdown-core에서 반환된 결과를 UI로 표시합니다.


### shared
shared는 마크다운 편집기의 공통 기능을 구현한 모듈입니다.
shared는 다음과 같은 기능을 구현합니다.
- 공통 컴포넌트
- 공통 타입
- 공통 유틸


## 실행
