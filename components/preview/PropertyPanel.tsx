import React from 'react';
import { useStore } from '@/store/useStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Settings2, ChevronUp, ChevronDown, X, XCircle } from 'lucide-react';

function DynamicTextSectionEditor({ obj, onChange }: { obj: Record<string, string>, onChange: (newObj: Record<string, string>) => void }) {
  const entries = Object.entries(obj || {});

  const updateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey) return;
    const newObj = { ...obj };
    newObj[newKey] = newObj[oldKey];
    delete newObj[oldKey];
    onChange(newObj);
  };

  const updateValue = (key: string, value: string) => {
    onChange({ ...obj, [key]: value });
  };

  const addField = () => {
    const newKey = `新区块 ${entries.length + 1}`;
    onChange({ ...obj, [newKey]: '' });
  };

  const removeField = (key: string) => {
    const newObj = { ...obj };
    delete newObj[key];
    onChange(newObj);
  };

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div key={key} className="relative group gap-2 flex flex-col p-3 border border-border/50 bg-slate-50/50 rounded-lg">
          <div className="flex items-center justify-between">
            <Input 
              className="h-7 text-sm font-semibold bg-transparent border-none shadow-none focus-visible:ring-1 px-1 w-2/3" 
              defaultValue={key} 
              onBlur={(e) => updateKey(key, e.target.value)} 
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeField(key)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <textarea 
            className="w-full text-xs p-2 min-h-[60px] bg-white border border-border/60 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/30" 
            value={value} 
            onChange={(e) => updateValue(key, e.target.value)} 
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addField} className="w-full border-dashed bg-white text-blue-600"><Plus className="w-3.5 h-3.5 mr-2"/> 添加描述区块</Button>
    </div>
  );
}

function DynamicArrayEditor({ items, onChange, itemTemplate, hideFormulas }: { items: any[], onChange: (newItems: any[]) => void, itemTemplate: any, hideFormulas?: boolean }) {
  const [activeInput, setActiveInput] = React.useState<{index: number, field: string} | null>(null);

  const evaluateAll = (inputItems: any[]) => {
     if (hideFormulas) return inputItems;
     const newItems = inputItems.map(item => ({...item, _formulas: {...(item._formulas || {})}}));
     const resolveValue = (rIdx: number, fName: string, visited: Set<string>): any => {
        const item = newItems[rIdx];
        if (!item) return 0;
        const formulaStr = item._formulas && item._formulas[fName];
        if (!formulaStr) {
           // Return the raw value if no formula
           return item[fName];
        }
        
        const path = `R${rIdx}.${fName}`;
        if (visited.has(path)) return 0;
        visited.add(path);

        try {
            let parsedExpr = String(formulaStr).substring(1);
            parsedExpr = parsedExpr.replace(/\{([^}]+)\}/g, (match, innerField) => {
                const rowRefMatch = innerField.match(/^R(\d+)\.(.+)$/);
                if (rowRefMatch) {
                    const tIdx = parseInt(rowRefMatch[1], 10) - 1;
                    const refVal = resolveValue(tIdx, rowRefMatch[2], visited);
                    return isNaN(Number(refVal)) || refVal === "" ? `"${refVal}"` : refVal;
                } else {
                    const refVal = resolveValue(rIdx, innerField, visited);
                    return isNaN(Number(refVal)) || refVal === "" ? `"${refVal}"` : refVal;
                }
            });
            // eslint-disable-next-line
            const result = new Function(`return ${parsedExpr}`)();
            const finalNum = !isNaN(result) && result !== null ? Number(result.toFixed(4)) : result;
            item[fName] = finalNum; 
            return finalNum;
        } catch(e) {
            return 0; // return 0 on evaluation failure
        }
     };

     for (let i = 0; i < newItems.length; i++) {
         const item = newItems[i];
         if (item._formulas) {
             for (const key of Object.keys(item._formulas)) {
                 item[key] = resolveValue(i, key, new Set());
             }
         }
     }
     return newItems;
  };

  const handleUpdate = (index: number, field: string, value: any) => {
    if (hideFormulas) {
       const newItems = [...items];
       newItems[index] = { ...newItems[index], [field]: value };
       onChange(newItems);
       return;
    }
    const newItems = items.map(item => ({...item, _formulas: {...(item._formulas || {})}}));
    const currentItem = newItems[index];
    
    if (typeof value === 'string' && value.startsWith('=')) {
        currentItem._formulas[field] = value;
    } else {
        delete currentItem._formulas[field];
        currentItem[field] = isNaN(Number(value)) || value === '' ? value : Number(value);
    }
    onChange(evaluateAll(newItems));
  };

  const handleAdd = () => {
    const newItem = { ...itemTemplate };
    if (!hideFormulas) {
        if (!newItem._formulas) newItem._formulas = {};
        for (const key in itemTemplate) {
            if (typeof itemTemplate[key] === 'string' && itemTemplate[key].startsWith('=')) {
                newItem._formulas[key] = itemTemplate[key];
                newItem[key] = 0; 
            }
        }
    }
    const newItems = [...items, newItem];
    onChange(hideFormulas ? newItems : evaluateAll(newItems));
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(hideFormulas ? newItems : evaluateAll(newItems));
  };

  const insertText = (text: string) => {
    if (hideFormulas) return;
    if (activeInput) {
       const { index, field } = activeInput;
       const item = items[index];
       const currentVal = String((item._formulas && item._formulas[field] !== undefined) ? item._formulas[field] : (item[field] || ''));
       let newVal = currentVal;
       if (currentVal === '' || !isNaN(Number(currentVal))) {
          newVal = '=' + text;
       } else {
          newVal = currentVal + text;
       }
       handleUpdate(index, field, newVal);
    }
  };

  if (!items || items.length === 0) return <Button variant="outline" size="sm" onClick={handleAdd} className="w-full border-dashed bg-white text-blue-600"><Plus className="w-4 h-4 mr-2"/> 添加项</Button>;

  const fields = Object.keys(items[0]).filter(k => k !== '_formulas');

  return (
    <div className="space-y-1 bg-white border rounded-lg p-2 overflow-x-auto">
      <div className="flex items-center gap-2 px-1 pb-2 border-b border-muted">
        {fields.map(field => (
          <div key={field} className="flex-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
             {field === 'name' ? '名称' : field === 'notes' ? '说明' : field} {field === 'cost' ? '(¥)' : ''}
          </div>
        ))}
        <div className="w-8 shrink-0"></div>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 py-1 relative group hover:bg-slate-50 rounded-md transition-colors flex-wrap">
          {fields.map(field => {
            const hasFormula = !hideFormulas && item._formulas && item._formulas[field] !== undefined;
            return (
              <div key={field} className="flex-1 relative">
                <Input 
                  className="h-8 text-xs bg-transparent border-transparent hover:border-slate-300 focus-visible:bg-white shadow-none focus-visible:ring-1 px-2" 
                  value={hasFormula ? item._formulas[field] : (item[field] || '')} 
                  onChange={(e) => handleUpdate(index, field, e.target.value)} 
                  onFocus={() => setActiveInput({ index, field })}
                  placeholder={typeof itemTemplate[field] === 'number' ? '0' : ''}
                />
                {hasFormula && (
                  <div className="absolute right-1 top-[5px] text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded pointer-events-none font-mono font-bold shadow-sm whitespace-nowrap overflow-hidden max-w-[80%] overflow-ellipsis">
                     = {Number(item[field]).toFixed(2).replace(/\.00$/, '')}
                  </div>
                )}
              </div>
            );
          })}
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" onClick={() => handleRemove(index)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {!hideFormulas && (
        <div className="flex flex-wrap gap-2 mt-2 p-2 bg-slate-50 border rounded-md items-center shadow-inner">
          <span className="text-[10px] text-slate-500 font-medium">✨点此快捷插入变量 (光标要在输入框里):</span>
          {fields.filter(f => f !== 'name' && f !== 'notes').map(f => (
             <button key={f} onClick={() => insertText(`{${f}}`)} className="px-1.5 py-0.5 bg-white border border-slate-200 shadow-sm rounded text-[10px] hover:border-primary hover:text-primary text-slate-700 font-mono transition-colors active:scale-95">
               {`{${f}}`}
             </button>
          ))}
          <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
          <span className="text-[10px] text-slate-500 font-medium ml-1">跨行求和(例):</span>
          <button onClick={() => insertText(`{R1.cost}+{R2.cost}`)} className="px-1.5 py-0.5 bg-white border border-slate-200 shadow-sm rounded text-[10px] hover:border-primary hover:text-primary text-slate-700 font-mono transition-colors active:scale-95">
             {`{R1.cost}`}
           </button>
        </div>
      )}
      <div className="pt-2">
        <Button variant="ghost" size="sm" onClick={handleAdd} className="w-full text-xs h-7 text-blue-600 bg-blue-50/50 hover:bg-blue-50"><Plus className="w-3.5 h-3.5 mr-1"/> 增加 {itemTemplate.name ? '项目' : '行'}</Button>
      </div>
    </div>
  );
}

