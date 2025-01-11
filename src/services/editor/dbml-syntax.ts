import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";

monaco.languages.register({ id: "dbml" });

monaco.languages.setMonarchTokensProvider("dbml", {
  defaultToken: "",
  tokenPostfix: ".dbml",
  ignoreCase: true,

  keywords: [
    "project",
    "table",
    "tablegroup",
    "ref",
    "enum",
    "indexes",
    "note",
    "as",
    "by",
    "bool",
    "boolean",
    "bit",
    "blob",
    "decimal",
    "double",
    "enum",
    "float",
    "long",
    "longblob",
    "longtext",
    "medium",
    "mediumblob",
    "mediumint",
    "mediumtext",
    "time",
    "timestamp",
    "timestamptz",
    "tinyblob",
    "tinyint",
    "tinytext",
    "text",
    "bigint",
    "int",
    "int1",
    "int2",
    "int3",
    "int4",
    "int8",
    "integer",
    "float",
    "float4",
    "float8",
    "double",
    "char",
    "varbinary",
    "varchar",
    "varcharacter",
    "precision",
    "date",
    "datetime",
    "year",
    "unsigned",
    "signed",
    "numeric",
    "ucase",
    "lcase",
    "mid",
    "len",
    "round",
    "rank",
    "now",
    "format",
    "coalesce",
    "ifnull",
    "isnull",
    "nvl",
  ],

  operators: ["<", ">", "-"],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // whitespace
      { include: "@whitespace" },

      // relationships
      [/[<>]/, "support.type"],
      [/-/, "support.type"],

      // delimiters and operators
      [/[{}()\[\]]/, "@brackets"],
      [/@symbols/, "operator"],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/\d+/, "number"],

      // delimiter: after number because of .\d floats
      [/[;,.]/, "delimiter"],

      // strings
      [/'([^'\\]|\\.)*$/, "string.invalid"], // non-terminated string
      [/'/, "string", "@string_single"],
      [/"/, "string", "@string_double"],
      [/`/, "string", "@string_backtick"],
      [/'''/, "string", "@string_multiline"],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\/\/.*$/, "comment"],
    ],

    string_single: [
      [/[^\\']/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'/, "string", "@pop"],
    ],

    string_double: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"],
    ],

    string_backtick: [
      [/[^\\`]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/`/, "string", "@pop"],
    ],

    string_multiline: [
      [/[^\\''']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'''/, "string", "@pop"],
    ],
  },
});

monaco.languages.setLanguageConfiguration("dbml", {
  comments: {
    lineComment: "//",
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "`", close: "`" },
    { open: '"""', close: '"""' },
    { open: "'''", close: "'''" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "`", close: "`" },
  ],
});

loader.config({ monaco });
