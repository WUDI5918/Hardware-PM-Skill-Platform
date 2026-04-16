import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

function DynamicArrayEditor({ items, onChange, itemTemplate }: { items: any[], onChange: (newItems: any[]) => void, itemTemplate: any }) {
  const handleUpdate = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...items, { ...itemTemplate }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (!items || items.length === 0) return <Button variant="outline" size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-2"/> Add Item</Button>;

  const fields = Object.keys(items[0]);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3 p-3 border rounded-md bg-muted/20 relative group">
          <div className="flex-1 grid grid-cols-2 gap-3">
            {fields.map(field => (
              <div key={field} className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">{field}</Label>
                <Input 
                  className="h-8 text-xs" 
                  value={item[field] || ''} 
                  onChange={(e) => handleUpdate(index, field, e.target.value)} 
                />
              </div>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemove(index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2"/> Add Item</Button>
    </div>
  );
}

function DynamicObjectEditor({ obj, onChange }: { obj: any, onChange: (newObj: any) => void }) {
  const handleUpdate = (field: string, value: any) => {
    onChange({ ...obj, [field]: value });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.keys(obj).map(field => (
        <div key={field} className="space-y-1">
          <Label className="text-xs">{field}</Label>
          <Input 
            className="h-8 text-xs" 
            value={obj[field] || ''} 
            onChange={(e) => handleUpdate(field, e.target.value)} 
          />
        </div>
      ))}
    </div>
  );
}

export function PropertyEditorDialog() {
  const { nodes, editingNodeId, setEditingNodeId, updateNodeData } = useStore();
  const node = nodes.find(n => n.id === editingNodeId);

  if (!node) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(node.id, { title: e.target.value, data: node.data.data });
  };

  const handleDataChange = (field: string, value: any) => {
    updateNodeData(node.id, { title: node.data.title, data: { ...node.data.data, [field]: value } });
  };

  const renderEditor = () => {
    const { type, data } = node.data;

    if (type === 'competitorRadar') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Dimensions (comma separated)</Label>
            <Input value={data.dimensions.join(', ')} onChange={(e) => handleDataChange('dimensions', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>Competitors</Label>
            <DynamicArrayEditor 
              items={data.competitors.map((c: any) => ({ name: c.name, scores: c.scores.join(', ') }))} 
              onChange={(items) => handleDataChange('competitors', items.map(i => ({ name: i.name, scores: i.scores.split(',').map((s: string) => parseFloat(s.trim()) || 0) })))} 
              itemTemplate={{ name: 'New Competitor', scores: '0, 0, 0, 0, 0' }} 
            />
          </div>
        </div>
      );
    }

    if (type === 'bomCalculator') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Target Cost ($)</Label>
            <Input type="number" value={data.targetCost} onChange={(e) => handleDataChange('targetCost', parseFloat(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>BOM Items</Label>
            <DynamicArrayEditor items={data.items} onChange={(items) => handleDataChange('items', items)} itemTemplate={{ name: 'New Item', cost: 0 }} />
          </div>
        </div>
      );
    }

    if (type === 'prdSpecs') {
      return (
        <div className="space-y-2">
          <Label>Specifications</Label>
          <DynamicObjectEditor obj={data} onChange={(newData) => updateNodeData(node.id, { title: node.data.title, data: newData })} />
        </div>
      );
    }

    if (type === 'userStoryMap') {
      return (
        <div className="space-y-2">
          <Label>User Stories</Label>
          <DynamicArrayEditor items={data.stories} onChange={(stories) => handleDataChange('stories', stories)} itemTemplate={{ role: 'User', action: 'do something', hardware: 'Component', feedback: 'Visual' }} />
        </div>
      );
    }

    if (type === 'milestoneRoadmap') {
      return (
        <div className="space-y-2">
          <Label>Milestone Phases</Label>
          <DynamicArrayEditor items={data.phases} onChange={(phases) => handleDataChange('phases', phases)} itemTemplate={{ name: 'New Phase', start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', status: 'pending' }} />
        </div>
      );
    }

    if (type === 'compliance') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Target Regions (comma separated)</Label>
            <Input value={data.regions.join(', ')} onChange={(e) => handleDataChange('regions', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>Certifications</Label>
            <DynamicArrayEditor items={data.certifications} onChange={(certs) => handleDataChange('certifications', certs)} itemTemplate={{ name: 'New Cert', region: 'Global', status: 'Not Started' }} />
          </div>
        </div>
      );
    }

    // Fallback JSON editor
    return (
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <Label>Data (JSON)</Label>
        <textarea 
          className="w-full flex-1 p-3 font-mono text-xs border rounded-md bg-[#f8fafc] focus:ring-1 focus:ring-primary outline-none resize-none"
          defaultValue={JSON.stringify(data, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateNodeData(node.id, { title: node.data.title, data: parsed });
            } catch (err) {}
          }}
        />
      </div>
    );
  };

  return (
    <Dialog open={!!editingNodeId} onOpenChange={(open) => !open && setEditingNodeId(null)}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Component Properties</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col gap-6 py-4">
          <div className="space-y-2 shrink-0">
            <Label>Component Title</Label>
            <Input value={node.data.title} onChange={handleTitleChange} className="font-semibold" />
          </div>
          <ScrollArea className="flex-1 pr-4">
            {renderEditor()}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
