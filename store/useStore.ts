import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { ComponentDefinition, COMPONENT_DEFINITIONS } from '@/lib/components';

export type AppNode = Node<ComponentDefinition & { data: any }>;

interface AppState {
  nodes: AppNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  editingNodeId: string | null;
  previewMode: 'presentation' | 'document' | 'data';
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number, y: number }) => void;
  updateNodeData: (id: string, newData: any) => void;
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setPreviewMode: (mode: 'presentation' | 'document' | 'data') => void;
  deleteNode: (id: string) => void;
  loadTemplate: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  editingNodeId: null,
  previewMode: 'document',
  onNodesChange: (changes: NodeChange<AppNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (type: string, position: { x: number, y: number }) => {
    const def = COMPONENT_DEFINITIONS.find(c => c.type === type);
    if (!def) return;
    
    const newNode: AppNode = {
      id: uuidv4(),
      type: 'customComponent',
      position,
      data: {
        ...def,
        data: JSON.parse(JSON.stringify(def.defaultData))
      }
    };
    
    set({ nodes: [...get().nodes, newNode] });
  },
  updateNodeData: (id: string, newData: any) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === id) {
          // If newData has a title, update the node's title as well as its data
          if (newData.title) {
            return { ...node, data: { ...node.data, title: newData.title, data: newData.data } };
          }
          return { ...node, data: { ...node.data, data: newData } };
        }
        return node;
      })
    });
  },
  setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),
  setEditingNodeId: (id: string | null) => set({ editingNodeId: id }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  deleteNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },
  loadTemplate: () => {
    const prd = COMPONENT_DEFINITIONS.find(c => c.type === 'prdSpecs');
    const bom = COMPONENT_DEFINITIONS.find(c => c.type === 'bomCalculator');
    const roadmap = COMPONENT_DEFINITIONS.find(c => c.type === 'milestoneRoadmap');
    
    if (!prd || !bom || !roadmap) return;

    set({
      nodes: [
        { id: 'node-1', type: 'customComponent', position: { x: 200, y: 50 }, data: { ...prd, data: JSON.parse(JSON.stringify(prd.defaultData)) } },
        { id: 'node-2', type: 'customComponent', position: { x: 200, y: 250 }, data: { ...bom, data: JSON.parse(JSON.stringify(bom.defaultData)) } },
        { id: 'node-3', type: 'customComponent', position: { x: 200, y: 450 }, data: { ...roadmap, data: JSON.parse(JSON.stringify(roadmap.defaultData)) } }
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', type: 'smoothstep', animated: true },
        { id: 'e1-3', source: 'node-2', target: 'node-3', type: 'smoothstep', animated: true }
      ],
      selectedNodeId: null,
      previewMode: 'document'
    });
  }
}));
