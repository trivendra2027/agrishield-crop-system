import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, ExternalLink, Calendar, Clock, Eye } from 'lucide-react';
import { Card, Button } from '../components/ui/index';

const PredictionHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal / Action states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleting, setDeleting] = useState(false);

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectRecord, setInspectRecord] = useState(null);

  const backendBaseUrl = import.meta.env.VITE_API_URL || '';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search: search || undefined,
        status: statusFilter || undefined
      };
      
      const res = await API.get('/api/history', { params });
      setHistory(res.data.predictions);
      setTotalPages(res.data.pages);
      setTotalRecords(res.data.total);
    } catch (error) {
      console.error("Failed to load prediction history:", error);
      showToast("Error loading historical database records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
    // Timeout to allow state to clear before invoking fetch
    setTimeout(() => {
      fetchHistory();
    }, 50);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const openDeleteConfirm = (id) => {
    setSelectedRecordId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecordId) return;
    setDeleting(true);
    try {
      await API.delete(`/api/history/${selectedRecordId}`);
      showToast("History record deleted successfully.");
      setDeleteModalOpen(false);
      setSelectedRecordId(null);
      
      // If we deleted the last record of current page, step page back if possible
      if (history.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete the selected record.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openInspectModal = (record) => {
    setInspectRecord(record);
    setInspectModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display font-extrabold text-gray-900 text-3xl tracking-tight">Scan History</h1>
        <p className="text-gray-500 text-sm">Review, filter, and manage previous AI leaf diagnosis logs.</p>
      </div>

      {/* Query Search / Filter Panel */}
      <Card className="p-4" hover={false}>
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by crop (e.g. Tomato) or disease..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-slate-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Filter className="h-4 w-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="block w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer text-gray-600 font-medium"
              >
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="">All Statuses</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="healthy">Healthy</option>
                <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value="diseased">Diseased</option>
              </select>
            </div>

            <Button type="submit" size="sm">Search</Button>
            <Button type="button" onClick={handleResetFilters} variant="outline" size="sm">Reset</Button>
          </div>
        </form>
      </Card>

      {/* History Grid List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader size="md" />
        </div>
      ) : history.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 p-8">
          <span className="text-3xl">📭</span>
          <h3 className="font-display font-bold text-gray-900 text-base mt-2">No Records Found</h3>
          <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">Try refining your search terms or perform a new crop scan to populate logs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {history.map((rec) => {
              const displayDisease = rec.disease_name === 'Healthy' 
                ? 'Healthy Leaf Structure' 
                : rec.disease_name.split('___').pop().replace(/_/g, ' ');
              
              return (
                <Card key={rec.id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Thumbnail block */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                      <img 
                        src={
                          rec.image_path?.startsWith('http') || rec.image_path?.startsWith('data:') 
                            ? rec.image_path 
                            : `/${rec.image_path?.replace(/^\//, '')}`
                        } 
                        alt="Crop leaf thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300"; // fallback
                        }}
                      />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        rec.prediction_status === 'healthy' 
                          ? 'bg-emerald-500 text-white shadow-sm' 
                          : 'bg-red-500 text-white shadow-sm'
                      }`}>
                        {rec.prediction_status.toUpperCase()}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-display font-bold text-gray-900 text-sm">{rec.crop_name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={displayDisease}>
                          {displayDisease}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold border-t border-slate-50 pt-2.5">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {rec.prediction_date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rec.prediction_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex border-t border-gray-100 bg-gray-50/50">
                    <button 
                      onClick={() => openInspectModal(rec)}
                      className="flex-1 py-3 text-xs font-semibold text-gray-600 hover:text-primary-700 hover:bg-gray-100/50 flex items-center justify-center gap-1 border-r border-gray-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm(rec.id)}
                      className="flex-1 py-3 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50/30 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controllers */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <span className="text-xs text-gray-500">
                Showing page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({totalRecords} records)
              </span>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setPage(p => Math.max(p - 1, 1))} 
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button 
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Record Deletion"
        footerActions={
          <>
            <Button onClick={() => setDeleteModalOpen(false)} variant="outline" size="sm">Cancel</Button>
            <Button onClick={handleDeleteRecord} variant="danger" loading={deleting} size="sm">Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to permanently delete this diagnosis history record? The uploaded leaf image file will be deleted from the server storage, and this action cannot be undone.
        </p>
      </Modal>

      {/* Inspect Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={`${inspectRecord?.crop_name} Scan Details`}
        footerActions={
          <Button onClick={() => setInspectModalOpen(false)} size="sm">Close</Button>
        }
      >
        {inspectRecord && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 aspect-square bg-slate-900 rounded-xl overflow-hidden relative">
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-10">Original Image</span>
                <img 
                  src={
                    inspectRecord.image_path?.startsWith('http') || inspectRecord.image_path?.startsWith('data:') 
                      ? inspectRecord.image_path 
                      : `/${inspectRecord.image_path?.replace(/^\//, '')}`
                  } 
                  alt="Leaf scan" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300";
                  }}
                />
              </div>
              {(inspectRecord.gradcam_base64 || inspectRecord.heatmap_base64) && (
                <div className="flex-1 aspect-square bg-slate-900 rounded-xl overflow-hidden relative">
                  <span className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-10">GradCAM Heatmap</span>
                  <img 
                    src={
                      (inspectRecord.gradcam_base64 || inspectRecord.heatmap_base64).startsWith('data:') 
                        ? (inspectRecord.gradcam_base64 || inspectRecord.heatmap_base64)
                        : `data:image/jpeg;base64,${inspectRecord.gradcam_base64 || inspectRecord.heatmap_base64}`
                    } 
                    alt="GradCAM" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Crop Type</p>
                <p className="font-bold text-gray-900 mt-0.5">{inspectRecord.crop_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Diagnosis</p>
                <p className="font-bold text-gray-900 mt-0.5">
                  {inspectRecord.disease_name === 'Healthy' ? 'Healthy Leaf' : inspectRecord.disease_name.split('___').pop().replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Confidence Score</p>
                <p className="font-bold text-primary-600 mt-0.5">{(inspectRecord.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Scan Date/Time</p>
                <p className="text-gray-600 mt-0.5">{inspectRecord.prediction_date} @ {inspectRecord.prediction_time}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
};

export default PredictionHistoryPage;
