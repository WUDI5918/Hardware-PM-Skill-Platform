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
              <p className="text-sm text-muted-foreground">BOM 总成本</p>
              <p className="text-2xl font-bold">¥{total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">目标成本</p>
              <p className="text-2xl font-bold">¥{data.targetCost.toFixed(2)}</p>
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
                  <p className="text-sm font-medium"><span className="text-muted-foreground">作为</span> {story.role}, <span className="text-muted-foreground">我想要</span> {story.action}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md dark:bg-orange-900 dark:text-orange-100">硬件: {story.hardware}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md dark:bg-green-900 dark:text-green-100">反馈: {story.feedback}</span>
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

  if (type === 'userRequirements') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.requirements.map((req: any, index: number) => (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">{req.id} - {req.summary}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${req.priority === '高' ? 'bg-red-100 text-red-800' : req.priority === '中' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {req.priority} 优先级
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span><span className="font-semibold">来源:</span> {req.source}</span>
                  <span><span className="font-semibold">状态:</span> {req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'mpStages') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stages?.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm items-start">
                <div className="w-16 h-16 rounded-md flex-shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex flex-col items-center justify-center font-black border-2 border-emerald-500/20 shadow-inner">
                  <span className="text-xl tracking-tighter">{item.stage}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-sm tracking-tight">{item.name}</h4>
                  <div className="text-[13px] text-muted-foreground bg-muted/30 p-2 rounded leading-relaxed border border-border/50">
                    {item.cnDesc}
                  </div>
                  <div className="text-[12px] text-muted-foreground opacity-80 pl-2 border-l-2 border-muted-foreground/30 font-serif italic">
                    {item.enDesc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'docHeader') {
    return (
      <div className="mb-8 border-b-2 border-primary/20 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-4">{data.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono bg-muted/20 inline-flex px-4 py-2 rounded-lg">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 版本 {data.version}</span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 作者: {data.author}</span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 更新日期: {data.date}</span>
        </div>
      </div>
    );
  }

  if (type === 'textBlock') {
    return (
      <div className="mb-6 prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {data.content}
      </div>
    );
  }

  if (type === 'quoteBlock') {
    return (
      <figure className="mb-6 border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg">
        <blockquote className="text-sm italic font-medium leading-relaxed text-foreground/80 mb-2">
          {data.text}
        </blockquote>
        {data.author && (
          <figcaption className="text-xs text-muted-foreground font-semibold flex items-center gap-2 before:content-['—']">
            {data.author}
          </figcaption>
        )}
      </figure>
    );
  }

  if (type === 'divider') {
    return (
      <div className={`w-full py-4 mb-6 flex items-center justify-center opacity-70`}>
        <div 
          className="w-full" 
          style={{ 
            borderTopWidth: `${data.thickness}px`, 
            borderTopStyle: data.style, 
            borderColor: data.color 
          }} 
        />
      </div>
    );
  }

  if (type === 'stepBar') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start w-full bg-[#f4f7f9] p-8 rounded-lg overflow-x-auto">
            {data.steps.map((step: any, index: number) => {
              const isActive = index + 1 === data.currentStep;
              const isLast = index === data.steps.length - 1;
              
              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col flex-shrink-0 w-32">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-sans text-sm
                        ${isActive ? 'bg-[#6366f1] text-white shadow-md' : 'bg-white text-muted-foreground border-2 border-[#e2e8f0]'}`}
                      >
                        {index + 1}
                      </div>
                      <span className={`ml-3 font-bold text-sm ${isActive ? 'text-[#6366f1]' : 'text-muted-foreground'}`}>
                        {step.title}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col pl-1">
                      <span className="text-red-600 text-sm font-bold min-h-[20px]">{step.description}</span>
                      {step.date && <span className="text-xs text-muted-foreground mt-1 min-h-[16px]">{step.date}</span>}
                    </div>
                  </div>
                  
                  {!isLast && (
                    <div className="flex-1 flex items-center pt-5 min-w-[20px] px-2">
                       <div className="h-[2px] w-full bg-[#e2e8f0]"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'table') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead style={{ backgroundColor: data.headerColor || '#f8fafc' }}>
                <tr>
                  {data.headers.map((h: string, i: number) => (
                    <th key={i} className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx} className="border-b last:border-b-0">
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className="px-4 py-3 border-r last:border-r-0 break-words">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'techRiskFmea') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">步骤</th>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">定义与分析阶段</th>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">关键思考点</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 border-r last:border-r-0 w-16 text-center font-bold text-muted-foreground">{item.step}</td>
                    <td className="px-4 py-3 border-r last:border-r-0 w-48">
                      <div className="font-semibold text-primary">{item.phase}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.task}</div>
                    </td>
                    <td className="px-4 py-3 border-r last:border-r-0">
                      {item.thinkingPoint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'productPrototype') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{node.data.title} - {data.prototypeName}</span>
            <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">{data.status}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {data.showImage && data.imageUrl && (
              <div className="w-full md:w-1/2 rounded-lg border overflow-hidden shrink-0 bg-muted/20 flex items-center justify-center p-2">
                <img src={data.imageUrl} alt="Prototype" className="object-contain w-full h-auto max-h-[300px] rounded" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1">设计概要</h4>
                <p className="text-sm">{data.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1">目标测试受众</h4>
                <p className="text-sm border-l-2 border-primary pl-2">{data.targetAudience}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-2">交互与体验重点验证项</h4>
                <ul className="space-y-2">
                  {data.features.map((feat: any, idx: number) => (
                    <li key={idx} className="flex flex-col bg-muted/10 p-2 rounded border border-border/50 text-sm">
                      <span className="font-semibold text-primary">{feat.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">{feat.notes}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'compAnalysis') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.competitors.map((comp: any, idx: number) => (
              <div key={idx} className="bg-muted/10 p-4 border rounded-lg">
                <div className="flex flex-col mb-3">
                  <h4 className="text-lg font-bold text-primary">{comp.name}</h4>
                  <span className="text-sm font-semibold text-muted-foreground">{comp.positioning}</span>
                </div>
                <div className="space-y-3 mt-4 text-sm">
                  <div>
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold mb-1">优势 (Strengths)</span>
                    <p className="text-muted-foreground">{comp.strengths}</p>
                  </div>
                  <div>
                    <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold mb-1">劣势 (Weaknesses)</span>
                    <p className="text-muted-foreground">{comp.weaknesses}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'compComparison') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap bg-muted/30">对比维度</th>
                  {data.products.map((prod: string, i: number) => (
                    <th key={i} className={`px-4 py-3 font-bold border-b border-r last:border-r-0 whitespace-nowrap ${i === 0 ? 'text-primary' : 'text-slate-700'}`}>
                      {prod} {i === 0 && <span className="text-xs font-normal ml-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded">本品</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.features.map((feat: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3 border-r last:border-r-0 font-semibold text-muted-foreground bg-muted/5">{feat.name}</td>
                    {feat.values.map((val: string, vIdx: number) => (
                      <td key={vIdx} className={`px-4 py-3 border-r last:border-r-0 ${vIdx === 0 ? 'bg-primary/[0.02] font-medium' : ''}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
    <div className="h-full flex flex-col bg-card w-full border-l">
      <div className="p-4 border-b shrink-0 bg-muted/5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          文档预览
        </h2>
      </div>
      <ScrollArea className="flex-1 p-6">
        {sortedNodes.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20 text-sm">
            请在画布上添加组件以查看预览。
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
