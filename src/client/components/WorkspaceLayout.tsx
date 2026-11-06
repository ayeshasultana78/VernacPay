import React, { useState, useEffect } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { Mic, Table } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';

interface WorkspaceLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  leftPane,
  rightPane,
}) => {
  const { activeTab, setActiveTab } = useAppStore();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (isMobileOrTablet) {
    return (
      <div className="flex-1 flex flex-col p-3 max-w-7xl w-full mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'workspace' | 'ledger')}
          className="w-full flex-1 flex flex-col"
        >
          <div className="flex justify-center mb-3">
            <TabsList className="grid grid-cols-2 w-full max-w-xs h-10">
              <TabsTrigger value="workspace" className="flex items-center gap-1.5 text-xs">
                <Mic className="w-3.5 h-3.5" />
                <span>Voice & Approval</span>
              </TabsTrigger>
              <TabsTrigger value="ledger" className="flex items-center gap-1.5 text-xs">
                <Table className="w-3.5 h-3.5" />
                <span>PayPal Ledger</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workspace" className="flex-1 mt-0">
            {leftPane}
          </TabsContent>

          <TabsContent value="ledger" className="flex-1 mt-0">
            {rightPane}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-7xl w-full mx-auto h-[calc(100vh-112px)] min-h-[640px]">
      <Group
        orientation="horizontal"
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm h-full"
      >
        {/* Left Pane: Voice & Approval (~42%) */}
        <Panel defaultSize="42%" minSize="30%" maxSize="55%" className="overflow-y-auto p-4 flex flex-col">
          {leftPane}
        </Panel>

        {/* Resizable Divider Handle (Keyboard accessible) */}
        <Separator
          className="w-1.5 bg-[var(--border-subtle)] hover:bg-[var(--accent-primary)] focus-visible:bg-[var(--accent-primary)] transition-colors cursor-col-resize flex items-center justify-center relative group"
          aria-label="Resize workspace panes"
        >
          <div className="w-0.5 h-8 rounded-full bg-[var(--text-dim)] group-hover:bg-white transition-colors" />
        </Separator>

        {/* Right Pane: AG Grid Ledger (~58%) */}
        <Panel defaultSize="58%" minSize="45%" className="overflow-y-auto p-4 flex flex-col">
          {rightPane}
        </Panel>
      </Group>
    </div>
  );
};
