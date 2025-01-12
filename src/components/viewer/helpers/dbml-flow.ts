import { Edge, Node } from "@xyflow/react";
import dagre from "@dagrejs/dagre";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 250;
const nodeHeight = 100;

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
