import React from 'react';
import { useStore } from '@/store/useStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Settings2 } from 'lucide-react';

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

  if (!items || items.length === 0) return <Button variant="outline" size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-2"/> 添加项</Button>;

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
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2"/> 添加项</Button>
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

export function PropertyPanel() {
  const { nodes, selectedNodeId, updateNodeData } = useStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-muted-foreground bg-card border-l">
        <Settings2 className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">组件属性面板</p>
        <p className="text-xs text-center mt-2 opacity-60">请在中间主画布中点击选中一个组件，即可在此处快捷修改其内容。</p>
      </div>
    );
  }

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
            <Label>维度 (逗号分隔)</Label>
            <Input value={data.dimensions.join(', ')} onChange={(e) => handleDataChange('dimensions', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>竞品列表</Label>
            <DynamicArrayEditor 
              items={data.competitors.map((c: any) => ({ name: c.name, scores: c.scores.join(', ') }))} 
              onChange={(items) => handleDataChange('competitors', items.map(i => ({ name: i.name, scores: i.scores.split(',').map((s: string) => parseFloat(s.trim()) || 0) })))} 
              itemTemplate={{ name: '新竞品', scores: '0, 0, 0, 0, 0' }} 
            />
          </div>
        </div>
      );
    }

    if (type === 'bomCalculator') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>目标成本 (¥)</Label>
            <Input type="number" value={data.targetCost} onChange={(e) => handleDataChange('targetCost', parseFloat(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>BOM 物料</Label>
            <DynamicArrayEditor items={data.items} onChange={(items) => handleDataChange('items', items)} itemTemplate={{ name: '新物料', cost: 0 }} />
          </div>
        </div>
      );
    }

    if (type === 'prdSpecs') {
      return (
        <div className="space-y-2">
          <Label>规格参数</Label>
          <DynamicObjectEditor obj={data} onChange={(newData) => updateNodeData(node.id, { title: node.data.title, data: newData })} />
        </div>
      );
    }

    if (type === 'userStoryMap') {
      return (
        <div className="space-y-2">
          <Label>用户故事</Label>
          <DynamicArrayEditor items={data.stories} onChange={(stories) => handleDataChange('stories', stories)} itemTemplate={{ role: '用户', action: '做某事', hardware: '硬件组件', feedback: '视觉反馈' }} />
        </div>
      );
    }

    if (type === 'milestoneRoadmap') {
      return (
        <div className="space-y-2">
          <Label>里程碑阶段</Label>
          <DynamicArrayEditor items={data.phases} onChange={(phases) => handleDataChange('phases', phases)} itemTemplate={{ name: '新阶段', start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', status: 'pending' }} />
        </div>
      );
    }

    if (type === 'mpStages') {
      return (
        <div className="space-y-6">
          <Label className="text-sm font-semibold">量产关键阶段详情</Label>
          <div className="space-y-4">
            {data.stages?.map((stage: any, index: number) => (
              <div key={index} className="p-4 border rounded-xl relative flex flex-col gap-4 bg-muted/5 group">
                <div className="flex gap-4">
                  <div className="w-1/3 space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">阶段简称</Label>
                    <Input 
                      className="font-bold text-emerald-600 bg-background" 
                      value={stage.stage} 
                      onChange={e => { const newStages = [...data.stages]; newStages[index].stage = e.target.value; handleDataChange('stages', newStages); }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">完整阶段名称</Label>
                    <Input 
                      className="font-medium bg-background" 
                      value={stage.name} 
                      onChange={e => { const newStages = [...data.stages]; newStages[index].name = e.target.value; handleDataChange('stages', newStages); }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">中文解释</Label>
                  <textarea 
                    className="w-full text-sm p-3 border rounded-md min-h-[80px] resize-y bg-background focus:ring-1 focus:ring-primary outline-none" 
                    value={stage.cnDesc} 
                    onChange={e => { const newStages = [...data.stages]; newStages[index].cnDesc = e.target.value; handleDataChange('stages', newStages); }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">English Description</Label>
                  <textarea 
                    className="w-full text-sm p-3 border rounded-md min-h-[80px] resize-y bg-background focus:ring-1 focus:ring-primary outline-none font-serif" 
                    value={stage.enDesc} 
                    onChange={e => { const newStages = [...data.stages]; newStages[index].enDesc = e.target.value; handleDataChange('stages', newStages); }}
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm" 
                  onClick={() => {
                    const newStages = data.stages.filter((_: any, i: number) => i !== index);
                    handleDataChange('stages', newStages);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full border-dashed" 
              onClick={() => {
                const newStages = [...(data.stages || []), { stage: 'NPI', name: 'New Product Introduction', cnDesc: '新产品导入', enDesc: 'New Product Introduction phase' }];
                handleDataChange('stages', newStages);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> 添加量产阶段
            </Button>
          </div>
        </div>
      );
    }

    if (type === 'compliance') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>目标区域 (逗号分隔)</Label>
            <Input value={data.regions.join(', ')} onChange={(e) => handleDataChange('regions', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>认证列表</Label>
            <DynamicArrayEditor items={data.certifications} onChange={(certs) => handleDataChange('certifications', certs)} itemTemplate={{ name: '新认证', region: 'Global', status: 'Not Started' }} />
          </div>
        </div>
      );
    }

    if (type === 'userRequirements') {
      return (
        <div className="space-y-2">
          <Label>需求列表</Label>
          <DynamicArrayEditor items={data.requirements} onChange={(reqs) => handleDataChange('requirements', reqs)} itemTemplate={{ id: 'REQ-XXX', source: '需求来源', summary: '需求描述', priority: '高/中/低', status: '状态' }} />
        </div>
      );
    }

    if (type === 'docHeader') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>文档标题</Label>
            <Input value={data.title} onChange={(e) => handleDataChange('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>版本号</Label>
              <Input value={data.version} onChange={(e) => handleDataChange('version', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>作者</Label>
              <Input value={data.author} onChange={(e) => handleDataChange('author', e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>更新日期</Label>
              <Input type="date" value={data.date} onChange={(e) => handleDataChange('date', e.target.value)} />
            </div>
          </div>
        </div>
      );
    }

    if (type === 'textBlock') {
      return (
        <div className="space-y-2 flex-1 flex flex-col min-h-0">
          <Label>文本内容</Label>
          <textarea 
            className="w-full flex-1 p-3 text-sm border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none min-h-[200px]"
            value={data.content}
            onChange={(e) => handleDataChange('content', e.target.value)}
            placeholder="在此输入正文内容..."
          />
        </div>
      );
    }

    if (type === 'quoteBlock') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>引言内容</Label>
            <textarea 
              className="w-full text-sm p-3 border rounded-md min-h-[100px] resize-y bg-background focus:ring-1 focus:ring-primary outline-none"
              value={data.text}
              onChange={(e) => handleDataChange('text', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>出处或作者</Label>
            <Input value={data.author} onChange={(e) => handleDataChange('author', e.target.value)} placeholder="引言的作者，例如：Steve Jobs" />
          </div>
        </div>
      );
    }

    if (type === 'divider') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>线条样式</Label>
            <select 
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={data.style}
              onChange={(e) => handleDataChange('style', e.target.value)}
            >
              <option value="solid">实线 (Solid)</option>
              <option value="dashed">虚线 (Dashed)</option>
              <option value="dotted">点线 (Dotted)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>线条颜色</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-9 p-1 rounded cursor-pointer" value={data.color} onChange={(e) => handleDataChange('color', e.target.value)} />
                <Input type="text" className="flex-1" value={data.color} onChange={(e) => handleDataChange('color', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>线条粗细 (px)</Label>
              <Input type="number" min="1" max="10" value={data.thickness} onChange={(e) => handleDataChange('thickness', parseInt(e.target.value) || 1)} />
            </div>
          </div>
        </div>
      );
    }

    if (type === 'stepBar') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>当前进度阶段 (数字)</Label>
            <Input type="number" value={data.currentStep} onChange={(e) => handleDataChange('currentStep', parseInt(e.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label>步骤节点</Label>
            <DynamicArrayEditor items={data.steps} onChange={(steps) => handleDataChange('steps', steps)} itemTemplate={{ title: '新步骤', description: '描述', date: '时间节点' }} />
          </div>
        </div>
      );
    }

    if (type === 'table') {
      const addColumn = () => {
        const newHeaders = [...data.headers, `新列 ${data.headers.length + 1}`];
        const newRows = data.rows.map((row: string[]) => [...row, '']);
        updateNodeData(node.id, { title: node.data.title, data: { ...data, headers: newHeaders, rows: newRows } });
      };
      
      const removeColumn = (cIdx: number) => {
        const newHeaders = data.headers.filter((_: any, i: number) => i !== cIdx);
        const newRows = data.rows.map((row: string[]) => row.filter((_, i) => i !== cIdx));
        updateNodeData(node.id, { title: node.data.title, data: { ...data, headers: newHeaders, rows: newRows } });
      };
      
      const addRow = () => {
        const newRow = Array(data.headers.length).fill('');
        const newRows = [...data.rows, newRow];
        updateNodeData(node.id, { title: node.data.title, data: { ...data, rows: newRows } });
      };
      
      const removeRow = (rIdx: number) => {
        const newRows = data.rows.filter((_: any, i: number) => i !== rIdx);
        updateNodeData(node.id, { title: node.data.title, data: { ...data, rows: newRows } });
      };
      
      const updateHeader = (cIdx: number, val: string) => {
        const newHeaders = [...data.headers];
        newHeaders[cIdx] = val;
        updateNodeData(node.id, { title: node.data.title, data: { ...data, headers: newHeaders } });
      };
      
      const updateCell = (rIdx: number, cIdx: number, val: string) => {
        const newRows = [...data.rows];
        newRows[rIdx] = [...newRows[rIdx]];
        newRows[rIdx][cIdx] = val;
        updateNodeData(node.id, { title: node.data.title, data: { ...data, rows: newRows } });
      };

      return (
        <div className="space-y-6">
           <div className="space-y-2">
             <Label>表头背景色</Label>
             <div className="flex gap-2 items-center">
               <Input type="color" className="w-12 h-8 p-1 rounded cursor-pointer" value={data.headerColor || '#f8fafc'} onChange={(e) => handleDataChange('headerColor', e.target.value)} />
               <Input type="text" className="flex-1 h-8" value={data.headerColor || '#f8fafc'} onChange={(e) => handleDataChange('headerColor', e.target.value)} />
             </div>
           </div>
           
           <div className="space-y-2">
             <div className="flex justify-between items-center">
               <Label>表格数据配置</Label>
             </div>
             
             <div className="overflow-x-auto border rounded-md p-3 bg-muted/10 w-full">
               <div className="flex gap-2 mb-3">
                 <Button variant="outline" size="sm" onClick={addColumn}><Plus className="w-4 h-4 mr-1"/> 添加列</Button>
                 <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1"/> 添加行</Button>
               </div>
               
               <div className="min-w-max space-y-2 pb-2">
                 {/* Headers row */}
                 <div className="flex gap-2">
                   {data.headers.map((h: string, cIdx: number) => (
                     <div key={cIdx} className="flex-1 min-w-[120px] flex px-1 gap-1 items-center bg-muted/30 p-1.5 rounded-md">
                       <Input className="h-8 text-sm font-semibold flex-1 min-w-[80px]" value={h} onChange={(e) => updateHeader(cIdx, e.target.value)} placeholder="表头名称" />
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeColumn(cIdx)}><Trash2 className="w-4 h-4" /></Button>
                     </div>
                   ))}
                   <div className="w-8 shrink-0"></div>
                 </div>
                 
                 {/* Data rows */}
                 {data.rows.map((row: string[], rIdx: number) => (
                   <div key={rIdx} className="flex gap-2 items-center">
                     {row.map((cell: string, cIdx: number) => (
                       <div key={cIdx} className="flex-1 min-w-[120px] px-1">
                         <Input className="h-8 text-sm" value={cell} onChange={(e) => updateCell(rIdx, cIdx, e.target.value)} />
                       </div>
                     ))}
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeRow(rIdx)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      );
    }

    if (type === 'techRiskFmea') {
      return (
        <div className="space-y-2">
          <Label>FMEA 分析七步流程</Label>
          <DynamicArrayEditor 
            items={data.items} 
            onChange={(items) => handleDataChange('items', items)} 
            itemTemplate={{ step: '0', phase: '新阶段', task: '操作内容', thinkingPoint: '关键思考点' }} 
          />
        </div>
      );
    }

    if (type === 'productPrototype') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showImage"
              checked={data.showImage}
              onChange={(e) => handleDataChange('showImage', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="showImage" className="cursor-pointer">显示产品原型参考图</Label>
          </div>

          {data.showImage && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label>图片链接 (URL)</Label>
              <div className="flex gap-2">
                <Input value={data.imageUrl} onChange={(e) => handleDataChange('imageUrl', e.target.value)} placeholder="https://..." />
                <Button variant="outline" size="icon" onClick={() => handleDataChange('imageUrl', '')} title="清空图片"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>原型版本名称</Label>
              <Input value={data.prototypeName} onChange={(e) => handleDataChange('prototypeName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>当前状态</Label>
              <Input value={data.status} onChange={(e) => handleDataChange('status', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>设计概要描述</Label>
            <textarea
              className="w-full p-2 text-sm border rounded-md min-h-[60px]"
              value={data.description}
              onChange={(e) => handleDataChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>目标受众群体</Label>
            <Input value={data.targetAudience} onChange={(e) => handleDataChange('targetAudience', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>交互与测试重点</Label>
            <DynamicArrayEditor
              items={data.features}
              onChange={(features) => handleDataChange('features', features)}
              itemTemplate={{ name: '新交互点', notes: '验证说明' }}
            />
          </div>
        </div>
      );
    }

    if (type === 'compAnalysis') {
      return (
        <div className="space-y-2">
          <Label>竞品分析列表</Label>
          <DynamicArrayEditor
            items={data.competitors}
            onChange={(comps) => handleDataChange('competitors', comps)}
            itemTemplate={{ name: '新竞品', positioning: '市场定位', strengths: '优势分析', weaknesses: '劣势分析' }}
          />
        </div>
      );
    }

    if (type === 'compComparison') {
      const addProduct = () => {
        const newProducts = [...data.products, `竞品 ${data.products.length}`];
        const newFeatures = data.features.map((f: any) => ({ ...f, values: [...f.values, ''] }));
        updateNodeData(node.id, { title: node.data.title, data: { ...data, products: newProducts, features: newFeatures } });
      };
      
      const removeProduct = (pIdx: number) => {
        const newProducts = data.products.filter((_: any, i: number) => i !== pIdx);
        const newFeatures = data.features.map((f: any) => ({ ...f, values: f.values.filter((_: any, i: number) => i !== pIdx) }));
        updateNodeData(node.id, { title: node.data.title, data: { ...data, products: newProducts, features: newFeatures } });
      };
      
      const addFeature = () => {
        const newFeature = { name: '新对比项', values: Array(data.products.length).fill('') };
        const newFeatures = [...data.features, newFeature];
        updateNodeData(node.id, { title: node.data.title, data: { ...data, features: newFeatures } });
      };
      
      const removeFeature = (fIdx: number) => {
        const newFeatures = data.features.filter((_: any, i: number) => i !== fIdx);
        updateNodeData(node.id, { title: node.data.title, data: { ...data, features: newFeatures } });
      };
      
      const updateProduct = (pIdx: number, val: string) => {
        const newProducts = [...data.products];
        newProducts[pIdx] = val;
        updateNodeData(node.id, { title: node.data.title, data: { ...data, products: newProducts } });
      };
      
      const updateFeatureName = (fIdx: number, val: string) => {
        const newFeatures = [...data.features];
        newFeatures[fIdx] = { ...newFeatures[fIdx], name: val };
        updateNodeData(node.id, { title: node.data.title, data: { ...data, features: newFeatures } });
      };

      const updateFeatureValue = (fIdx: number, vIdx: number, val: string) => {
        const newFeatures = [...data.features];
        newFeatures[fIdx].values = [...newFeatures[fIdx].values];
        newFeatures[fIdx].values[vIdx] = val;
        updateNodeData(node.id, { title: node.data.title, data: { ...data, features: newFeatures } });
      };

      return (
        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <Label>参数对照表配置</Label>
           </div>
           
           <div className="overflow-x-auto border rounded-md p-3 bg-muted/10 w-full">
             <div className="flex gap-2 mb-3">
               <Button variant="outline" size="sm" onClick={addProduct}><Plus className="w-4 h-4 mr-1"/> 添加对比产品</Button>
               <Button variant="outline" size="sm" onClick={addFeature}><Plus className="w-4 h-4 mr-1"/> 添加对比维度</Button>
             </div>
             
             <div className="min-w-max space-y-2 pb-2">
               {/* Header row (Products) */}
               <div className="flex gap-2">
                 <div className="w-[150px] shrink-0 font-semibold text-sm text-center flex items-center justify-center bg-muted/30 rounded-md text-muted-foreground mr-1">对比维度</div>
                 {data.products.map((prod: string, pIdx: number) => (
                   <div key={pIdx} className="flex-1 min-w-[150px] flex px-1 gap-1 items-center bg-muted/30 p-1.5 rounded-md">
                     <Input className="h-8 text-sm font-semibold flex-1 min-w-[80px]" value={prod} onChange={(e) => updateProduct(pIdx, e.target.value)} placeholder="产品名称" />
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeProduct(pIdx)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                 ))}
                 <div className="w-8 shrink-0"></div>
               </div>
               
               {/* Data rows (Features) */}
               {data.features.map((feat: any, fIdx: number) => (
                 <div key={fIdx} className="flex gap-2 items-center">
                   <div className="w-[150px] shrink-0 mr-1">
                     <Input className="h-8 text-sm bg-muted/5 font-medium" value={feat.name} onChange={(e) => updateFeatureName(fIdx, e.target.value)} placeholder="维度名称" />
                   </div>
                   {feat.values.map((val: string, vIdx: number) => (
                     <div key={vIdx} className="flex-1 min-w-[150px] px-1">
                       <Input className="h-8 text-sm" value={val} onChange={(e) => updateFeatureValue(fIdx, vIdx, e.target.value)} />
                     </div>
                   ))}
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeFeature(fIdx)}><Trash2 className="w-4 h-4" /></Button>
                 </div>
               ))}
             </div>
           </div>
        </div>
      );
    }

    // Fallback JSON editor
    return (
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <Label>数据 (JSON)</Label>
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
    <div className="h-full flex flex-col bg-card border-l">
      <div className="p-4 border-b shrink-0 flex items-center justify-between bg-muted/5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          组件属性
        </h2>
      </div>
      <div className="p-4 border-b shrink-0 bg-muted/5 space-y-2">
        <Label className="text-xs text-muted-foreground">组件标题</Label>
        <Input value={node.data.title} onChange={handleTitleChange} className="font-semibold bg-background" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 pb-20">
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}
