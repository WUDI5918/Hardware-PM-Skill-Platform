import React from 'react';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ShieldCheck } from 'lucide-react';

function ComponentRenderer({ node }: { node: any }) {
  const { type, data } = node.data;
  
  if (type === 'competitorRadar') {
    const chartData = data.dimensions.map((dim: string, index: number) => {
      const obj: any = { subject: dim };
      data.competitors.forEach((comp: any) => {
        obj[comp.name] = comp.scores[index];
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
                {data.competitors.map((comp: any, i: number) => (
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
    const total = data.items.reduce((acc: number, item: any) => acc + item.cost, 0);
    const chartData = data.items.map((item: any) => ({ name: item.name, cost: item.cost }));
    
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
              <p className="text-2xl font-bold">${data.targetCost.toFixed(2)}</p>
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
            {Object.entries(data).map(([key, value]) => (
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

  if (type === 'userStoryMap') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stories.map((story: any, index: number) => (
              <div key={index} className="flex items-start gap-4 p-3 border rounded-md bg-muted/20">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium"><span className="text-muted-foreground">As a</span> {story.role}, <span className="text-muted-foreground">I want to</span> {story.action}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md dark:bg-orange-900 dark:text-orange-100">HW: {story.hardware}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md dark:bg-green-900 dark:text-green-100">Feedback: {story.feedback}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'milestoneRoadmap') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.phases.map((phase: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm font-bold text-right">{phase.name}</div>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden relative">
                  <div 
                    className={`absolute top-0 bottom-0 left-0 ${phase.status === 'completed' ? 'bg-green-500' : phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    style={{ width: phase.status === 'completed' ? '100%' : phase.status === 'in-progress' ? '50%' : '0%' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-white mix-blend-difference">
                    <span>{phase.start}</span>
                    <span>{phase.end}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'compliance') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.regions.map((region: string) => (
              <span key={region} className="px-2 py-1 bg-muted rounded-md text-xs font-medium">{region}</span>
            ))}
          </div>
          <div className="space-y-2">
            {data.certifications.map((cert: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{cert.name}</span>
                  <span className="text-xs text-muted-foreground">({cert.region})</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${cert.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : cert.status === 'Not Started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
                  {cert.status}
                </span>
              </div>
            ))}
          </div>
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
  const { nodes } = useStore();
  
  // Sort nodes by Y position to reflect top-to-bottom layout in canvas
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

  return (
    <div className="h-full flex flex-col bg-card w-full">
      <div className="p-4 border-b shrink-0 bg-muted/10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Document Preview</h2>
      </div>
      <ScrollArea className="flex-1 p-6">
        {sortedNodes.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20 text-sm">
            Add components to the canvas to see preview.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedNodes.map(node => (
              <ComponentRenderer key={node.id} node={node} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
