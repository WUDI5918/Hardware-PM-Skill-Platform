import React from 'react';
import { COMPONENT_DEFINITIONS } from '@/lib/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(new Set(COMPONENT_DEFINITIONS.map(c => c.category)));

  return (
    <div className="w-80 border-r bg-muted/20 flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Component Library</h2>
        <p className="text-sm text-muted-foreground">Drag and drop to canvas</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{category}</h3>
              <div className="space-y-2">
                {COMPONENT_DEFINITIONS.filter(c => c.category === category).map(def => (
                  <Card 
                    key={def.type} 
                    className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                    draggable
                    onDragStart={(e) => onDragStart(e, def.type)}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{def.title}</CardTitle>
                      <CardDescription className="text-xs">{def.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
