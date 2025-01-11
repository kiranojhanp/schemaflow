import { create } from "zustand";
import { Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import * as monaco from "monaco-editor";
import { StartupCode } from "@/components/editor/constant";

interface DBMLState {
  code: string;
  database: Database | null;
  editorModel: monaco.editor.ITextModel | null;
  parser: Parser;
  // Actions
  setCode: (code: string) => void;
  setEditorModel: (model: monaco.editor.ITextModel | null) => void;
  parseDBML: (code: string) =>
    | {
        success: boolean;
        database?: Database;
        error?: undefined;
      }
    | {
        success: boolean;
        error: unknown;
        database?: undefined;
      };
  setMarkers: (markers: monaco.editor.IMarkerData[]) => void;
  clearMarkers: () => void;
}

const parser = new Parser();
const initialDatabase = parser.parse(StartupCode, "dbmlv2") as Database;

export const useDBMLStore = create<DBMLState>((set, get) => ({
  code: StartupCode,
  database: initialDatabase,
  editorModel: null,
  parser: parser,

  setCode: (code) => set({ code }),

  setEditorModel: (model) => set({ editorModel: model }),

  parseDBML: (code) => {
    try {
      const parser = get().parser;
      const newDB = parser.parse(code, "dbmlv2") as Database;
      set({ database: newDB });
      get().clearMarkers();
      return { success: true, database: newDB };
    } catch (error) {
      return { success: false, error };
    }
  },

  setMarkers: (markers) => {
    const { editorModel } = get();
    if (editorModel) {
      monaco.editor.setModelMarkers(editorModel, "owner", markers);
    }
  },

  clearMarkers: () => {
    const { editorModel } = get();
    if (editorModel) {
      monaco.editor.setModelMarkers(editorModel, "owner", []);
    }
  },
}));
