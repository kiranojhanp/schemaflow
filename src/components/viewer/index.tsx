import React, { useCallback } from "react";
import { Wand2 } from "lucide-react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  MarkerType,
  ConnectionLineType,
  Edge,
  Node,
  NodeChange,
  ControlButton,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { useDBMLStore } from "@/pages/Home/store";
import TableNode from "./TableNode";
import { getSavedPositions, getStorageKey } from "./helpers/localstorage";

import Database from "@dbml/core/types/model_structure/database";
import Ref from "@dbml/core/types/model_structure/ref";

import "@xyflow/react/dist/base.css";
import "@xyflow/react/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 100;

const nodeTypes = {
  tableNode: TableNode,
};

const ERViewer: React.FC = () => {
  const {
    database,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    persistPositions,
    updateViewerFromDatabase,
  } = useDBMLStore();

  const { fitView } = useReactFlow();

  // get storage key and load saved positions
  const storageKey = getStorageKey(database!);
  const loadSavedPositions = useCallback(
    () => getSavedPositions(storageKey),
    [storageKey]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      persistPositions(storageKey);
    },
    [onNodesChange, persistPositions, storageKey]
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: initialNodes, edges: initialEdges } =
        parseDatabaseToReactFlow(database!);

      const savedPositions = loadSavedPositions();

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(
          initialNodes,
          initialEdges,
          savedPositions,
          direction
        );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => fitView({ padding: 0.2 }), 0);
    },
    [database, fitView, setNodes, setEdges, loadSavedPositions]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={() => {
          updateViewerFromDatabase(database!);
          onLayout("TB");
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
          <ControlButton onClick={() => onLayout("TB")} title="Auto Layout">
            <Wand2 />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};

const parseDatabaseToReactFlow = (database: Database) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Helper function to find primary key field name
  const findPrimaryKeyField = (table: any) => {
    const pkField = table.fields.find((field: any) => field.pk);
    return pkField ? pkField.name : "id";
  };

  // Iterate over schemas and their tables
  database.schemas.forEach((schema) => {
    schema.tables.forEach((table) => {
      nodes.push({
        id: table.name,
        type: "tableNode",
        draggable: true,
        data: {
          label: table.name,
          fields: table.fields.map((field) => ({
            name: field.name,
            type: field.type.type_name,
            isPrimary: field.pk,
          })),
        },
        position: { x: 0, y: nodes.length * 150 },
      });
    });

    // Access references through schema.refs if available
    schema.refs?.forEach((ref: Ref, index) => {
      const source = ref.endpoints[0];
      const target = ref.endpoints[1];

      const sourceTable = schema.tables.find(
        (t) => t.name === source.tableName
      );
      const targetTable = schema.tables.find(
        (t) => t.name === target.tableName
      );

      if (!sourceTable || !targetTable) return;

      // Find the correct field names for the connection
      const targetPkField = findPrimaryKeyField(targetTable);

      // Find foreign key field (usually in source table)
      const foreignKeyField =
        sourceTable.fields.find(
          (f: any) =>
            f.name.toLowerCase() === `${targetTable.name.toLowerCase()}_id` ||
            f.name.toLowerCase() === targetPkField.toLowerCase()
        )?.name || targetPkField;

      edges.push({
        id: `edge-${index}`,
        source: source.tableName,
        target: target.tableName,
        sourceHandle: `${foreignKeyField}-source`,
        targetHandle: `${targetPkField}-target`,
        type: "smoothstep",
        animated: false,
        markerEnd: MarkerType.ArrowClosed,
        style: { strokeWidth: 1 },
      });
    });
  });

  return { nodes, edges };
};

// Layout helper function using dagre
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  savedPositions?: Record<string, { x: number; y: number }>,
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Always run dagre layout to calculate proper edge positions
  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      draggable: true,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position:
        savedPositions && savedPositions[node.id]
          ? {
              x: savedPositions[node.id].x,
              y: savedPositions[node.id].y,
            }
          : // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            {
              x: nodeWithPosition.x - nodeWidth / 2,
              y: nodeWithPosition.y - nodeHeight / 2,
            },
    };

    return newNode as Node;
  });

  return {
    nodes: newNodes,
    edges: edges,
  };
};

const Viewer: React.FC = () => (
  <ReactFlowProvider>
    <ERViewer />
  </ReactFlowProvider>
);

export default Viewer;
