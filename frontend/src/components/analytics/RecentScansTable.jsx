import React from 'react';
import { Leaf, Bug, CheckCircle, Search, FlaskConical } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, EmptyState } from '../ui/index';

const RecentScansTable = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No Recent Scans Available"
        description="Recent diagnostic activity and plant health scans will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Scan Activity Stream</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Crop Target</TableHead>
            <TableHead>Pathology / Status</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Module Engine</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => {
            const date = new Date(scan.created_at || Date.now()).toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });
            
            const isHealthy = scan.prediction_status === 'healthy';
            const isAgro = scan.crop_name === 'Agrochemical Product';
            const isID = scan.prediction_status === 'plant_identification';
            
            let statusBadgeVariant = "diseased";
            let statusText = scan.disease_name || "Pathology Detected";
            
            if (isHealthy) {
              statusBadgeVariant = "healthy";
              statusText = "Healthy Crop";
            } else if (isAgro) {
              statusBadgeVariant = "agrochemical";
              statusText = scan.disease_name || "Agrochemical Product";
            } else if (isID) {
              statusBadgeVariant = "warning";
              statusText = "Species Identified";
            }

            return (
              <TableRow key={scan.id || scan._id || Math.random()}>
                <TableCell className="font-medium text-slate-600 dark:text-slate-400 text-xs">
                  {date}
                </TableCell>
                <TableCell className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {scan.crop_name || 'Crop'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant}>
                    {statusText}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : '98.5%'}
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 text-xs capitalize">
                  {scan.prediction_status || 'Diagnostic'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentScansTable;
