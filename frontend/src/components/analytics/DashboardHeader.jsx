import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';

const DashboardHeader = ({ metadata, onRefresh, isRefreshing }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Farm Analytics</h1>
        {metadata && (
          <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
            <Clock className="w-3 h-3" />
            <span>
              Last Updated: {new Date(metadata.generated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {metadata.cache_status}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
