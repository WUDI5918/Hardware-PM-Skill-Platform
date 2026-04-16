import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/store/useStore';
import { CustomComponentNode } from './CustomNodes';

const nodeTypes = {
  customComponent: CustomComponentNode,
};

export function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
        fitView
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export function CanvasWrapper() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
