import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  status: string;
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('Performance Summary');

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReportName,
          type: newReportType,
          status: 'Processing',
          size: 'Calculating...'
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');
      
      toast.success('Report generation started');
      setShowModal(false);
      setNewReportName('');
      fetchReports();

      // Simulate processing completion after 3 seconds
      setTimeout(async () => {
        const newReport = await response.clone().json();
        await fetch(`/api/reports/${newReport.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Ready',
            size: (Math.random() * 5 + 1).toFixed(1) + ' MB'
          })
        });
        fetchReports();
        toast.success(`Report "${newReportName}" is ready!`);
      }, 3000);

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete report');
      toast.success('Report deleted');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    report.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Reports</h1>
          <p className="text-on-surface-variant mt-1">Access and export your generated data summaries.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
        >
          <FileText className="w-5 h-5" />
          Generate New Report
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search reports by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Reports Grid/List */}
      <div className="bg-surface-container-lowest rounded-2xl no-line-card border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Report Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date Generated</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Size</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                    {searchQuery ? "No reports match your search." : "No reports found. Generate one to get started."}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-container-low rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{report.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{report.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant font-medium">{report.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant font-medium">{new Date(report.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant font-medium">{report.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {report.status === 'Ready' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : report.status === 'Processing' ? (
                          <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-error" />
                        )}
                        <span className={cn(
                          "text-xs font-bold",
                          report.status === 'Ready' ? "text-emerald-600" : 
                          report.status === 'Processing' ? "text-amber-600" : "text-error"
                        )}>
                          {report.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          disabled={report.status !== 'Ready'}
                          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h2 className="text-xl font-headline font-bold text-on-surface">Generate Report</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerateReport} className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-on-surface mb-2 block">Report Name</span>
                  <input 
                    type="text" 
                    required
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                    placeholder="e.g., Q3 Campaign Performance"
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </label>
                
                <label className="block">
                  <span className="text-sm font-bold text-on-surface mb-2 block">Report Template</span>
                  <select 
                    value={newReportType}
                    onChange={(e) => setNewReportType(e.target.value)}
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="Performance Summary">Performance Summary</option>
                    <option value="Audience Insights">Audience Insights</option>
                    <option value="Campaign ROI">Campaign ROI</option>
                    <option value="Engagement Metrics">Engagement Metrics</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
