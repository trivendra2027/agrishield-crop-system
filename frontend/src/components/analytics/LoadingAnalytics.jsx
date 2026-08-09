import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-full">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>
      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse h-[350px]">
    <div className="h-5 bg-slate-200 rounded w-1/4 mb-6"></div>
    <div className="h-full bg-slate-100 rounded w-full"></div>
  </div>
);

const LoadingAnalytics = () => {
  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <SkeletonChart />
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse h-64">
            <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnalytics;
