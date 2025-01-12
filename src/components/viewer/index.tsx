import React from "react";
import { Wand2 } from "lucide-react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  ConnectionLineType,
  ControlButton,
} from "@xyflow/react";
import { useDBMLStore } from "@/pages/Home/store";
import { DatabaseSchemaNode } from "@/components/database-schema-node";

const nodeTypes = {
  databaseSchema: DatabaseSchemaNode,
};

const ERViewer: React.FC = () => {
  const {
    colorMode,
    database,
    nodes,
    edges,
    onEdgesChange,
    onLayout,
    handleNodesChange,
    updateViewerFromDatabase,
  } = useDBMLStore();

  const { fitView } = useReactFlow();

  return (
    <div className="w-full h-full">
      <ReactFlow
        colorMode={colorMode}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={() => {
          updateViewerFromDatabase(database!);
          onLayout("TB", fitView);
        }}
        connectionLineType={ConnectionLineType.Straight}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        className="bg-gray-50"
      >
        <Background variant={BackgroundVariant.Lines} />
        <Controls
          orientation="horizontal"
          position="bottom-center"
          showZoom={false}
          showFitView={false}
        >
          <ControlButton
            onClick={() => onLayout("TB", fitView)}
            title="Auto Layout"
          >
            <Wand2 />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};

const Viewer: React.FC = () => (
  <ReactFlowProvider>
    <ERViewer />
  </ReactFlowProvider>
);

export default Viewer;