function DynamicObjectEditor({ obj, onChange }: { obj: any, onChange: (newObj: any) => void }) {
  const entries = Object.entries(obj || {});

  const updateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey) return;
    const newObj = { ...obj };
    newObj[newKey] = newObj[oldKey];
    delete newObj[oldKey];
    onChange(newObj);
  };

  const updateValue = (key: string, value: any) => {
    onChange({ ...obj, [key]: value });
  };

  const addField = () => {
    const newKey = `新参数 ${entries.length + 1}`;
    onChange({ ...obj, [newKey]: '' });
  };

  const removeField = (key: string) => {
    const newObj = { ...obj };
    delete newObj[key];
    onChange(newObj);
  };

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2 items-center group relative bg-transparent">
          <div className="flex-1 space-y-1">
             <Label className="text-[11px] text-slate-500">参数名</Label>
             <Input className="h-7 text-xs bg-transparent border-none shadow-none focus-visible:ring-1 px-1" defaultValue={key} onBlur={(e) => updateKey(key, e.target.value)} />
          </div>
          <div className="flex-1 space-y-1">
             <Label className="text-[11px] text-slate-500">参数值</Label>
             <Input className="h-7 text-xs bg-transparent border shadow-sm focus-visible:ring-1" value={value as string} onChange={(e) => updateValue(key, e.target.value)} />
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 absolute -right-2 top-4" onClick={() => removeField(key)}>
            <XCircle className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addField} className="w-full border-dashed bg-white h-8 text-blue-600 hover:bg-blue-50">
        <Plus className="w-3.5 h-3.5 mr-1"/> 添加参数
      </Button>
    </div>
  );
}

