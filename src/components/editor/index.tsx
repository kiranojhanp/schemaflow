import * as _ from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import { formatDiagnosticsForMonaco } from "@/services/editor/monaco-error";
import { EDITOR_CONFIG, EDITOR_OPTIONS, StartupCode } from "./constant";

import { CompilerError } from "@dbml/core/types/parse/error";
import { useDBMLStore } from "@/pages/Home/store";

const DBMLEditor: React.FC = () => {
  const { setCode, setEditorModel, parseDBML, setMarkers } = useDBMLStore();

  // Error handling utility
  const handleParserError = useCallback(
    (error: unknown) => {
      if (error as CompilerError) {
        const markers = formatDiagnosticsForMonaco(error as CompilerError);
        setMarkers(markers);
      } else if (error instanceof Error) {
        console.error("DBML Parser Error:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    },
    [setMarkers]
  );

  // Editor mount handler
  const handleEditorMount: OnMount = useCallback(
    (editor) => {
      setEditorModel(editor.getModel());
    },
    [setEditorModel]
  );

  // Code change handler with debounce
  const handleCodeChange = useCallback(
    _.debounce((newValue: string | undefined) => {
      const updatedCode = newValue || "";
      setCode(updatedCode);
      const result = parseDBML(updatedCode);
      if (!result.success) {
        handleParserError(result.error);
      }
    }, EDITOR_CONFIG.BUILD_DELAY),
    [parseDBML, setCode, handleParserError]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      handleCodeChange.cancel();
    };
  }, [handleCodeChange]);

  return (
    <Editor
      onMount={handleEditorMount}
      onChange={handleCodeChange}
      className="flex-1"
      defaultLanguage={EDITOR_CONFIG.LANGUAGE}
      defaultValue={StartupCode}
      theme={EDITOR_CONFIG.THEME}
      options={EDITOR_OPTIONS}
    />
  );
};

export default DBMLEditor;
