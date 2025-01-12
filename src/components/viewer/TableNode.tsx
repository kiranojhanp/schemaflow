import { Handle, Position } from "@xyflow/react";

interface TableField {
  name: string;
  type: string;
  isPrimary: boolean;
}

const TableNode: React.FC<any> = ({ data }) => (
  <div className="w-56 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg">
    {/* Table Header */}
    <div className="bg-gray-50 px-2 py-1.5 border-b border-gray-200">
      <div className="text-sm font-semibold text-gray-700">{data.label}</div>
    </div>

    {/* Fields Container - Removed divide-y for more compact layout */}
    <div className="text-xs">
      {data.fields?.map((field: TableField, index: number) => (
        <div
          key={index}
          className="px-2 py-0.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-1">
            {field.isPrimary && (
              <div className="flex-shrink-0 w-1 h-1 bg-blue-500 rounded-full" />
            )}
            <span className="text-gray-700 truncate">{field.name}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
            {field.type}
          </span>

          {/* Handles */}
          <Handle
            type="target"
            position={Position.Left}
            id={`${field.name}-target`}
            className="!bg-gray-400 !border-2 !border-white !w-2 !h-2"
            style={{
              left: -4,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: field.name.endsWith("_id") || field.isPrimary ? 1 : 0,
              pointerEvents:
                field.name.endsWith("_id") || field.isPrimary ? "auto" : "none",
            }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${field.name}-source`}
            className="!bg-gray-400 !border-2 !border-white !w-2 !h-2"
            style={{
              right: -4,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: field.name.endsWith("_id") || field.isPrimary ? 1 : 0,
              pointerEvents:
                field.name.endsWith("_id") || field.isPrimary ? "auto" : "none",
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

export default TableNode;
