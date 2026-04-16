import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Box, Layers, Cpu, FileText, Map, ShieldCheck, Trash2 } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  competitorRadar: <Map className="w-4 h-4 text-blue-500" />,
  bomCalculator: <Box className="w-4 h-4 text-green-500" />,
  prdSpecs: <FileText className="w-4 h-4 text-purple-500" />,
  userStoryMap: <Layers className="w-4 h-4 text-orange-500" />,
  milestoneRoadmap: <Cpu className="w-4 h-4 text-red-500" />,
  compliance: <ShieldCheck className="w-4 h-4 text-teal-500" />,
};

export function CustomComponentNode({ data, id, selected }: any) {
  const setSelectedNodeId = useStore(state => state.setSelectedNodeId);
  const setEditingNodeId = useStore(state => state.setEditingNodeId);
  const deleteNode = useStore(state => state.deleteNode);

  return (
    <div 
      className={cn(
        "w-[240px] bg-white rounded-xl border p-4 transition-all cursor-pointer", 
        selected ? "ring-2 ring-primary border-primary shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]" : "border-border shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)]"
      )}
      onClick={() => setSelectedNodeId(id)}
      onDoubleClick={() => setEditingNodeId(id)}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-primary border-2 border-white" />
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          {icons[data.type]}
          <span className="text-sm font-bold">{data.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#10b981]">● Online</span>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteNode(id); }} 
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Delete Component"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground line-clamp-2">
        {data.description}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-primary border-2 border-white" />
    </div>
  );
}
