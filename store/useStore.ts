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

export type AppNode = Node<ComponentDefinition & { data: any } & Record<string, unknown>>;

interface AppState {
  nodes: AppNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isPropertyExpanded: boolean;
  previewMode: 'presentation' | 'document' | 'data';
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number, y: number }) => void;
  updateNodeData: (id: string, newData: any) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsPropertyExpanded: (expanded: boolean) => void;
  setPreviewMode: (mode: 'presentation' | 'document' | 'data') => void;
  deleteNode: (id: string) => void;
  loadTemplate: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isPropertyExpanded: false,
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
    
    // Automatically determine position and edge creation
    const currentNodes = get().nodes;
    let newX = 250; // Fixed horizontal alignment (center-ish)
    let newY = 50;
    let parentNodeId: string | null = null;
    
    if (currentNodes.length > 0) {
      // Find the node with the highest Y (the lowest one visually)
      const lowestNode = currentNodes.reduce((prev, current) => 
        (current.position.y > prev.position.y) ? current : prev
      );
      newX = lowestNode.position.x; // Align with the lowest node
      newY = lowestNode.position.y + 200; // Consistent spacing
      parentNodeId = lowestNode.id;
    }

    const newNode: AppNode = {
      id: uuidv4(),
      type: 'customComponent',
      position: { x: newX, y: newY },
      data: {
        ...def,
        data: JSON.parse(JSON.stringify(def.defaultData))
      }
    };
    
    const newEdges = [];
    if (parentNodeId) {
      newEdges.push({
        id: `e-${parentNodeId}-${newNode.id}`,
        source: parentNodeId,
        target: newNode.id,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      });
    }

    set({ 
      nodes: [...currentNodes, newNode],
      edges: [...get().edges, ...newEdges]
    });
  },
  updateNodeData: (id: string, newData: any) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === id) {
          // Check if newData is an envelope (contains title and data separately)
          if (newData && typeof newData === 'object' && 'title' in newData && 'data' in newData) {
            return { ...node, data: { ...node.data, title: newData.title, data: newData.data } };
          }
          // Otherwise update just the internal data
          return { ...node, data: { ...node.data, data: newData } };
        }
        return node;
      })
    });
  },
  setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),
  setIsPropertyExpanded: (expanded: boolean) => set({ isPropertyExpanded: expanded }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  deleteNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isPropertyExpanded: state.selectedNodeId === id ? false : state.isPropertyExpanded,
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
        { id: 'e1-2', source: 'node-1', target: 'node-2', type: 'smoothstep', animated: true, markerEnd: { type: 'arrowclosed', color: '#94a3b8' }, style: { stroke: '#94a3b8', strokeWidth: 2 } },
        { id: 'e1-3', source: 'node-2', target: 'node-3', type: 'smoothstep', animated: true, markerEnd: { type: 'arrowclosed', color: '#94a3b8' }, style: { stroke: '#94a3b8', strokeWidth: 2 } }
      ],
      selectedNodeId: null,
      previewMode: 'document'
    });
  }
}));
