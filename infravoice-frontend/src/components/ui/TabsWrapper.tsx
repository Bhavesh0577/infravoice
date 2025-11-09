'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsWrapperProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  children?: React.ReactNode;
}

/**
 * Wrapper component for shadcn Tabs that provides backward compatibility
 * with the old Tabs API (tabs, activeTab, onChange props).
 * Used for pages that haven't been refactored yet.
 */
export default function TabsWrapper({ tabs, activeTab, onChange }: TabsWrapperProps) {
  return (
    <Tabs value={activeTab} onValueChange={onChange} className="w-full">
      <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none pb-0 h-auto">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent rounded-none pb-3"
          >
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
