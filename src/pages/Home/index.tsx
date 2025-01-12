import DBMLEditor from "@/components/editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Viewer from "@/components/viewer";

import * as _ from "lodash-es";
import { useDBMLStore } from "./store";
import { getStorageKey } from "@/components/viewer/helpers/localstorage";

export function Home() {
  const { database } = useDBMLStore();

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full !flex-col md:!flex-row"
      autoSaveId={getStorageKey(database!)}
    >
      <ResizablePanel defaultSize={30}>
        <DBMLEditor />
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={70}>
        <Viewer />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
