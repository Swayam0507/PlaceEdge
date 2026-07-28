import { useState, useEffect, useCallback } from "react";
import { getAdminAnalytics, exportReport } from "../services/api";
import {
  PieChart, Download, Users, FileText,
  List, TrendingUp, BarChart2, Award, BookOpen, Zap,
  RefreshCw, Calendar, ArrowUp, ArrowDown, Clock
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Filler,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Filler,
  Title, Tooltip, Legend
);

const DATE_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 0 },
];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(30);

  const fetchAnalytics = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const response = await getAdminAnalytics();
      setAnalytics(response.data.analytics);
      setLastUpdated(new Date());
      if (showToast) toast.success('Dashboard refreshed!');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics.");
      if (showToast) toast.error('Failed to refresh');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 5 min
  useEffect(() => {
    const interval = setInterval(() => fetchAnalytics(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await exportReport(type);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} report exported!`);
    } catch (err) {
      toast.error("Export failed.");
    } finally {
      setExporting("");
    }
  };

  const handlePDFExport = () => {
    if (!analytics) return;
    const doc = new jsPDF();
    const overview = analytics.overview || {};

    // Title
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('PlaceEdge - Admin Analytics Report', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Overview
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Platform Overview', 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [['Metric', 'Value']],
      body: [
        ['Total Students', overview.totalStudents || 0],
        ['Total Questions', overview.totalQuestions || 0],
        ['Test Attempts', overview.totalTests || 0],
        ['Average Score', `${overview.avgScore || 0}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Top Performers
    if (analytics.topPerformers?.length > 0) {
      doc.text('Top Performers', 14, doc.lastAutoTable.finalY + 12);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Rank', 'Name', 'Email', 'Avg Score', 'Tests']],
        body: analytics.topPerformers.map((p, i) => [
          `#${i + 1}`, p.name, p.email, `${p.avgScore}%`, p.totalTests
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    // Category Performance
    if (analytics.categoryPerformance?.length > 0) {
      doc.addPage();
      doc.text('Category Performance', 14, 20);
      autoTable(doc, {
        startY: 24,
        head: [['Category', 'Avg Score', 'Best Score', 'Attempts']],
        body: analytics.categoryPerformance.map(c => [
          c.category, `${c.avgScore}%`, `${c.bestScore}%`, c.totalAttempts
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    doc.save(`PlaceEdge_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF report downloaded!');
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-screen">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading admin analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const overview = analytics?.overview || {};

  // Filter recent data by date range
  const filterByDateRange = (data) => {
    if (!data || dateRange === 0) return data || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return data.filter(d => new Date(d._id || d.date) >= cutoff);
  };

  const recentRegs = filterByDateRange(analytics?.recentRegistrations);
  const recentTests = filterByDateRange(analytics?.recentTests);

  // --- Chart Data ---
  const categoryChartData = {
    labels: analytics?.categoryPerformance?.map(cat => cat.category.charAt(0).toUpperCase() + cat.category.slice(1)) || [],
    datasets: [
      {
        label: 'Average Score (%)',
        data: analytics?.categoryPerformance?.map(cat => cat.avgScore) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Best Score (%)',
        data: analytics?.categoryPerformance?.map(cat => cat.bestScore) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      }
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          afterBody: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const attempts = analytics?.categoryPerformance[index]?.totalAttempts || 0;
            return `\nTotal Attempts: ${attempts}`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  };

  const scoreChartData = {
    labels: analytics?.scoreDistribution?.map(bucket => bucket.range) || [],
    datasets: [{
      label: 'Number of Students',
      data: analytics?.scoreDistribution?.map(bucket => bucket.count) || [],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(99, 102, 241, 0.7)',
        'rgba(16, 185, 129, 0.7)',
      ],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const scoreChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  const qCategoryData = {
    labels: analytics?.categoryDistribution?.map(c => c.category.charAt(0).toUpperCase() + c.category.slice(1)) || [],
    datasets: [{
      data: analytics?.categoryDistribution?.map(c => c.count) || [],
      backgroundColor: ['rgba(99,102,241,0.75)', 'rgba(16,185,129,0.75)', 'rgba(245,158,11,0.75)', 'rgba(239,68,68,0.75)', 'rgba(14,165,233,0.75)'],
      borderWidth: 0,
    }]
  };

  const qDifficultyData = {
    labels: analytics?.difficultyStats?.map(d => d.difficulty.charAt(0).toUpperCase() + d.difficulty.slice(1)) || [],
    datasets: [{
      data: analytics?.difficultyStats?.map(d => d.count) || [],
      backgroundColor: ['rgba(16,185,129,0.75)', 'rgba(245,158,11,0.75)', 'rgba(239,68,68,0.75)'],
      borderWidth: 0,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  // Recent Activity Line Chart
  const activityLabels = recentRegs?.map(r => {
    const d = new Date(r._id || r.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }) || [];

  const activityChartData = {
    labels: activityLabels,
    datasets: [
      {
        label: 'New Registrations',
        data: recentRegs?.map(r => r.count) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#6366f1',
      },
      {
        label: 'Tests Taken',
        data: recentTests?.map(t => t.count) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
      }
    ],
  };

  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Stat cards config
  const statCards = [
    { label: 'Total Students', value: overview.totalStudents || 0, icon: Users, color: '#6366f1', target: 'top-performers' },
    { label: 'Questions', value: overview.totalQuestions || 0, icon: FileText, color: '#ea580c', target: 'questions-category' },
    { label: 'Test Attempts', value: overview.totalTests || 0, icon: List, color: '#0891b2', target: 'category-performance' },
    { label: 'Avg Score', value: `${overview.avgScore || 0}%`, icon: TrendingUp, color: '#dc2626', target: 'score-distribution' },
  ];

  const getTimeAgo = () => {
    if (!lastUpdated) return '';
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col space-y-8">

        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border border-indigo-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink mb-1">
              Welcome back, Admin
            </h1>
            <p className="font-body text-sm text-muted font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {recentRegs?.length > 0 && ` • ${recentRegs.reduce((s, r) => s + r.count, 0)} signups in ${dateRange || 'all'} days`}
              {recentTests?.length > 0 && ` • ${recentTests.reduce((s, t) => s + t.count, 0)} tests taken`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range */}
            <div className="flex bg-white rounded-xl border border-line overflow-hidden shadow-sm">
              {DATE_RANGES.map(r => (
                <button
                  key={r.days}
                  onClick={() => setDateRange(r.days)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${dateRange === r.days ? 'bg-ink text-white' : 'text-muted hover:bg-gray-50'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {/* Refresh */}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-line rounded-xl text-ink-soft hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70"
              title={`Last updated: ${getTimeAgo()}`}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {getTimeAgo() || 'Refresh'}
            </button>
            {/* Export buttons */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-line rounded-xl text-ink-soft hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70" onClick={() => handleExport("users")} disabled={!!exporting}>
              <Download size={14} /> {exporting === "users" ? "..." : "CSV"}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-ink text-white rounded-xl hover:bg-ink-soft transition-colors shadow-sm" onClick={handlePDFExport}>
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-paper-raised border border-line rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-ink/20 hover:-translate-y-1 transition-all shadow-sm group"
                onClick={() => scrollToSection(card.target)}
                title={`Click to view details`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 shrink-0" style={{
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <span className="block font-display font-bold text-2xl text-ink leading-none mb-1">{card.value}</span>
                  <span className="block text-xs font-semibold text-muted uppercase tracking-wider">{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity Line Chart */}
        {(recentRegs?.length > 0 || recentTests?.length > 0) && (
          <div id="recent-activity" className="scroll-mt-24">
            <h2 className="flex items-center gap-2 font-display font-bold text-xl text-ink mb-4">
              <Clock className="text-indigo-500" /> Platform Activity
              <span className="text-xs font-semibold text-muted ml-auto uppercase tracking-wider">
                {dateRange > 0 ? `Last ${dateRange} days` : 'All time'}
              </span>
            </h2>
            <div className="h-80 p-5 bg-white rounded-2xl border border-line shadow-sm">
              <Line data={activityChartData} options={activityChartOptions} />
            </div>
          </div>
        )}

        {/* Category Performance */}
        {analytics?.categoryPerformance?.length > 0 && (
          <div id="category-performance" className="scroll-mt-24">
            <h2 className="flex items-center gap-2 font-display font-bold text-xl text-ink mb-4">
              <BarChart2 className="text-indigo-500" /> Category Performance
            </h2>
            <div className="h-80 p-5 bg-white rounded-2xl border border-line shadow-sm">
              <Bar data={categoryChartData} options={categoryChartOptions} />
            </div>
          </div>
        )}

        {/* Score Distribution */}
        {analytics?.scoreDistribution?.length > 0 && (
          <div id="score-distribution" className="scroll-mt-24">
            <h2 className="flex items-center gap-2 font-display font-bold text-xl text-ink mb-4">
              <PieChart className="text-sky-500" /> Score Distribution
            </h2>
            <div className="h-80 p-5 bg-white rounded-2xl border border-line shadow-sm">
              <Bar data={scoreChartData} options={scoreChartOptions} />
            </div>
          </div>
        )}

        {/* Top Performers */}
        {analytics?.topPerformers?.length > 0 && (
          <div id="top-performers" className="scroll-mt-24">
            <h2 className="flex items-center gap-2 font-display font-bold text-xl text-ink mb-4">
              <Award className="text-amber-500" /> Top Performers
            </h2>
            <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-line text-xs uppercase tracking-wider text-muted font-semibold">
                      <th className="p-4">#</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Avg Score</th>
                      <th className="p-4">Tests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {analytics.topPerformers.map((perf, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-bold text-xs ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `#${i + 1}`}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-ink">{perf.name}</td>
                        <td className="p-4 text-ink-soft">{perf.email}</td>
                        <td className="p-4">
                          <span className={`font-bold ${perf.avgScore >= 70 ? "text-emerald" : perf.avgScore >= 40 ? "text-amber-deep" : "text-coral"}`}>
                            {perf.avgScore}%
                          </span>
                        </td>
                        <td className="p-4 text-ink-soft">{perf.totalTests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Question Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24" id="questions-category">
          {analytics?.categoryDistribution?.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-display font-bold text-xl text-ink mb-4">
                <BookOpen className="text-blue-500" /> Questions by Category
              </h2>
              <div className="h-72 p-5 bg-white rounded-2xl border border-line shadow-sm">
                <Doughnut data={qCategoryData} options={doughnutOptions} />
              </div>
            </div>
          )}

          {analytics?.difficultyStats?.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-display font-bold text-xl text-ink mb-4">
                <Zap className="text-amber-500" /> Questions by Difficulty
              </h2>
              <div className="h-72 p-5 bg-white rounded-2xl border border-line shadow-sm">
                <Doughnut data={qDifficultyData} options={doughnutOptions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
