import React, { useEffect, useState } from "react";
import { exporter, importer, Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import MonacoEditor, { Editor } from "@monaco-editor/react";
import { StartupCode } from "./constant";
import ErrorFmt, { ExportFormat, ImportFormat } from "@/services/dbml";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formatOptions = [
  { value: "mysql", label: "MySQL" },
  { value: "postgres", label: "Postgres" },
  { value: "dbml", label: "DBML" },
  { value: "mssql", label: "MSSQL" },
  { value: "oracle", label: "Oracle" },
  { value: "json", label: "JSON" },
] as const;

const DBMLEditor: React.FC = () => {
  return (
    <Editor
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
