import React from 'react';
import { COMPONENT_DEFINITIONS } from '@/lib/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Box, Layers, Cpu, FileText, Map, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const icons: Record<string, React.ReactNode> = {
  competitorRadar: <Map className="w-4 h-4 text-blue-500" />,
  bomCalculator: <Box className="w-4 h-4 text-green-500" />,
  prdSpecs: <FileText className="w-4 h-4 text-purple-500" />,
  userStoryMap: <Layers className="w-4 h-4 text-orange-500" />,
  milestoneRoadmap: <Cpu className="w-4 h-4 text-red-500" />,
  compliance: <ShieldCheck className="w-4 h-4 text-teal-500" />,
};

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(new Set(COMPONENT_DEFINITIONS.map(c => c.category)));

  return (
    <div className="w-[240px] border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Component Library</h2>
      </div>
      <div className="p-4 border-b bg-muted/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Global Variables</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger className="h-8 text-xs bg-[#f1f5f9] border-border">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="cny">CNY (¥)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Development Phase</Label>
            <Select defaultValue="evt">
              <SelectTrigger className="h-8 text-xs bg-[#f1f5f9] border-border">
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concept">Concept</SelectItem>
                <SelectItem value="evt">EVT</SelectItem>
                <SelectItem value="dvt">DVT</SelectItem>
                <SelectItem value="pvt">PVT</SelectItem>
                <SelectItem value="mp">MP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {categories.map(category => (
            <div key={category} className="flex flex-col">
              <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                {category}
              </div>
              <div className="p-3 flex flex-col gap-2">
                {COMPONENT_DEFINITIONS.filter(c => c.category === category).map(def => (
                  <div 
                    key={def.type} 
                    className="px-3 py-2.5 bg-[#f8fafc] border border-border rounded-lg text-[13px] cursor-grab active:cursor-grabbing transition-all hover:border-primary hover:bg-secondary flex items-center gap-2"
                    draggable
                    onDragStart={(e) => onDragStart(e, def.type)}
                  >
                    {icons[def.type]}
                    <span className="font-medium">{def.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
