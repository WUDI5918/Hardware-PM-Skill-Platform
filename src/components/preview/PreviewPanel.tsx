import React from 'react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

function PropertyEditor({ node }: { node: any }) {
  const updateNodeData = useStore(state => state.updateNodeData);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      updateNodeData(node.id, parsed);
    } catch (err) {
      // ignore parse errors while typing
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-lg">{node.data.title} Properties</h3>
      <div className="space-y-2">
        <Label>Data (JSON)</Label>
        <textarea 
          className="w-full h-64 p-2 font-mono text-sm border rounded-md"
          defaultValue={JSON.stringify(node.data.data, null, 2)}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

function ComponentRenderer({ node, mode }: { node: any, mode: string, [key: string]: any }) {
  const { type, data } = node.data;
  
  if (type === 'competitorRadar') {
    const dimensions = data?.dimensions || [];
    const competitors = data?.competitors || [];
    
    const chartData = dimensions.map((dim: string, index: number) => {
      const obj: any = { subject: dim };
      competitors.forEach((comp: any) => {
        if (comp.name && comp.scores && comp.scores[index] !== undefined) {
          obj[comp.name] = comp.scores[index];
        }
      });
      return obj;
    });

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                {competitors.map((comp: any, i: number) => (
                  <Radar key={comp.name} name={comp.name} dataKey={comp.name} stroke={i === 0 ? "#8884d8" : "#82ca9d"} fill={i === 0 ? "#8884d8" : "#82ca9d"} fillOpacity={0.6} />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'bomCalculator') {
    const items = data?.items || [];
    const targetCost = data?.targetCost || 0;
    
    const total = items.reduce((acc: number, item: any) => acc + (item.cost || 0), 0);
    const chartData = items.map((item: any) => ({ name: item.name || 'Unknown', cost: item.cost || 0 }));
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total BOM Cost</p>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Cost</p>
              <p className="text-2xl font-bold">${targetCost.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="cost" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'prdSpecs') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            {Object.entries(data || {}).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                <dd className="text-sm font-semibold">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    );
  }

  // Default fallback
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{node.data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

export function PreviewPanel() {
  const { nodes, selectedNodeId, previewMode, setPreviewMode } = useStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="w-[450px] border-l bg-background flex flex-col h-full">
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="properties" disabled={!selectedNode}>Properties</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="flex-1 m-0 overflow-hidden flex flex-col">
          <div className="p-2 border-b bg-muted/30 flex gap-2 justify-center">
            <button 
              className={`px-3 py-1 text-xs rounded-full ${previewMode === 'document' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              onClick={() => setPreviewMode('document')}
            >
              Document
            </button>
            <button 
              className={`px-3 py-1 text-xs rounded-full ${previewMode === 'presentation' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              onClick={() => setPreviewMode('presentation')}
            >
              Presentation
            </button>
            <button 
              className={`px-3 py-1 text-xs rounded-full ${previewMode === 'data' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              onClick={() => setPreviewMode('data')}
            >
              Data
            </button>
          </div>
          <ScrollArea className="flex-1 p-6">
            {nodes.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                Add components to the canvas to see preview.
              </div>
            ) : (
              <div className={previewMode === 'presentation' ? 'space-y-12' : 'space-y-6'}>
                {previewMode === 'data' ? (
                  <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                    {JSON.stringify(nodes.map(n => ({ type: n.data.type, data: n.data.data })), null, 2)}
                  </pre>
                ) : (
                  nodes.map(node => (
                    <ComponentRenderer key={node.id} node={node} mode={previewMode} />
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            {selectedNode ? (
              <PropertyEditor node={selectedNode} />
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Select a node to edit properties.
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
