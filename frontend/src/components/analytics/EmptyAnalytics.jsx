import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LineChart, Camera } from 'lucide-react';

const EmptyAnalytics = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <LineChart className="w-12 h-12 text-primary-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Scan History Available</h2>
        <p className="text-slate-500 mb-8">
          It looks like you haven't performed any AI scans yet. Once you start scanning crops for diseases or identifying plants, your analytics dashboard will automatically populate with valuable insights.
        </p>
        
        <Link 
          to="/upload" 
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Camera className="w-5 h-5" />
          <span>Start Your First Scan</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default EmptyAnalytics;
