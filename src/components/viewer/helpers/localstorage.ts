import Database from "@dbml/core/types/model_structure/database";
import { Node } from "@xyflow/react";

// Function to generate a unique key for localStorage based on the database schema
export const getStorageKey = (database: Database): string => {
  // Create a unique key based on table names and their fields
  const tableSignature = database.schemas
    .flatMap((schema) =>
      schema.tables.map(
        (table) => `${table.name}:${table.fields.map((f) => f.name).join(",")}`
      )
    )
    .sort()
    .join("|");

  return `flow-positions-${tableSignature}`;
};

// Function to get saved position of tables from localStorage
export const getSavedPositions = (storageKey: string) => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error loading saved positions:", error);
    return null;
  }
};

// Function to set position of tables to localStorage
export const setPositions = (storageKey: string, nodes: Node[]) => {
  const positions = nodes.reduce(
    (acc, node) => ({
      ...acc,
      [node.id]: node.position,
    }),
    {}
  );

  try {
    localStorage.setItem(storageKey, JSON.stringify(positions));
  } catch (error) {
    console.error("Error saving positions:", error);
  }
};
