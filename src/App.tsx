/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { CanvasWrapper } from '@/components/canvas/Canvas';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useStore } from '@/store/useStore';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { PropertyEditorDialog } from '@/components/preview/PropertyEditorDialog';

export default function App() {
  const loadTemplate = useStore(state => state.loadTemplate);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <header className="h-[60px] border-b bg-card flex items-center justify-between px-6 z-[100] shrink-0">
          <div className="font-extrabold text-lg text-primary flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>HPM | SkillBlock</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Project: SmartWatch Pro Gen.3</span>
            <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold">DVT Phase</div>
            <button onClick={loadTemplate} className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border-none rounded-md font-semibold text-[13px]">Load Template</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border-none rounded-md font-semibold text-[13px]">Export PRD</button>
          </div>
        </header>
        <main className="flex-1 flex overflow-hidden min-h-0">
          <Sidebar />
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={65} minSize={30}>
              <CanvasWrapper />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={20} collapsible={true} collapsedSize={0}>
              <PreviewPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
      <PropertyEditorDialog />
    </TooltipProvider>
  );
}
