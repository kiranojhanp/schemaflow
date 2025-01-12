import DBMLEditor from "@/components/editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Viewer from "@/components/viewer";

import * as _ from "lodash-es";

export function Home() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full !flex-col md:!flex-row"
    >
      <ResizablePanel defaultSize={30}>
        <div className="flex items-center justify-center h-full">
          <DBMLEditor />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={70}>
        <div className="flex items-center justify-center h-full">
          <Viewer  />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
