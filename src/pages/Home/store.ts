import { create } from "zustand";
import {
  Node,
  Edge,
  Connection,
  ConnectionLineType,
  MarkerType,
  ColorMode,
  FitView,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import { Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import Ref from "@dbml/core/types/model_structure/ref";
import * as monaco from "monaco-editor";
import { StartupCode } from "@/components/editor/constant";
import { getStorageKey } from "@/components/viewer/helpers/localstorage";
import { getLayoutedElements } from "@/components/viewer/helpers/dbml-flow";

interface DBMLState {
  // Editor State
  code: string;
  database: Database | null;
  editorModel: monaco.editor.ITextModel | null;
  parser: Parser;
  colorMode: ColorMode;

  // Flow Viewer State
  nodes: Node[];
  edges: Edge[];

  // Editor Actions
  setCode: (code: string) => void;
  setEditorModel: (model: monaco.editor.ITextModel | null) => void;
  setColorMode: (mode: ColorMode) => void;
  parseDBML: (code: string) => ParseResult;
  setMarkers: (markers: monaco.editor.IMarkerData[]) => void;
  clearMarkers: () => void;
  updateViewerFromDatabase: (database: Database) => void;

  // Flow Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  persistPositions: (storageKey: string) => void;
  onLayout: (direction: string, fitView: FitView) => void;
  handleNodesChange: (changes: NodeChange[]) => void;
  loadSavedPositions: (storageKey: string) => any;
}

// Helper type for parse results
type ParseResult =
  | { success: true; database: Database }
  | { success: false; error: unknown };

// =============== Store Implementation ===============

// Initialize parser and default database
const parser = new Parser();
const initialDatabase = parser.parse(StartupCode, "dbmlv2") as Database;

export const useDBMLStore = create<DBMLState>((set, get) => ({
  // -------- Initial State --------
  code: StartupCode,
  database: initialDatabase,
  editorModel: null,
  parser: parser,
  colorMode: "light",
  nodes: [],
  edges: [],

  // -------- Editor Actions --------
  setCode: (code) => set({ code }),
  setEditorModel: (model) => set({ editorModel: model }),
  setColorMode: (mode) => set({ colorMode: mode }),

  parseDBML: (code) => {
    try {
      const parser = get().parser;
      const newDB = parser.parse(code, "dbmlv2") as Database;

      set({ database: newDB });
      get().clearMarkers();
      get().updateViewerFromDatabase(newDB);

      return { success: true, database: newDB };
    } catch (error) {
      return { success: false, error };
    }
  },

  updateViewerFromDatabase: (database: Database) => {
    if (!database) return;

    // Get initial layout
    const { nodes: initialNodes, edges: initialEdges } =
      parseDatabaseToReactFlow(database);

    // Preserve existing node positions
    const currentNodes = get().nodes;
    const nodesWithPositions = initialNodes.map((node: Node) => {
      const existingNode = currentNodes.find((n) => n.id === node.id);
      return existingNode ? { ...node, position: existingNode.position } : node;
    });

    set({ nodes: nodesWithPositions, edges: initialEdges });
  },

  // Editor markers management
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

  // -------- Flow Actions --------
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      type: ConnectionLineType.SmoothStep,
      animated: true,
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  // Position management
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

  loadSavedPositions: (storageKey) => {
    const savedPositions = localStorage.getItem(storageKey);
    return savedPositions ? JSON.parse(savedPositions) : {};
  },

  // Layout management
  onLayout: (direction, fitView) => {
    const { nodes: initialNodes, edges: initialEdges } =
      parseDatabaseToReactFlow(get().database!);
    const savedPositions = get().loadSavedPositions(
      getStorageKey(get().database!)
    );

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      savedPositions,
      direction
    );

    get().setNodes(layoutedNodes);
    get().setEdges(layoutedEdges);

    setTimeout(() => fitView({ padding: 0.2 }), 0);
  },

  handleNodesChange: (changes) => {
    get().onNodesChange(changes);
    get().persistPositions(getStorageKey(get().database!));
  },
}));

// =============== Helper Functions ===============

/**
 * Converts a DBML database structure into React Flow nodes and edges
 */
const parseDatabaseToReactFlow = (database: Database) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Helper to find primary key field
  const findPrimaryKeyField = (table: any) => {
    const pkField = table.fields.find((field: any) => field.pk);
    return pkField ? pkField.name : "id";
  };

  // Process each schema in the database
  database.schemas.forEach((schema) => {
    // Create nodes for tables
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

    // Create edges for relationships
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
