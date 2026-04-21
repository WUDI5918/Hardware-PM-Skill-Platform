import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Box, Layers, Cpu, FileText, Map, ShieldCheck, Trash2, ClipboardList, GitCommit, Table, AlertTriangle, LayoutTemplate, PieChart, Scale, Flag, Type, SplitSquareHorizontal, Heading, TextQuote, Edit2 } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  competitorRadar: <Map className="w-4 h-4 text-blue-500" />,
  bomCalculator: <Box className="w-4 h-4 text-green-500" />,
  prdSpecs: <FileText className="w-4 h-4 text-purple-500" />,
  userStoryMap: <Layers className="w-4 h-4 text-orange-500" />,
  milestoneRoadmap: <Cpu className="w-4 h-4 text-red-500" />,
  compliance: <ShieldCheck className="w-4 h-4 text-teal-500" />,
  userRequirements: <ClipboardList className="w-4 h-4 text-indigo-500" />,
  stepBar: <GitCommit className="w-4 h-4 text-pink-500" />,
  table: <Table className="w-4 h-4 text-slate-500" />,
  alertBlock: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  techRiskAnalysis: <AlertTriangle className="w-4 h-4 text-rose-500" />,
  fmeaAnalysis: <AlertTriangle className="w-4 h-4 text-rose-500" />,
  marketAnalysis: <PieChart className="w-4 h-4 text-amber-500" />,
  compAnalysis: <PieChart className="w-4 h-4 text-amber-500" />,
  compComparison: <Scale className="w-4 h-4 text-lime-600" />,
  productPrototype: <LayoutTemplate className="w-4 h-4 text-cyan-500" />,
  mpStages: <Flag className="w-4 h-4 text-emerald-500" />,
  textBlock: <Type className="w-4 h-4 text-slate-600" />,
  divider: <SplitSquareHorizontal className="w-4 h-4 text-slate-400" />,
  docHeader: <Heading className="w-4 h-4 text-indigo-600" />,
  quoteBlock: <TextQuote className="w-4 h-4 text-sky-500" />
};

export function CustomComponentNode({ data, id, selected }: any) {
  const setSelectedNodeId = useStore(state => state.setSelectedNodeId);
  const deleteNode = useStore(state => state.deleteNode);
  const setIsPropertyExpanded = useStore(state => state.setIsPropertyExpanded);

  return (
    <div 
      className={cn(
        "w-[240px] bg-white rounded-xl border p-4 transition-all cursor-pointer group", 
        selected ? "ring-2 ring-primary border-primary shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]" : "border-border shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)]"
      )}
      onClick={() => setSelectedNodeId(id)}
      onDoubleClick={() => {
        setSelectedNodeId(id);
        setIsPropertyExpanded(true);
      }}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-primary border-2 border-white" />
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          {icons[data.type] || <Box className="w-4 h-4 text-slate-400" />}
          <span className="text-sm font-bold truncate max-w-[100px]">{data.title}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setSelectedNodeId(id);
              setIsPropertyExpanded(true); 
            }} 
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            title="编辑属性"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteNode(id); }} 
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            title="删除组件"
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
