import { create } from "zustand";
import { Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import * as monaco from "monaco-editor";
import { StartupCode } from "@/components/editor/constant";
import {
  Node,
  Edge,
  Connection,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  applyEdgeChanges,
  addEdge,
  ConnectionLineType,
  MarkerType,
} from "@xyflow/react";
import Ref from "@dbml/core/types/model_structure/ref";

interface DBMLState {
  // DBML Editor state
  code: string;
  database: Database | null;
  editorModel: monaco.editor.ITextModel | null;
  parser: Parser;

  // Flow Viewer state
  nodes: Node[];
  edges: Edge[];

  // Actions
  setCode: (code: string) => void;
  setEditorModel: (model: monaco.editor.ITextModel | null) => void;
  parseDBML: (code: string) =>
    | {
        success: boolean;
        database?: Database;
        error?: undefined;
      }
    | {
        success: boolean;
        error: unknown;
        database?: undefined;
      };
  setMarkers: (markers: monaco.editor.IMarkerData[]) => void;
  clearMarkers: () => void;
  updateViewerFromDatabase: (database: Database) => void;

  // Flow actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  persistPositions: (storageKey: string) => void;
}

const parser = new Parser();
const initialDatabase = parser.parse(StartupCode, "dbmlv2") as Database;

export const useDBMLStore = create<DBMLState>((set, get) => ({
  // Initial state
  code: StartupCode,
  database: initialDatabase,
  editorModel: null,
  parser: parser,
  nodes: [],
  edges: [],

  // DBML actions
  setCode: (code) => set({ code }),

  setEditorModel: (model) => set({ editorModel: model }),

  parseDBML: (code) => {
    try {
      const parser = get().parser;
      const newDB = parser.parse(code, "dbmlv2") as Database;
      set({ database: newDB });
      get().clearMarkers();
      get().updateViewerFromDatabase(newDB); // Update viewer when database changes
      return { success: true, database: newDB };
    } catch (error) {
      return { success: false, error };
    }
  },

  updateViewerFromDatabase: (database: Database) => {
    if (!database) return;

    const { nodes: initialNodes, edges: initialEdges } =
      parseDatabaseToReactFlow(database);

    // Preserve existing node positions when updating
    const currentNodes = get().nodes;
    const nodesWithPositions = initialNodes.map((node: Node) => {
      const existingNode = currentNodes.find((n) => n.id === node.id);
      return existingNode ? { ...node, position: existingNode.position } : node;
    });

    set({
      nodes: nodesWithPositions,
      edges: initialEdges,
    });
  },

  setMarkers: (markers) => {
    const { editorModel } = get();
    if (editorModel) {
      monaco.editor.setModelMarkers(editorModel, "owner", markers);
    }
  },

  clearMarkers: () => {
    const { editorModel } = get();
    if (editorModel) {
      monaco.editor.setModelMarkers(editorModel, "owner", []);
    }
  },

  // Flow actions
  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: ConnectionLineType.SmoothStep,
          animated: true,
        },
        get().edges
      ),
    });
  },

  persistPositions: (storageKey) => {
    const positions = get().nodes.reduce(
      (acc, node) => ({
        ...acc,
        [node.id]: node.position,
      }),
      {}
    );
    localStorage.setItem(storageKey, JSON.stringify(positions));
  },
}));

const parseDatabaseToReactFlow = (database: Database) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const findPrimaryKeyField = (table: any) => {
    const pkField = table.fields.find((field: any) => field.pk);
    return pkField ? pkField.name : "id";
  };

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

      const targetPkField = findPrimaryKeyField(targetTable);
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
