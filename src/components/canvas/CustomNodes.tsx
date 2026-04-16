import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function CustomComponentNode({ data, id, selected }: any) {
  const setSelectedNodeId = useStore(state => state.setSelectedNodeId);

  return (
    <Card 
      className={cn("w-64 shadow-md transition-all", selected ? "ring-2 ring-primary" : "")}
      onClick={() => setSelectedNodeId(id)}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <CardHeader className="p-3 bg-muted/30 border-b">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground line-clamp-2">
          {data.description}
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
}
