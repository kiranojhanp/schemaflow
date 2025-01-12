import { EditorConfig } from "./type";
import * as monaco from "monaco-editor";

export const StartupCode = `Table users {
  id integer
  username varchar
  role varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  body text [note: 'Content of the post']
  user_id integer
  status post_status
  created_at timestamp
}

Enum post_status {
  draft
  published
  private [note: 'visible via URL only']
}

Ref: posts.user_id > users.id // many-to-one
`;

export const EDITOR_CONFIG: EditorConfig = {
  BUILD_DELAY: 1000,
  LANGUAGE: "dbml",
  THEME: "one-dark-pro",
};

export const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  selectOnLineNumbers: true,
  minimap: { enabled: false },
  bracketPairColorization: { enabled: true },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  padding: { top: 10, bottom: 70 },
  suggest: {
    showFields: false,
    showFunctions: false,
  },
  wordWrap: "off",
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
  },
};
