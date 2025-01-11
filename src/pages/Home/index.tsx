import DBMLEditor from "@/components/editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import * as _ from "lodash-es";

export function Home() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full !flex-col md:!flex-row"
    >
      <ResizablePanel
        defaultSize={30}
        onResize={_.debounce(() => console.log("resize done"), 1000)}
      >
        <div className="flex items-center justify-center h-full">
          <DBMLEditor />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={70}>
        <div className="flex items-center justify-center h-full">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
