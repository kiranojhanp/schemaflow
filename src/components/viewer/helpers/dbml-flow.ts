import { Edge, MarkerType, Node } from "@xyflow/react";
import Database from "@dbml/core/types/model_structure/database";
import Ref from "@dbml/core/types/model_structure/ref";
import dagre from "@dagrejs/dagre";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 100;

export const parseDatabaseToReactFlow = (database: Database) => {
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
export const getLayoutedElements = (
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