export function PropertyPanel() {
  const { nodes, selectedNodeId, updateNodeData, isPropertyExpanded, setIsPropertyExpanded } = useStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-muted-foreground bg-card border-l relative">
        {isPropertyExpanded && (
           <Button size="sm" onClick={() => setIsPropertyExpanded(false)} variant="secondary" className="absolute top-4 right-4 shadow-sm">返回排版页面</Button>
        )}
        <Settings2 className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">组件属性面板</p>
        <p className="text-xs text-center mt-2 opacity-60">请双击中间主画布中的组件，全屏编辑其属性。</p>
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
      const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
      const dims = data.dimensions || [];
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>维度 (逗号分隔)</Label>
            <Input value={dims.join(', ')} onChange={(e) => handleDataChange('dimensions', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>竞品列表</Label>
            <div className="space-y-3">
              {(data.competitors || []).map((comp: any, cIdx: number) => (
                 <div key={cIdx} className="p-3 border border-slate-200 rounded-lg bg-slate-50 relative group">
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => {
                        const newComps = [...data.competitors];
                        newComps.splice(cIdx, 1);
                        handleDataChange('competitors', newComps);
                    }}>
                       <XCircle className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-3 mb-3 pr-8">
                        <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer" value={comp.color || DEFAULT_COLORS[cIdx % DEFAULT_COLORS.length]} onChange={(e) => {
                            const newComps = [...data.competitors];
                            newComps[cIdx] = { ...comp, color: e.target.value };
                            handleDataChange('competitors', newComps);
                        }} title="自定义颜色" />
                        <Input className="h-8 shadow-none bg-white flex-1" value={comp.name} placeholder="竞品名称" onChange={(e) => {
                            const newComps = [...data.competitors];
                            newComps[cIdx] = { ...comp, name: e.target.value };
                            handleDataChange('competitors', newComps);
                        }} />
                    </div>
                    <div>
                        <Label className="text-[11px] text-slate-400 block mb-2">雷达分值 (按维度对应)</Label>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {dims.map((dim: string, dIdx: number) => (
                                <div key={dIdx} className="flex-1">
                                    <Label className="text-[10px] text-slate-500 line-clamp-1" title={dim}>{dim}</Label>
                                    <Input className="h-7 text-xs shadow-none mt-0.5" value={comp.scores[dIdx] !== undefined ? comp.scores[dIdx] : ''} type="number" onChange={(e) => {
                                        const newComps = [...data.competitors];
                                        const newScores = [...(comp.scores || [])];
                                        newScores[dIdx] = parseFloat(e.target.value) || 0;
                                        newComps[cIdx] = { ...comp, scores: newScores };
                                        handleDataChange('competitors', newComps);
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 border-dashed bg-white text-blue-600 hover:bg-blue-50" onClick={() => {
                  const newComps = [...(data.competitors || [])];
                  newComps.push({ name: '新竞品', scores: new Array(dims.length).fill(0), color: DEFAULT_COLORS[newComps.length % DEFAULT_COLORS.length] });
                  handleDataChange('competitors', newComps);
              }}><Plus className="w-3.5 h-3.5 mr-1" /> 添加竞品</Button>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'bomCalculator') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>目标成本 (¥)</Label>
            <Input type="number" value={data.targetCost ?? 0} onChange={(e) => handleDataChange('targetCost', parseFloat(e.target.value))} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <Label>BOM 物料</Label>
              <span className="text-[10px] text-muted-foreground mr-1">支持在字段中输入 &quot;=公式&quot; (如 ={"{qty}*{price}"})</span>
            </div>
            <DynamicArrayEditor 
              items={data.items && data.items.length > 0 && typeof data.items[0] === 'object' && !('qty' in data.items[0]) 
                ? data.items.map((i: any) => ({ name: i.name, qty: 1, price: i.cost, cost: i.cost }))
                : data.items} 
              onChange={(items) => handleDataChange('items', items)} 
              itemTemplate={{ name: '新物料', qty: 1, price: 0, cost: '={qty}*{price}' }} 
            />
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
      const personas = data.personas || [];
      const [draggedItem, setDraggedItem] = React.useState<{ pIdx: number; mIdx: number; bIdx?: number } | null>(null);

      const addPersona = () => {
        handleDataChange('personas', [
          ...personas, 
          { id: `p_${Date.now()}`, role: '新的用户角色', mainLines: [{ id: `m_${Date.now()}`, title: '新阶段', branches: [] }] }
        ]);
      };

      const removePersona = (pIdx: number) => {
        const newPersonas = [...personas];
        newPersonas.splice(pIdx, 1);
        handleDataChange('personas', newPersonas);
       };

      const updatePersona = (pIdx: number, value: string) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].role = value;
        handleDataChange('personas', newPersonas);
      };

      const addMainLine = (pIdx: number) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].mainLines.push({ id: `m_${Date.now()}`, title: '新主线阶段', branches: [] });
        handleDataChange('personas', newPersonas);
      };

      const removeMainLine = (pIdx: number, mIdx: number) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].mainLines.splice(mIdx, 1);
        handleDataChange('personas', newPersonas);
      };

      const updateMainLine = (pIdx: number, mIdx: number, value: string) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].mainLines[mIdx].title = value;
        handleDataChange('personas', newPersonas);
      };

      const addBranch = (pIdx: number, mIdx: number) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].mainLines[mIdx].branches.push({ id: `b_${Date.now()}`, content: '新的分支故事细节...' });
        handleDataChange('personas', newPersonas);
      };

      const removeBranch = (pIdx: number, mIdx: number, bIdx: number) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].mainLines[mIdx].branches.splice(bIdx, 1);
        handleDataChange('personas', newPersonas);
      };

      const updateBranch = (pIdx: number, mIdx: number, bIdx: number, value: string) => {
        const newPersonas = [...personas];
        newPersonas[pIdx].mainLines[mIdx].branches[bIdx].content = value;
        handleDataChange('personas', newPersonas);
      };

      // Native Drag & Drop Implementation
      const onDragStart = (e: React.DragEvent, pIdx: number, mIdx: number, bIdx?: number) => {
        e.stopPropagation();
        setDraggedItem({ pIdx, mIdx, bIdx });
        // Optional: create a drag image or handle transparency
      };

      const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
      };

      const onDrop = (e: React.DragEvent, targetPIdx: number, targetMIdx: number, targetBIdx?: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedItem) return;

        const { pIdx: sPIdx, mIdx: sMIdx, bIdx: sBIdx } = draggedItem;
        const newPersonas = JSON.parse(JSON.stringify(personas)); // Deep copy

        // If dragging a branch
        if (sBIdx !== undefined) {
           const branchToMove = newPersonas[sPIdx].mainLines[sMIdx].branches.splice(sBIdx, 1)[0];
           
           if (targetBIdx !== undefined) {
              // Drop onto another branch (insert before it)
              newPersonas[targetPIdx].mainLines[targetMIdx].branches.splice(targetBIdx, 0, branchToMove);
           } else {
              // Drop into the column area (append to end)
              newPersonas[targetPIdx].mainLines[targetMIdx].branches.push(branchToMove);
           }
        } else {
           // Dragging a main line, only allow horizontal reorder within same Persona for simplicity
           if (sPIdx === targetPIdx && targetBIdx === undefined) {
              const mainToMove = newPersonas[sPIdx].mainLines.splice(sMIdx, 1)[0];
              newPersonas[targetPIdx].mainLines.splice(targetMIdx, 0, mainToMove);
           }
        }

        handleDataChange('personas', newPersonas);
        setDraggedItem(null);
      };

      return (
        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <Label className="text-sm font-semibold">故事地图配置 (支持跨列拖拽)</Label>
             <Button variant="outline" size="sm" onClick={addPersona} className="bg-slate-50"><Plus className="w-4 h-4 mr-1"/> 添加角色地图</Button>
           </div>
           
           <div className="rounded-xl border bg-slate-50 p-4 shadow-inner space-y-6 max-h-[800px] overflow-y-auto">
             {personas.map((persona: any, pIdx: number) => (
                <div key={persona.id} className="bg-white border rounded-xl shadow-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                   <div className="flex gap-2 items-center mb-4">
                     <span className="font-semibold text-slate-800 shrink-0">作为:</span>
                     <Input 
                       className="font-bold text-blue-600 bg-blue-50/50 border-input w-64 h-9" 
                       value={persona.role} 
                       onChange={(e) => updatePersona(pIdx, e.target.value)} 
                       placeholder="如：普通注册用户" 
                     />
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0 ml-auto" onClick={() => removePersona(pIdx)} title="删除整个角色地图">
                       <Trash2 className="w-4 h-4"/>
                     </Button>
                   </div>

                   {/* Canvas Area for this persona */}
                   <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start">
                     {persona.mainLines.map((main: any, mIdx: number) => (
                       <div key={main.id} className="min-w-[260px] flex-shrink-0 flex flex-col gap-3">
                         
                         {/* Main Line Node */}
                         <div 
                           className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg border border-blue-300 relative group cursor-grab active:cursor-grabbing transition-colors"
                           draggable
                           onDragStart={(e) => onDragStart(e, pIdx, mIdx)}
                           onDragOver={onDragOver}
                           onDrop={(e) => onDrop(e, pIdx, mIdx)}
                         >
                            <Input 
                              className="font-semibold bg-transparent border-transparent px-1 focus:bg-white focus:border-input shadow-none h-8 text-blue-900" 
                              value={main.title} 
                              onChange={(e) => updateMainLine(pIdx, mIdx, e.target.value)} 
                            />
                            <Button 
                              variant="ghost" size="icon" 
                              className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white border shadow-sm text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 scale-90"
                              onClick={() => removeMainLine(pIdx, mIdx)}
                            >
                              <X className="w-3.5 h-3.5"/>
                            </Button>
                         </div>

                         {/* Branch Nodes Column Area */}
                         <div 
                           className="flex flex-col gap-2 min-h-[120px] rounded-lg border-2 border-dashed border-slate-200 p-2 bg-slate-50/50"
                           onDragOver={onDragOver}
                           onDrop={(e) => onDrop(e, pIdx, mIdx)} // Drop at the end of the column
                         >
                           {main.branches.map((branch: any, bIdx: number) => (
                             <div 
                               key={branch.id} 
                               className="bg-white p-2 rounded-md shadow-sm border border-slate-200 relative group cursor-grab active:cursor-grabbing"
                               draggable
                               onDragStart={(e) => onDragStart(e, pIdx, mIdx, bIdx)}
                               onDragOver={onDragOver}
                               onDrop={(e) => onDrop(e, pIdx, mIdx, bIdx)} // Drop over another branch
                             >
                                <textarea 
                                  className="w-full text-sm min-h-[60px] resize-none outline-none bg-transparent"
                                  value={branch.content}
                                  onChange={(e) => updateBranch(pIdx, mIdx, bIdx, e.target.value)}
                                  placeholder="在此输入由于当前主线派生出的分支任务或用户故事..."
                                />
                                <Button 
                                  variant="ghost" size="icon" 
                                  className="h-6 w-6 absolute right-1 bottom-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                  onClick={() => removeBranch(pIdx, mIdx, bIdx)}
                                >
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </Button>
                             </div>
                           ))}
                           <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 bg-white border hover:bg-slate-50 shadow-sm" onClick={() => addBranch(pIdx, mIdx)}>
                             <Plus className="w-3.5 h-3.5 mr-1" /> 追加分支
                           </Button>
                         </div>
                       </div>
                     ))}
                     
                     <div className="min-w-[260px] flex-shrink-0">
                       <Button variant="outline" className="w-full h-12 border-dashed text-slate-500 hover:text-slate-800 bg-white/50" onClick={() => addMainLine(pIdx)}>
                         <Plus className="w-4 h-4 mr-2" /> 新增主线节点
                       </Button>
                     </div>
                   </div>

                </div>
             ))}
           </div>
        </div>
      );
    }

    if (type === 'milestoneRoadmap') {
      return (
        <div className="space-y-2">
          <Label>里程碑阶段</Label>
          <DynamicArrayEditor items={data.phases} onChange={(phases) => handleDataChange('phases', phases)} itemTemplate={{ name: '新阶段', start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', status: 'pending' }} hideFormulas={true} />
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
                      value={stage.stage || ''} 
                      onChange={e => { const newStages = [...data.stages]; newStages[index].stage = e.target.value; handleDataChange('stages', newStages); }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">完整阶段名称</Label>
                    <Input 
                      className="font-medium bg-background" 
                      value={stage.name || ''} 
                      onChange={e => { const newStages = [...data.stages]; newStages[index].name = e.target.value; handleDataChange('stages', newStages); }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">中文解释</Label>
                  <textarea 
                    className="w-full text-sm p-3 border rounded-md min-h-[80px] resize-y bg-background focus:ring-1 focus:ring-primary outline-none" 
                    value={stage.cnDesc || ''} 
                    onChange={e => { const newStages = [...data.stages]; newStages[index].cnDesc = e.target.value; handleDataChange('stages', newStages); }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">English Description</Label>
                  <textarea 
                    className="w-full text-sm p-3 border rounded-md min-h-[80px] resize-y bg-background focus:ring-1 focus:ring-primary outline-none font-serif" 
                    value={stage.enDesc || ''} 
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
            <Input value={(data.regions || []).join(', ')} onChange={(e) => handleDataChange('regions', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>认证列表</Label>
            <DynamicArrayEditor items={data.certifications} onChange={(certs) => handleDataChange('certifications', certs)} itemTemplate={{ name: '新认证', region: 'Global', status: 'Not Started' }} hideFormulas={true} />
          </div>
        </div>
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
      const columns = data.columns || defaultCols;
      const requirements = data.requirements || [];

      const addReq = () => {
        const nextNum = requirements.length + 1;
        const newId = `REQ-${String(nextNum).padStart(2, '0')}`;
        const newRow: any = { id: newId, status: '待评估', priority: '中' };
        // Populate optional defaults for other columns
        columns.forEach((col: any) => {
           if (col.id !== 'id' && col.id !== 'status' && col.id !== 'priority') {
             newRow[col.id] = col.id === 'summary' ? '描述说明' : '-';
           }
        });
        handleDataChange('requirements', [...requirements, newRow]);
      };
      
      const removeReq = (idx: number) => {
        handleDataChange('requirements', requirements.filter((_: any, i: number) => i !== idx));
      };

      const updateReq = (idx: number, field: string, value: string) => {
        const newReqs = [...requirements];
        newReqs[idx] = { ...newReqs[idx], [field]: value };
        handleDataChange('requirements', newReqs);
      };

      const moveReq = (idx: number, direction: 'up' | 'down') => {
        const newReqs = [...requirements];
        if (direction === 'up' && idx > 0) {
          [newReqs[idx - 1], newReqs[idx]] = [newReqs[idx], newReqs[idx - 1]];
          handleDataChange('requirements', newReqs);
        } else if (direction === 'down' && idx < newReqs.length - 1) {
          [newReqs[idx + 1], newReqs[idx]] = [newReqs[idx], newReqs[idx + 1]];
          handleDataChange('requirements', newReqs);
        }
      };

      const addColumn = () => {
        const newColId = `col_${Date.now()}`;
        handleDataChange('columns', [...columns, { id: newColId, name: '新增列' }]);
      };

      const updateColumnName = (colId: string, newName: string) => {
        handleDataChange('columns', columns.map((c: any) => c.id === colId ? { ...c, name: newName } : c));
      };

      const removeColumn = (colId: string) => {
        handleDataChange('columns', columns.filter((c: any) => c.id !== colId));
      };

      return (
        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <Label className="text-sm font-semibold">需求列表配置</Label>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={addColumn}><Plus className="w-4 h-4 mr-1"/> 加列</Button>
               <Button variant="secondary" size="sm" onClick={addReq}><Plus className="w-4 h-4 mr-1"/> 加行</Button>
             </div>
           </div>
           
           <div className="overflow-x-auto border rounded-xl w-full bg-white shadow-sm">
             <table className="w-full text-sm min-w-max">
               <thead>
                 <tr className="border-b bg-slate-50/50">
                   {columns.map((col: any, idx: number) => (
                     <th key={col.id} className={`p-1 font-semibold text-muted-foreground text-left min-w-[100px] relative group border-b ${idx > 0 ? 'border-l' : ''} ${col.id === 'summary' ? 'min-w-[200px]' : ''}`}>
                       <div className="flex items-center gap-1 pr-6">
                         <Input className="h-8 w-full text-sm font-semibold shadow-none focus:bg-white bg-transparent border-transparent hover:border-input transition-all px-2 placeholder:text-muted-foreground/50" value={col.name} onChange={(e) => updateColumnName(col.id, e.target.value)} placeholder="列名" />
                         <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive absolute right-1 transition-opacity shrink-0" onClick={() => removeColumn(col.id)} title="删除列">
                           <X className="w-3.5 h-3.5" />
                         </Button>
                       </div>
                     </th>
                   ))}
                   <th className="p-2 font-semibold text-muted-foreground text-center w-24 border-l border-b">操作</th>
                 </tr>
               </thead>
               <tbody>
                 {requirements.map((req: any, idx: number) => (
                   <tr key={idx} className="group border-b last:border-b-0 hover:bg-slate-50/30 transition-colors">
                     {columns.map((col: any, cIdx: number) => {
                       let CellInput = <Input className="h-8 text-sm shadow-none focus:bg-white bg-transparent border-transparent hover:border-input transition-all px-2" value={req[col.id] || ''} onChange={(e) => updateReq(idx, col.id, e.target.value)} />;
                       
                       if (col.id === 'priority') {
                         CellInput = (
                           <select 
                             className="w-full h-8 text-sm bg-transparent border-transparent hover:border-input focus:border-input focus:ring-0 rounded-md px-1 outline-none transition-all cursor-pointer"
                             value={req[col.id] || '中'}
                             onChange={(e) => updateReq(idx, col.id, e.target.value)}
                           >
                             <option value="很高">很高</option>
                             <option value="高">高</option>
                             <option value="中">中</option>
                             <option value="低">低</option>
                           </select>
                         );
                       } else if (col.id === 'status') {
                         CellInput = (
                           <select 
                             className="w-full h-8 text-sm bg-transparent border-transparent hover:border-input focus:border-input focus:ring-0 rounded-md px-1 outline-none transition-all cursor-pointer"
                             value={req[col.id] || '待评估'}
                             onChange={(e) => updateReq(idx, col.id, e.target.value)}
                           >
                             <option value="待评估">待评估</option>
                             <option value="规划中">规划中</option>
                             <option value="开发中">开发中</option>
                             <option value="已实现">已实现</option>
                             <option value="已拒绝">已拒绝</option>
                           </select>
                         );
                       } else if (col.id === 'id' || col.id === 'version') {
                         CellInput = <Input className="h-8 text-sm shadow-none focus:bg-white bg-transparent border-transparent hover:border-input transition-all px-2 font-mono text-center" value={req[col.id] || ''} onChange={(e) => updateReq(idx, col.id, e.target.value)} />;
                       } else if (col.id === 'assignee' || col.id === 'priority') {
                         CellInput = <Input className="h-8 text-sm shadow-none focus:bg-white bg-transparent border-transparent hover:border-input transition-all px-2 text-center" value={req[col.id] || ''} onChange={(e) => updateReq(idx, col.id, e.target.value)} />;
                       }

                       return (
                         <td key={col.id} className={`p-1 ${cIdx > 0 ? 'border-l' : ''}`}>
                           {CellInput}
                         </td>
                       );
                     })}
                     <td className="p-1 border-l text-center align-middle whitespace-nowrap">
                       <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => moveReq(idx, 'up')} disabled={idx === 0}><ChevronUp className="w-4 h-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => moveReq(idx, 'down')} disabled={idx === requirements.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive ml-1" onClick={() => removeReq(idx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      );
    }

    if (type === 'docHeader') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>文档标题</Label>
            <Input value={data.title || ''} onChange={(e) => handleDataChange('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>版本号</Label>
              <Input value={data.version || ''} onChange={(e) => handleDataChange('version', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>作者</Label>
              <Input value={data.author || ''} onChange={(e) => handleDataChange('author', e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>更新日期</Label>
              <Input type="date" value={data.date || ''} onChange={(e) => handleDataChange('date', e.target.value)} />
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
            value={data.content || ''}
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
              value={data.text || ''}
              onChange={(e) => handleDataChange('text', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>出处或作者</Label>
            <Input value={data.author || ''} onChange={(e) => handleDataChange('author', e.target.value)} placeholder="引言的作者，例如：Steve Jobs" />
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
              value={data.style || 'solid'}
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
                <Input type="color" className="w-12 h-9 p-1 rounded cursor-pointer" value={data.color || '#000000'} onChange={(e) => handleDataChange('color', e.target.value)} />
                <Input type="text" className="flex-1" value={data.color || '#000000'} onChange={(e) => handleDataChange('color', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>线条粗细 (px)</Label>
              <Input type="number" min="1" max="10" value={data.thickness ?? 1} onChange={(e) => handleDataChange('thickness', parseInt(e.target.value) || 1)} />
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
            <Input type="number" value={data.currentStep ?? 1} onChange={(e) => handleDataChange('currentStep', parseInt(e.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label>步骤节点</Label>
            <DynamicArrayEditor items={data.steps} onChange={(steps) => handleDataChange('steps', steps)} itemTemplate={{ title: '新步骤', description: '描述', date: '时间节点' }} hideFormulas={true} />
          </div>
        </div>
      );
    }

    if (type === 'alertBlock') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>警示类型</Label>
            <select 
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={data.alertType || 'warning'}
              onChange={(e) => handleDataChange('alertType', e.target.value)}
            >
              <option value="info">提示 (Info)</option>
              <option value="warning">警告 (Warning)</option>
              <option value="error">错误 (Error)</option>
              <option value="success">成功 (Success)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>警示标题</Label>
            <Input value={data.title || ''} onChange={(e) => handleDataChange('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>警示内容</Label>
            <textarea 
              className="w-full text-sm p-3 border rounded-md min-h-[80px] resize-y bg-background focus:ring-1 focus:ring-primary outline-none"
              value={data.content || ''}
              onChange={(e) => handleDataChange('content', e.target.value)}
            />
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
             <Label className="text-sm font-semibold">表头背景色</Label>
             <div className="flex gap-2 items-center">
               <Input type="color" className="w-10 h-10 p-1 border rounded cursor-pointer" value={data.headerColor || '#f8fafc'} onChange={(e) => handleDataChange('headerColor', e.target.value)} />
               <Input type="text" className="flex-1 h-10 font-mono" value={data.headerColor || '#f8fafc'} onChange={(e) => handleDataChange('headerColor', e.target.value)} />
             </div>
           </div>
           
           <div className="space-y-3">
             <div className="flex justify-between items-center">
               <Label className="text-sm font-semibold">表格数据配置</Label>
               <div className="flex gap-2">
                 <Button variant="secondary" size="sm" onClick={addColumn}><Plus className="w-4 h-4 mr-1"/> 添加列</Button>
                 <Button variant="secondary" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1"/> 添加行</Button>
               </div>
             </div>
             
             <div className="overflow-x-auto border rounded-xl w-full bg-white shadow-sm">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b bg-slate-50/50">
                     {data.headers.map((h: string, cIdx: number) => (
                       <th key={cIdx} className="p-2 font-normal min-w-[150px] border-r last:border-r-0">
                         <div className="flex items-center gap-1">
                           <Input className="h-8 text-sm font-semibold shadow-none border-dashed border-slate-300 focus:border-solid focus:bg-white bg-transparent transition-all px-2" value={h || ''} onChange={(e) => updateHeader(cIdx, e.target.value)} placeholder="表头名称" />
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100 shrink-0" onClick={() => removeColumn(cIdx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                         </div>
                       </th>
                     ))}
                     <th className="w-10 bg-white"></th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.rows.map((row: string[], rIdx: number) => (
                     <tr key={rIdx} className="group border-b last:border-b-0 hover:bg-slate-50/30 transition-colors">
                       {row.map((cell: string, cIdx: number) => (
                         <td key={cIdx} className="p-2 border-r last:border-r-0">
                           <Input className="h-8 text-sm shadow-none focus:bg-white bg-transparent border-transparent hover:border-input transition-all px-2" value={cell || ''} onChange={(e) => updateCell(rIdx, cIdx, e.target.value)} />
                         </td>
                       ))}
                       <td className="w-10 p-2 align-middle text-center">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeRow(rIdx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      );
    }

    if (type === 'marketAnalysis') {
      const widgets = data.widgets || [];

      const addWidget = () => {
        handleDataChange('widgets', [
          ...widgets,
          { id: `widget_${Date.now()}`, type: 'metric', title: '新指标', value: '0', formula: '', prefix: '', suffix: '' }
        ]);
      };

      const removeWidget = (idx: number) => {
        handleDataChange('widgets', widgets.filter((_: any, i: number) => i !== idx));
      };
      
      const moveWidget = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx > 0) {
           const newWidgets = [...widgets];
           [newWidgets[idx-1], newWidgets[idx]] = [newWidgets[idx], newWidgets[idx-1]];
           handleDataChange('widgets', newWidgets);
        } else if (direction === 'down' && idx < widgets.length - 1) {
           const newWidgets = [...widgets];
           [newWidgets[idx], newWidgets[idx+1]] = [newWidgets[idx+1], newWidgets[idx]];
           handleDataChange('widgets', newWidgets);
        }
      };

      const updateWidget = (idx: number, field: string, value: any) => {
        const newWidgets = [...widgets];
        newWidgets[idx] = { ...newWidgets[idx], [field]: value };
        handleDataChange('widgets', newWidgets);
      };

      const addDataPoint = (wIdx: number) => {
        const newWidgets = [...widgets];
        if (!newWidgets[wIdx].data) newWidgets[wIdx].data = [];
        newWidgets[wIdx].data.push({ label: '新类目', value: '0' });
        handleDataChange('widgets', newWidgets);
      };

      const removeDataPoint = (wIdx: number, dIdx: number) => {
        const newWidgets = [...widgets];
        newWidgets[wIdx].data.splice(dIdx, 1);
        handleDataChange('widgets', newWidgets);
      };

      const updateDataPoint = (wIdx: number, dIdx: number, field: string, value: string) => {
        const newWidgets = [...widgets];
        newWidgets[wIdx].data[dIdx][field] = value;
        handleDataChange('widgets', newWidgets);
      };

      return (
        <div className="space-y-5">
           <div className="flex justify-between items-center pb-2 border-b border-slate-100">
             <Label className="text-sm font-semibold text-slate-700">图表组件列阵</Label>
             <Button variant="outline" size="sm" onClick={addWidget} className="h-7 px-2.5 text-xs bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Plus className="w-3.5 h-3.5 mr-1"/> 添加组件</Button>
           </div>
           
           <div className="space-y-3 max-h-[800px] overflow-y-auto px-1 custom-scrollbar pb-10">
             {widgets.map((widget: any, wIdx: number) => (
                <div key={widget.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm group">
                  <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 border-b border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm flex items-center">
                      <span className="text-blue-400 mr-1">#</span>{widget.id}
                    </span>
                    <div className="flex-1"></div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-800" onClick={() => moveWidget(wIdx, 'up')} disabled={wIdx === 0}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-800" onClick={() => moveWidget(wIdx, 'down')} disabled={wIdx === widgets.length - 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </Button>
                      <div className="w-px h-3 bg-slate-200 mx-1"></div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => removeWidget(wIdx)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                     <div className="flex gap-3">
                       <div className="flex-1">
                         <Label className="text-xs text-slate-500 mb-1.5 block font-medium">标题</Label>
                         <Input className="h-8 shadow-none focus-visible:ring-1 bg-slate-50/50" value={widget.title} onChange={(e) => updateWidget(wIdx, 'title', e.target.value)} />
                       </div>
                       <div className="w-[100px]">
                         <Label className="text-xs text-slate-500 mb-1.5 block font-medium">宽度</Label>
                         <select 
                           className="w-full h-8 text-xs border-slate-200 border rounded-md px-2 bg-slate-50/50 shadow-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                           value={widget.layoutWidth || 'half'}
                           onChange={(e) => updateWidget(wIdx, 'layoutWidth', e.target.value)}
                         >
                           <option value="full">占满整行 (1/1)</option>
                           <option value="half">占半行 (1/2)</option>
                           <option value="third">占三分之一 (1/3)</option>
                         </select>
                       </div>
                       <div className="w-[100px]">
                         <Label className="text-xs text-slate-500 mb-1.5 block font-medium">类型</Label>
                         <select 
                           className="w-full h-8 text-xs border-slate-200 border rounded-md px-2 bg-slate-50/50 shadow-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                           value={widget.type}
                           onChange={(e) => {
                              const newType = e.target.value;
                              const currentWidgets = [...widgets];
                              currentWidgets[wIdx].type = newType;
                              if (newType === 'metric') {
                                 currentWidgets[wIdx].data = undefined;
                                 currentWidgets[wIdx].radarData = undefined;
                                 if (!currentWidgets[wIdx].value) currentWidgets[wIdx].value = '';
                                 if (!currentWidgets[wIdx].formula) currentWidgets[wIdx].formula = '';
                              } else if (newType === 'radar') {
                                 currentWidgets[wIdx].data = undefined;
                                 if (!currentWidgets[wIdx].radarData) {
                                     currentWidgets[wIdx].radarData = {
                                        dimensions: '价格, 性能, 设计, 续航, 生态',
                                        series: [
                                           { name: '本品', scores: '4, 5, 4, 3, 4' },
                                           { name: '竞品A', scores: '5, 3, 3, 5, 2' }
                                        ]
                                     };
                                 }
                              } else {
                                 currentWidgets[wIdx].radarData = undefined;
                                 if (!currentWidgets[wIdx].data) {
                                    currentWidgets[wIdx].data = [{ label: '子项A', value: '10' }, { label: '子项B', value: '20' }];
                                 }
                              }
                              handleDataChange('widgets', currentWidgets);
                           }}
                         >
                           <option value="metric">数值化</option>
                           <option value="bar">柱状图</option>
                           <option value="pie">饼状图</option>
                           <option value="line">折线图</option>
                           <option value="radar">雷达图</option>
                         </select>
                       </div>
                     </div>

                     {widget.type === 'metric' && (
                        <div className="space-y-3 pt-1">
                           <div className="flex items-start gap-3">
                             <div className="flex-1">
                                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">静态数值 <span className="text-slate-300 font-normal">(选填)</span></Label>
                                <Input className="h-8 shadow-none font-mono text-xs bg-slate-50/50" value={widget.value || ''} onChange={(e) => updateWidget(wIdx, 'value', e.target.value)} placeholder="0" />
                             </div>
                             <div className="flex-1">
                                <Label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1 font-medium"><span className="text-amber-500 italic font-serif">ƒ</span> 动态公式</Label>
                                <Input className="h-8 shadow-none font-mono text-xs bg-amber-50/30 border-amber-200/50 focus-visible:ring-amber-400 placeholder:text-amber-300/60" value={widget.formula || ''} onChange={(e) => updateWidget(wIdx, 'formula', e.target.value)} placeholder="v_tam * 0.3" />
                             </div>
                           </div>
                           <div className="flex gap-3">
                              <div className="flex-1">
                                 <Label className="text-xs text-slate-500 mb-1.5 block font-medium">前缀缩写 <span className="text-slate-300 font-normal">(如 ¥)</span></Label>
                                 <Input className="h-8 shadow-none text-xs bg-slate-50/50" value={widget.prefix || ''} onChange={(e) => updateWidget(wIdx, 'prefix', e.target.value)} placeholder="" />
                              </div>
                              <div className="flex-1">
                                 <Label className="text-xs text-slate-500 mb-1.5 block font-medium">后缀单位 <span className="text-slate-300 font-normal">(如 亿)</span></Label>
                                 <Input className="h-8 shadow-none text-xs bg-slate-50/50" value={widget.suffix || ''} onChange={(e) => updateWidget(wIdx, 'suffix', e.target.value)} placeholder="" />
                              </div>
                           </div>
                        </div>
                     )}

                     {(widget.type === 'bar' || widget.type === 'pie' || widget.type === 'line') && (
                        <div className="space-y-2 pt-1 border-t border-slate-100 mt-2">
                           <div className="flex items-center justify-between pt-2">
                              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">图表系列明细</Label>
                              <Button variant="ghost" size="sm" onClick={() => addDataPoint(wIdx)} className="h-5 px-1.5 text-[10px] text-blue-500 hover:bg-blue-50"><Plus className="w-3 h-3 mr-0.5"/> 加项</Button>
                           </div>
                           <div className="bg-slate-50 p-2 rounded border border-slate-100/50 flex flex-col gap-1.5">
                             {(widget.data || []).map((point: any, dIdx: number) => (
                                <div key={dIdx} className="flex gap-1.5 items-center group/dp relative">
                                   <Input className="h-7 text-xs shadow-none w-24 shrink-0 bg-white border-slate-200" placeholder="类名" value={point.label} onChange={(e) => updateDataPoint(wIdx, dIdx, 'label', e.target.value)} />
                                   <div className="relative flex-1">
                                     <span className="absolute left-2 top-[7px] text-amber-500 font-serif italic text-[10px] pointer-events-none">ƒ</span>
                                     <Input className="h-7 text-xs shadow-none font-mono placeholder:font-sans bg-white border-slate-200 pl-5" placeholder="数值或公式" value={point.value} onChange={(e) => updateDataPoint(wIdx, dIdx, 'value', e.target.value)} />
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/dp:opacity-100 shrink-0 absolute -right-2" onClick={() => removeDataPoint(wIdx, dIdx)}>
                                     <XCircle className="w-3.5 h-3.5" />
                                   </Button>
                                </div>
                             ))}
                             {(!widget.data || widget.data.length === 0) && (
                               <div className="text-[11px] text-slate-400 text-center py-2 italic bg-white/50 rounded border border-dashed border-slate-200">暂无数据项</div>
                             )}
                           </div>
                        </div>
                     )}

                     {widget.type === 'radar' && widget.radarData && (
                        <div className="space-y-4 pt-1 border-t border-slate-100 mt-2">
                           <div>
                              <Label className="text-xs text-slate-500 mb-1.5 block font-medium">维度 (逗号分隔)</Label>
                              <Input className="h-8 shadow-none text-xs bg-slate-50/50" value={widget.radarData.dimensions || ''} onChange={(e) => {
                                 const currentWidgets = [...widgets];
                                 currentWidgets[wIdx].radarData.dimensions = e.target.value;
                                 handleDataChange('widgets', currentWidgets);
                              }} placeholder="价格, 性能, 设计, 续航, 生态" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs text-slate-500 mb-1 block font-medium">雷达数据系列</Label>
                              <div className="bg-slate-50 p-2 rounded border border-slate-100/50 flex flex-col gap-1.5">
                                 {(widget.radarData.series || []).map((s: any, sIdx: number) => {
                                    const scoreArr = (s.scores || '').split(',').map((x: string) => x.trim());
                                    const radarDims = (widget.radarData.dimensions || '').split(',').map((d: string) => d.trim()).filter(Boolean);
                                    return (
                                       <div key={sIdx} className="p-3 bg-white border border-slate-200 rounded-lg relative group/rs">
                                          <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6 text-slate-300 hover:text-red-500 opacity-0 group-hover/rs:opacity-100" onClick={() => {
                                             const currentWidgets = [...widgets];
                                             currentWidgets[wIdx] = { ...currentWidgets[wIdx], radarData: { ...currentWidgets[wIdx].radarData, series: [...currentWidgets[wIdx].radarData.series] } };
                                             currentWidgets[wIdx].radarData.series.splice(sIdx, 1);
                                             handleDataChange('widgets', currentWidgets);
                                          }}>
                                            <XCircle className="w-4 h-4" />
                                          </Button>
                                          <div className="flex items-center gap-3 mb-3 pr-8">
                                             <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer" value={s.color || '#3b82f6'} onChange={(e) => {
                                                const currentWidgets = [...widgets];
                                                currentWidgets[wIdx] = { ...currentWidgets[wIdx], radarData: { ...currentWidgets[wIdx].radarData, series: [...currentWidgets[wIdx].radarData.series] } };
                                                currentWidgets[wIdx].radarData.series[sIdx] = { ...s, color: e.target.value };
                                                handleDataChange('widgets', currentWidgets);
                                             }} title="自定义颜色" />
                                             <Input className="h-8 shadow-none bg-slate-50 flex-1" placeholder="名称" value={s.name} onChange={(e) => {
                                                const currentWidgets = [...widgets];
                                                currentWidgets[wIdx] = { ...currentWidgets[wIdx], radarData: { ...currentWidgets[wIdx].radarData, series: [...currentWidgets[wIdx].radarData.series] } };
                                                currentWidgets[wIdx].radarData.series[sIdx] = { ...s, name: e.target.value };
                                                handleDataChange('widgets', currentWidgets);
                                             }} />
                                          </div>
                                          <div>
                                              <Label className="text-[11px] text-slate-400 block mb-2">雷达分值 (支持公式，按维度对应)</Label>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                  {radarDims.map((dim: string, dIdx: number) => (
                                                      <div key={dIdx} className="flex-1 relative">
                                                          <Label className="text-[10px] text-slate-500 line-clamp-1" title={dim}>{dim}</Label>
                                                          <span className="absolute left-2 bottom-[7px] text-amber-500 font-serif italic text-[10px] pointer-events-none">ƒ</span>
                                                          <Input className="h-7 text-xs shadow-none mt-0.5 font-mono pl-5" value={scoreArr[dIdx] !== undefined ? scoreArr[dIdx] : ''} onChange={(e) => {
                                                              const currentWidgets = [...widgets];
                                                              currentWidgets[wIdx] = { ...currentWidgets[wIdx], radarData: { ...currentWidgets[wIdx].radarData, series: [...currentWidgets[wIdx].radarData.series] } };
                                                              const newScores = [...scoreArr];
                                                              newScores[dIdx] = e.target.value;
                                                              currentWidgets[wIdx].radarData.series[sIdx] = { ...s, scores: newScores.join(',') };
                                                              handleDataChange('widgets', currentWidgets);
                                                          }} />
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                       </div>
                                    );
                                 })}
                                 <div className="pt-1">
                                    <Button variant="outline" size="sm" onClick={() => {
                                       const currentWidgets = [...widgets];
                                       if (!currentWidgets[wIdx].radarData.series) currentWidgets[wIdx].radarData.series = [];
                                       currentWidgets[wIdx].radarData.series.push({ name: '新项', scores: '0,0,0,0,0' });
                                       handleDataChange('widgets', currentWidgets);
                                    }} className="h-6 text-xs w-full text-blue-600 border-dashed hover:bg-blue-50 border-slate-200"><Plus className="w-3 h-3 mr-1"/> 添加项</Button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                </div>
             ))}
             {widgets.length === 0 && (
               <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                 无组件，请点击右上角添加。
               </div>
             )}
           </div>
        </div>
      );
    }

    if (type === 'techRiskAnalysis') {
      return (
        <div className="space-y-2">
          <Label>技术风险分析</Label>
          <DynamicArrayEditor 
            items={data.risks} 
            onChange={(items) => handleDataChange('risks', items)} 
            itemTemplate={{ risk: '风险项', probability: '高/中/低', impact: '影响程度', mitigation: '应对策略' }} 
            hideFormulas={true}
          />
        </div>
      );
    }

    if (type === 'fmeaAnalysis') {
      return (
        <div className="space-y-2">
          <Label>FMEA 分析项</Label>
          <DynamicArrayEditor 
            items={data.items} 
            onChange={(items) => handleDataChange('items', items)} 
            itemTemplate={{ phase: '结构层', failureMode: '失效模式', cause: '失效原因', effect: '失效影响', severity: '10', prevention: '预防措施' }} 
            hideFormulas={true}
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
              checked={!!data.showImage}
              onChange={(e) => handleDataChange('showImage', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="showImage" className="cursor-pointer">显示产品原型参考图</Label>
          </div>

          {data.showImage && (
            <div className="space-y-3 pl-6 border-l-2 border-muted">
              <div>
                <Label className="text-xs mb-1.5 block">上传本地图片 / 图片URL</Label>
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="text-xs flex-1 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleDataChange('imageUrl', ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <Input value={data.imageUrl || ''} onChange={(e) => handleDataChange('imageUrl', e.target.value)} placeholder="https://..." className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => handleDataChange('imageUrl', '')} title="清空图片"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>原型版本名称</Label>
              <Input value={data.prototypeName || ''} onChange={(e) => handleDataChange('prototypeName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>当前状态</Label>
              <Input value={data.status || ''} onChange={(e) => handleDataChange('status', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-semibold mb-2 block">自定义详情区块</Label>
            <DynamicTextSectionEditor
              obj={data.customFields || (data.description || data.targetAudience ? {
                ...(data.description ? {"设计概要": data.description} : {}),
                ...(data.targetAudience ? {"目标受众群体": data.targetAudience} : {}),
              } : {"新区块": ""})}
              onChange={(newFields) => {
                updateNodeData(node.id, { 
                  title: node.data.title, 
                  data: {
                    ...data,
                    customFields: newFields,
                    description: undefined,
                    targetAudience: undefined
                  }
                });
              }}
            />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-semibold mb-2 block">交互与测试项目</Label>
            <DynamicArrayEditor
              items={data.features || []}
              onChange={(features) => handleDataChange('features', features)}
              itemTemplate={{ name: '新项目名称', notes: '说明内容' }}
              hideFormulas={true}
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
            hideFormulas={true}
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
             <Label className="text-sm font-semibold">参数对照表配置</Label>
             <div className="flex gap-2">
               <Button variant="secondary" size="sm" onClick={addProduct}><Plus className="w-4 h-4 mr-1"/> 添加对比产品</Button>
               <Button variant="secondary" size="sm" onClick={addFeature}><Plus className="w-4 h-4 mr-1"/> 添加对比维度</Button>
             </div>
           </div>
           
           <div className="overflow-x-auto border rounded-xl w-full bg-white shadow-sm">
             <table className="w-full text-sm">
               <thead>
                 <tr className="border-b bg-slate-50/50">
                   <th className="p-2 font-normal w-[200px] border-r">
                     <div className="text-xs font-semibold text-muted-foreground text-left px-2">对比维度</div>
                   </th>
                   {data.products.map((prod: string, pIdx: number) => (
                     <th key={pIdx} className="p-2 font-normal min-w-[150px] border-r last:border-r-0">
                       <div className="flex items-center gap-1">
                         <Input className="h-8 text-sm font-semibold shadow-none border-dashed border-slate-300 focus:border-solid focus:bg-white bg-transparent transition-all px-2 text-center" value={prod || ''} onChange={(e) => updateProduct(pIdx, e.target.value)} placeholder="产品名称" />
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100 shrink-0" onClick={() => removeProduct(pIdx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                       </div>
                     </th>
                   ))}
                   <th className="w-10 bg-white"></th>
                 </tr>
               </thead>
               <tbody>
                 {data.features.map((feat: any, fIdx: number) => (
                   <tr key={fIdx} className="group border-b last:border-b-0 hover:bg-slate-50/30 transition-colors">
                     <td className="p-2 border-r bg-slate-50/20">
                       <Input className="h-8 text-sm font-medium shadow-none bg-transparent border-transparent hover:border-input focus:bg-white transition-all px-2" value={feat.name || ''} onChange={(e) => updateFeatureName(fIdx, e.target.value)} placeholder="维度名称" />
                     </td>
                     {feat.values.map((val: string, vIdx: number) => (
                       <td key={vIdx} className="p-2 border-r last:border-r-0">
                         <Input className="h-8 text-sm shadow-none focus:bg-white bg-transparent border-transparent hover:border-input transition-all px-2" value={val || ''} onChange={(e) => updateFeatureValue(fIdx, vIdx, e.target.value)} />
                       </td>
                     ))}
                     <td className="w-10 p-2 align-middle text-center">
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFeature(fIdx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
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
    <div className="h-full flex flex-col bg-white border-l relative overflow-hidden">
      <div className="p-4 border-b shrink-0 flex items-center justify-between bg-white z-10 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          编辑属性: {node.data.title}
        </h2>
        {isPropertyExpanded && (
           <Button size="sm" onClick={() => setIsPropertyExpanded(false)} variant="secondary" className="shadow-sm">返回排版页面</Button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/30">
        <div className="p-6 max-w-4xl mx-auto w-full pb-20">
          <div className="mb-6 space-y-2">
            <Label className="text-sm font-semibold">组件标题</Label>
            <Input value={node.data.title || ''} onChange={handleTitleChange} className="font-semibold text-base shadow-sm h-10 border-slate-200" />
          </div>
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}
