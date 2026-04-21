import React, { useState } from 'react';
import { COMPONENT_DEFINITIONS } from '@/lib/components';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Box, Layers, Cpu, FileText, Map, ShieldCheck, ClipboardList, GitCommit, Table, AlertTriangle, LayoutTemplate, PieChart, Scale, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Flag, Type, SplitSquareHorizontal, Heading, TextQuote, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  alertBlock: <AlertCircle className="w-4 h-4 text-orange-500" />,
  techRiskAnalysis: <AlertTriangle className="w-4 h-4 text-rose-500" />,
  fmeaAnalysis: <AlertTriangle className="w-4 h-4 text-rose-500" />,
  marketAnalysis: <PieChart className="w-4 h-4 text-amber-500" />,
  productPrototype: <LayoutTemplate className="w-4 h-4 text-cyan-500" />,
  compAnalysis: <PieChart className="w-4 h-4 text-amber-500" />,
  compComparison: <Scale className="w-4 h-4 text-lime-600" />,
  mpStages: <Flag className="w-4 h-4 text-emerald-500" />,
  textBlock: <Type className="w-4 h-4 text-slate-600" />,
  divider: <SplitSquareHorizontal className="w-4 h-4 text-slate-400" />,
  docHeader: <Heading className="w-4 h-4 text-indigo-600" />,
  quoteBlock: <TextQuote className="w-4 h-4 text-sky-500" />
};

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  
  const categories = Array.from(new Set(COMPONENT_DEFINITIONS.map(c => c.category)));
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set([categories[0]])); // First category open by default

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (!isOpen) {
    return (
      <div className="w-[50px] border-r bg-card flex flex-col h-full items-center transition-all duration-300">
        <div className="p-4 border-b shrink-0 h-[52px]" />
        <div className="flex-1" />
        <div className="p-2 border-t shrink-0 flex justify-center w-full">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} title="展开组件库">
            <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[240px] border-r bg-card flex flex-col h-full transition-all duration-300">
      <div className="p-4 border-b flex justify-between items-center shrink-0 h-[52px]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">组件库</h2>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col pb-6">
            {categories.map((category) => {
              const isExpanded = expandedCats.has(category);
              return (
                <div key={category} className="flex flex-col border-b border-border">
                  <div 
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span>{category}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {isExpanded && (
                    <div className="flex flex-col bg-muted/5">
                      {COMPONENT_DEFINITIONS.filter(c => c.category === category).map(def => (
                        <div 
                          key={def.type} 
                          className="px-4 py-3 bg-card border-t border-border text-[13px] cursor-grab active:cursor-grabbing transition-colors hover:bg-muted/50 flex items-center gap-3 group"
                          draggable
                          onDragStart={(e) => onDragStart(e, def.type)}
                        >
                          <div className="text-muted-foreground group-hover:text-primary transition-colors">{icons[def.type]}</div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">{def.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      <div className="p-2 border-t shrink-0 flex justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)} title="隐藏组件库">
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
