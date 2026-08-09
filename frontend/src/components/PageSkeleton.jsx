import React from 'react';
import { Skeleton } from './ui/index';

const PageSkeleton = () => (
  <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200" aria-label="Loading page content" role="status">
    <span className="sr-only">Loading…</span>

    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>

    {/* KPI Row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>

    {/* Main Content Grid */}
    <div className="grid lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-2 h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>

    {/* Chart Row */}
    <div className="grid lg:grid-cols-2 gap-6">
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>

    {/* Table Skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

export default PageSkeleton;
