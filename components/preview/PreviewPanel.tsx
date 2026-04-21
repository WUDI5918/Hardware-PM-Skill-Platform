import React from 'react';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ShieldCheck, AlertTriangle, Info, XCircle, CheckCircle, AlertCircle, Target, Layers, FileText, CheckCircle2 } from 'lucide-react';

function ComponentRenderer({ node }: { node: any, [key: string]: any }) {
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
                {competitors.map((comp: any, i: number) => {
                  const color = comp.color || (i === 0 ? "#8884d8" : i === 1 ? "#82ca9d" : "#ffc658");
                  return <Radar key={`${comp.name}-${i}`} name={comp.name} dataKey={comp.name} stroke={color} fill={color} fillOpacity={0.6} />
                })}
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
    
    // Normalize in case data has string formulas
    const normalizedItems = items.map((item: any) => ({
      ...item,
      cost: typeof item.cost === 'number' ? item.cost : (parseFloat(item.cost) || 0)
    }));
    
    const total = normalizedItems.reduce((acc: number, item: any) => acc + (item.cost || 0), 0);
    const chartData = normalizedItems.map((item: any) => ({ name: item.name || 'Unknown', cost: item.cost || 0 }));
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-6 border-b border-muted">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">BOM 总价预估</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-primary">¥{total.toFixed(2)}</span>
                {targetCost > 0 && (
                   <span className={`text-sm font-medium ${total > targetCost ? 'text-red-500' : 'text-emerald-500'}`}>
                     {total > targetCost ? `超标 ¥${(total - targetCost).toFixed(2)}` : `结余 ¥${(targetCost - total).toFixed(2)}`}
                   </span>
                )}
              </div>
            </div>
            {targetCost > 0 && (
              <div className="text-right">
                <p className="text-sm font-semibold text-muted-foreground mb-1">目标成本控制</p>
                <span className="text-xl font-bold">¥{targetCost.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
               <h4 className="text-sm font-semibold mb-3">物料明细</h4>
               <div className="border rounded-md overflow-hidden bg-slate-50/50">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-muted/50 text-xs text-muted-foreground">
                     <tr>
                       <th className="px-3 py-2 font-medium">名称</th>
                       <th className="px-3 py-2 font-medium">数量 / 单价</th>
                       <th className="px-3 py-2 text-right font-medium">小计</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {normalizedItems.map((item: any, idx: number) => (
                       <tr key={idx} className="bg-white/50 hover:bg-muted/20 transition-colors">
                         <td className="px-3 py-2 font-medium">{item.name}</td>
                         <td className="px-3 py-2 text-muted-foreground text-xs">
                           {item.qty !== undefined && item.price !== undefined 
                             ? `${item.qty} × ¥${item.price}` 
                             : '-'}
                         </td>
                         <td className="px-3 py-2 text-right font-semibold">¥{item.cost?.toFixed(2)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <div>
               <h4 className="text-sm font-semibold mb-3">成本占比分析</h4>
               <div className="h-[240px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
                     <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                     <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                       {
                         chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : index === 1 ? '#3b82f6' : '#60a5fa'} />
                         ))
                       }
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
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

  if (type === 'userStoryMap') {
    const personas = data?.personas || [];
    return (
      <Card className="mb-8 pl-6">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto custom-scrollbar bg-slate-50/40 relative p-6">
            {personas.map((persona: any, pIdx: number) => (
              <div key={persona.id} className="mb-12 last:mb-0">
                
                {/* Persona Header */}
                <div className="flex items-center gap-3 mb-6 sticky left-0 z-10 w-max bg-slate-50/90 py-1 pr-6 backdrop-blur-sm rounded-r-full">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600 shadow-sm border border-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 tracking-tight">作为角色：<span className="text-blue-600 font-black">{persona.role}</span></h3>
                </div>

                {/* Map Grid */}
                <div className="flex gap-4 items-start pl-6">
                  {persona.mainLines.map((main: any, mIdx: number) => (
                    <div key={main.id} className="min-w-[260px] w-[260px] flex-shrink-0 flex flex-col relative">
                      
                      {/* Line connector (Background) */}
                      {mIdx < persona.mainLines.length - 1 && (
                         <div className="absolute top-[2.25rem] left-[130px] w-full h-1 bg-gradient-to-r from-blue-300 to-blue-200 z-0"></div>
                      )}

                      {/* Main Node (Backbone) */}
                      <div className="bg-white border-t-4 border-t-blue-500 border border-slate-200 rounded-lg p-4 shadow-sm mb-6 relative z-10 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">{mIdx + 1}</div>
                          <div className="text-xs font-bold text-slate-400 tracking-wider">主线节点</div>
                        </div>
                        <div className="font-semibold text-slate-800 text-base leading-snug">{main.title}</div>
                      </div>

                      {/* Branch Nodes Column */}
                      <div className="flex flex-col gap-3 relative z-10 px-1">
                        {main.branches.map((branch: any) => (
                          <div key={branch.id} className="group relative">
                            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-default">
                              <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{branch.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
                
                {/* Divider between personas */}
                {pIdx < personas.length - 1 && (
                  <div className="w-full mt-10">
                    <div className="w-full h-px border-t-2 border-dashed border-slate-200"></div>
                  </div>
                )}
              </div>
            ))}
            
            {personas.length === 0 && (
               <div className="text-center py-12 text-slate-400">目前没有任何故事地图内容</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'milestoneRoadmap') {
    const phases = data?.phases || [];
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase: any, index: number) => (
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
    const regions = data?.regions || [];
    const certifications = data?.certifications || [];
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {regions.map((region: string) => (
              <span key={region} className="px-2 py-1 bg-muted rounded-md text-xs font-medium">{region}</span>
            ))}
          </div>
          <div className="space-y-2">
            {certifications.map((cert: any, index: number) => (
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
    const defaultCols = [
      { id: 'id', name: '编号' },
      { id: 'module', name: '所属模块' },
      { id: 'source', name: '来源' },
      { id: 'summary', name: '需求描述' },
      { id: 'assignee', name: '负责人' },
      { id: 'version', name: '目标版本' },
      { id: 'priority', name: '优先级' },
      { id: 'status', name: '状态' }
    ];
    const columns = data?.columns || defaultCols;
    const requirements = data?.requirements || [];
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>{node.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  {columns.map((col: any, idx: number) => (
                    <th key={col.id} className={`px-4 py-3 font-semibold text-muted-foreground ${idx > 0 ? 'border-l' : ''} ${col.id === 'summary' ? 'min-w-[250px] whitespace-normal' : ''} ${(col.id === 'priority' || col.id === 'assignee' || col.id === 'version') ? 'text-center' : ''}`}>
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requirements.map((req: any, index: number) => (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    {columns.map((col: any, idx: number) => {
                      const val = req[col.id] || '-';
                      
                      if (col.id === 'id') {
                        return <td key={col.id} className={`px-4 py-3 font-mono text-xs text-slate-500 ${idx > 0 ? 'border-l' : ''}`}>{val}</td>;
                      }
                      if (col.id === 'summary') {
                        return <td key={col.id} className={`px-4 py-3 font-medium text-slate-900 leading-relaxed max-w-[300px] whitespace-normal break-words ${idx > 0 ? 'border-l' : ''}`}>{val === '-' ? '' : val}</td>;
                      }
                      if (col.id === 'priority') {
                        const raw = req[col.id] || '中';
                        return (
                          <td key={col.id} className={`px-4 py-3 text-center align-middle ${idx > 0 ? 'border-l' : ''}`}>
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold leading-tight ${raw === '很高' ? 'bg-rose-100 text-rose-800' : raw === '高' ? 'bg-orange-100 text-orange-800' : raw === '中' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                              {raw}
                            </span>
                          </td>
                        );
                      }
                      if (col.id === 'status') {
                        const raw = req[col.id] || '待评估';
                        return (
                          <td key={col.id} className={`px-4 py-3 text-slate-700 font-medium ${idx > 0 ? 'border-l' : ''}`}>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                raw === '已实现' ? 'bg-emerald-500' : 
                                raw === '开发中' ? 'bg-blue-500' : 
                                raw === '规划中' ? 'bg-amber-500' : 
                                raw === '已拒绝' ? 'bg-rose-500' : 
                                'bg-slate-300'
                              }`}></div>
                              {raw}
                            </div>
                          </td>
                        );
                      }
                      if (col.id === 'version') {
                        return <td key={col.id} className={`px-4 py-3 text-center font-mono text-xs text-slate-600 ${idx > 0 ? 'border-l' : ''}`}>{val}</td>;
                      }
                      if (col.id === 'assignee') {
                        return <td key={col.id} className={`px-4 py-3 text-center text-slate-600 ${idx > 0 ? 'border-l' : ''}`}>{val}</td>;
                      }

                      // Default column mapping
                      return <td key={col.id} className={`px-4 py-3 text-slate-700 font-medium ${idx > 0 ? 'border-l' : ''}`}>{val === '-' ? '' : val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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

  if (type === 'alertBlock') {
    const getAlertStyle = () => {
      switch (data.alertType) {
        case 'error': return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900';
        case 'success': return 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900';
        case 'info': return 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900';
        case 'warning':
        default: 
          return 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900';
      }
    };
    
    const getIcon = () => {
      switch (data.alertType) {
        case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
        case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'info': return <Info className="w-5 h-5 text-blue-500" />;
        case 'warning':
        default: 
          return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      }
    };

    return (
      <div className={`mb-6 p-4 border rounded-lg flex items-start gap-4 shadow-sm ${getAlertStyle()}`}>
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-1">
          {data.title && <h5 className="font-bold text-sm tracking-tight">{data.title}</h5>}
          <div className="text-sm opacity-90 leading-relaxed font-medium">
            {data.content}
          </div>
        </div>
      </div>
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

  if (type === 'marketAnalysis') {
    const widgets = data?.widgets || [];

    // --- Formula Evaluator Helper ---
    const evaluateFormulas = (items: any[]) => {
      const context: Record<string, number> = {};
      
      // First pass: extract explicit metrics with simple numeric values
      items.forEach(w => {
        if (w.type === 'metric' && w.value && !isNaN(Number(w.value))) {
          context[w.id] = Number(w.value);
        }
      });

      const parseCalc = (expr: string) => {
        if (!expr) return 0;
        let str = String(expr);
        Object.keys(context).forEach(k => {
          str = str.replace(new RegExp(`\\b${k}\\b`, 'g'), String(context[k]));
        });
        try {
          const val = new Function(`return ${str}`)();
          return isNaN(val) ? 0 : Number(val.toFixed(2));
        } catch(e) {
          return 0;
        }
      };

      // Second pass: recursive eval formulas
      let changed = true;
      let depth = 0;
      while(changed && depth < 5) {
        changed = false;
        items.forEach(w => {
          if (w.type === 'metric' && w.formula && context[w.id] === undefined) {
             const val = parseCalc(w.formula);
             if (val !== undefined && val !== 0 && !isNaN(val)) {
                context[w.id] = val;
                changed = true;
             }
          }
        });
        depth++;
      }

      // Attach resolved data to widgets
      return items.map(w => {
         const resolvedW = { ...w };
         if (w.type === 'metric') {
           resolvedW._resolvedValue = context[w.id] !== undefined ? context[w.id] : (w.value ? parseCalc(w.value) : parseCalc(w.formula) || 0);
         } else if (w.type === 'radar' && w.radarData) {
           const dims = (w.radarData.dimensions || '').split(',').map((d: string) => d.trim());
           const seriesList = w.radarData.series || [];
           const radarChartData = dims.map((dim: string, index: number) => {
             const obj: any = { subject: dim };
             seriesList.forEach((s: any) => {
               if (s.name && s.scores) {
                 const scoreArr = s.scores.split(',').map((sc: string) => sc.trim());
                 obj[s.name] = parseCalc(scoreArr[index] || '0');
               }
             });
             return obj;
           });
           resolvedW._resolvedData = radarChartData;
         } else {
           resolvedW._resolvedData = (w.data || []).map((dp: any) => ({
             ...dp,
             _resolvedValue: dp.value ? parseCalc(dp.value) : 0
           }));
         }
         return resolvedW;
      });
    };

    const resolvedWidgets = evaluateFormulas(widgets);
    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
      <Card className="mb-6 border-none ring-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pb-6 pt-0">
          <CardTitle>{node.data.title}</CardTitle>
          {node.data.description && <p className="text-sm text-muted-foreground mt-1">{node.data.description}</p>}
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex flex-wrap gap-6">
            {resolvedWidgets.map((w: any, idx: number) => {
              const widthClass = w.layoutWidth === 'full' ? 'w-full' : w.layoutWidth === 'third' ? 'w-full lg:w-[calc(33.333%-16px)]' : 'w-full lg:w-[calc(50%-12px)]';

              if (w.type === 'metric') {
                 return (
                   <div key={w.id} className="min-w-[200px] flex-1 bg-white p-5 rounded-2xl border border-slate-200/60 text-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="text-4xl font-black text-slate-800 tracking-tight flex items-baseline justify-center gap-1.5 mb-2">
                       {w.prefix && <span className="text-xl text-slate-400 font-bold">{w.prefix}</span>}
                       {(w._resolvedValue || 0).toLocaleString()}
                       {w.suffix && <span className="text-xl text-slate-400 font-bold">{w.suffix}</span>}
                     </div>
                     <div className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">{w.title}</div>
                     {w.formula && <div className="absolute bottom-2 right-3 text-[10px] font-mono text-amber-500/80 bg-amber-50 px-1.5 py-0.5 rounded italic">fx</div>}
                   </div>
                 );
              }

              if (w.type === 'radar') {
                 const seriesList = w.radarData?.series || [];
                 return (
                   <div key={w.id} className={`${widthClass} p-6 border border-slate-200/60 rounded-2xl shadow-sm bg-white`}>
                     <h4 className="font-extrabold text-slate-800 mb-2 flex items-center gap-2"><span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>{w.title}</h4>
                     <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="75%" data={w._resolvedData}>
                           <PolarGrid stroke="#e2e8f0" />
                           <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 11}} />
                           <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fill: '#94a3b8', fontSize: 10}} />
                           <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 500, color: '#475569'}} />
                           {seriesList.map((s: any, sIdx: number) => {
                             const color = s.color || CHART_COLORS[sIdx % CHART_COLORS.length];
                             return <Radar key={`${s.name}-${sIdx}`} name={s.name} dataKey={s.name} stroke={color} fill={color} fillOpacity={0.3} />
                           })}
                         </RadarChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 );
              }

              if (w.type === 'bar') {
                 return (
                   <div key={w.id} className={`${widthClass} p-6 border border-slate-200/60 rounded-2xl shadow-sm bg-white`}>
                     <h4 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2"><span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>{w.title}</h4>
                     <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={w._resolvedData}>
                           <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dx={-10} />
                           <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                           <Bar dataKey="_resolvedValue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 );
              }

              if (w.type === 'line') {
                 return (
                   <div key={w.id} className={`${widthClass} p-6 border border-slate-200/60 rounded-2xl shadow-sm bg-white`}>
                     <h4 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2"><span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>{w.title}</h4>
                     <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={w._resolvedData}>
                           <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dx={-10} />
                           <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                           <Line type="monotone" dataKey="_resolvedValue" stroke="#10b981" strokeWidth={4} dot={{r: 5, strokeWidth: 3, fill: '#fff'}} activeDot={{r: 7, strokeWidth: 0, fill: '#10b981'}} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 );
              }

              if (w.type === 'pie') {
                 return (
                   <div key={w.id} className={`${widthClass} p-6 border border-slate-200/60 rounded-2xl shadow-sm bg-white`}>
                     <h4 className="font-extrabold text-slate-800 mb-2 flex items-center gap-2"><span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>{w.title}</h4>
                     <div className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie 
                             data={w._resolvedData} 
                             cx="50%" cy="50%" 
                             innerRadius={65} outerRadius={95} 
                             paddingAngle={5} 
                             dataKey="_resolvedValue"
                             nameKey="label"
                           >
                             {w._resolvedData.map((_: any, index: number) => (
                               <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                             ))}
                           </Pie>
                           <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 500, color: '#475569'}} />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 );
              }

              return null;
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'techRiskAnalysis') {
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
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">风险项</th>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">发生概率</th>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">影响程度</th>
                  <th className="px-4 py-3 font-semibold border-b border-r last:border-r-0 text-muted-foreground whitespace-nowrap">应对策略</th>
                </tr>
              </thead>
              <tbody>
                {(data.risks || []).map((item: any, index: number) => (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 border-r font-semibold">{item.risk}</td>
                    <td className="px-4 py-3 border-r">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.probability === '高' ? 'bg-red-100 text-red-800' : item.probability === '中' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {item.probability}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r">{item.impact}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'fmeaAnalysis') {
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
                  <th className="px-4 py-3 font-semibold border-b border-r text-muted-foreground whitespace-nowrap">分析层级</th>
                  <th className="px-4 py-3 font-semibold border-b border-r text-muted-foreground whitespace-nowrap">失效模式</th>
                  <th className="px-4 py-3 font-semibold border-b border-r text-muted-foreground whitespace-nowrap">失效原因 & 影响</th>
                  <th className="px-4 py-3 font-semibold border-b border-r text-muted-foreground whitespace-nowrap text-center">严重度</th>
                  <th className="px-4 py-3 font-semibold border-b text-muted-foreground whitespace-nowrap">预防措施</th>
                </tr>
              </thead>
              <tbody>
                {(data.items || []).map((item: any, index: number) => (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 border-r font-semibold text-muted-foreground">{item.phase}</td>
                    <td className="px-4 py-3 border-r text-rose-600 font-medium">{item.failureMode}</td>
                    <td className="px-4 py-3 border-r">
                      <div className="text-xs text-muted-foreground mb-1">原因: {item.cause}</div>
                      <div className="text-xs text-muted-foreground">后果: {item.effect}</div>
                    </td>
                    <td className="px-4 py-3 border-r text-center font-bold text-amber-600">{item.severity}</td>
                    <td className="px-4 py-3">{item.prevention}</td>
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
      <Card className="mb-6 border-slate-200/60 shadow-sm">
        <CardHeader className="flex flex-row items-end justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <CardTitle>{node.data.title}</CardTitle>
            {data.prototypeName && <span className="text-[13px] text-slate-500">{data.prototypeName}</span>}
          </div>
          {data.status && <span className="mb-1 text-[12px] px-2.5 py-0.5 bg-slate-100 text-slate-600 font-medium rounded">{data.status}</span>}
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            {data.showImage && data.imageUrl && (
              <div className="w-full lg:w-5/12 shrink-0">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center min-h-[300px]">
                  <img src={data.imageUrl} alt="Prototype" className="object-contain w-full h-auto max-h-[500px] rounded" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
          
          <div className="flex flex-col gap-8 flex-1 w-full">
            {data.description && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> 设计概要</h4>
                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
              </div>
            )}
            
            {data.targetAudience && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" /> 目标受众</h4>
                <p className="text-[15px] text-slate-600 leading-relaxed font-medium">{data.targetAudience}</p>
              </div>
            )}
            
            {data.features && data.features.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> 重点验证项</h4>
                <ul className="space-y-4">
                  {data.features.map((feat: any, idx: number) => (
                    <li key={idx} className="flex flex-col">
                      <span className="font-semibold text-slate-800 flex items-start gap-2">
                        <span className="text-slate-400 mt-1 text-[10px]">■</span> {feat.name}
                      </span>
                      {feat.notes && <span className="text-[14px] text-slate-500 mt-1 ml-4 leading-relaxed">{feat.notes}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 渲染额外的自定义字段 */}
            {data.customFields && Object.keys(data.customFields).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                {Object.entries(data.customFields).map(([key, value]) => (
                   <div key={key}>
                     <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-slate-400" /> {key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                     <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{String(value)}</p>
                   </div>
                ))}
              </div>
            )}
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
