"use client";

import { ReactNode, createContext, useContext } from "react";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  value: "",
  onChange: () => {},
});

export interface TabsRootProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function TabsRoot({ value, onChange, children, className = "" }: TabsRootProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1 ${className}`}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className = "" }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onChange(value)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;

  return (
    <div role="tabpanel" className={`mt-4 ${className}`}>
      {children}
    </div>
  );
}
