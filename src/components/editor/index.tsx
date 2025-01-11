import React, { useEffect, useState } from "react";
import Database from "@dbml/core/types/model_structure/database";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { exporter, importer, Parser } from "@dbml/core";
import ErrorFmt, { ExportFormat, ImportFormat } from "@/services/dbml";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import * as _ from "lodash-es";
import { CompilerError } from "@dbml/core/types/parse/error";

import { StartupCode } from "./constant";
import { formatDiagnosticsForMonaco } from "@/services/editor/monaco-error";
const DEFAULT_BUILD_DELAY = 2000;

const formatOptions = [
  { value: "mysql", label: "MySQL" },
  { value: "postgres", label: "Postgres" },
  { value: "dbml", label: "DBML" },
  { value: "mssql", label: "MSSQL" },
  { value: "oracle", label: "Oracle" },
  { value: "json", label: "JSON" },
] as const;

const DBMLEditor: React.FC = () => {
  const parser = new Parser();
  const initialDatabase = parser.parse(StartupCode, "dbmlv2") as Database;

  // State
  const [code, setCode] = useState(StartupCode);
  const [database, setDatabase] = useState<Database>(initialDatabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const newDB = parser.parse(code, "dbmlv2") as Database;
      setDatabase(newDB);
      setError(null);

      // Clear markers within useEffect when no errors
      monaco.editor.getModels().forEach((model) => {
        monaco.editor.setModelMarkers(model, "owner", []);
      });
    } catch (e) {
      if (e as CompilerError) {
        setError(ErrorFmt(e as CompilerError)); // Set error string for display purposes
        const markers = formatDiagnosticsForMonaco(e as CompilerError);
        monaco.editor.getModels().forEach((model) => {
          monaco.editor.setModelMarkers(model, "owner", markers);
        });
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  }, [code]);

  useEffect(() => (!!error ? console.log(error) : () => {}), [error]);

  return (
    <Editor
      onMount={() => setDatabase(initialDatabase)}
      onChange={_.debounce(
        (newValue: string | undefined) => setCode(newValue || ""),
        DEFAULT_BUILD_DELAY
      )}
      className="flex-1"
      defaultLanguage="dbml"
      defaultValue={StartupCode}
      theme="one-dark-pro"
      options={{
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
        wordWrap: "on",
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
        },
      }}
    />
  );
};

export default DBMLEditor;
