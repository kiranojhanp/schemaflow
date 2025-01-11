import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";

import OneDarkPro from "@/components/editor/theme/onedarkpro.json";

monaco.editor.defineTheme("one-dark-pro", {
  base: "vs-dark",
  inherit: true,
  ...OneDarkPro,
});

loader.config({ monaco });

