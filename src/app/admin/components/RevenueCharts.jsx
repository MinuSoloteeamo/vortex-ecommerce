'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styles from './RevenueCharts.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = [
  '#00e5ff',
  '#ff3366',
  '#7c3aed',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#22d3ee',
  '#a78bfa',
  '#fbbf24',
];

const PERIODS = [
  { key: 'year', label: 'Năm' },
  { key: 'quarter', label: 'Quý' },
  { key: 'month', label: 'Tháng' },
  { key: 'day', label: 'Ngày' },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
};

export default function RevenueCharts() {
  const now = new Date();
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, year: String(year), month: String(month) });
      const res = await fetch(`/api/admin/revenue?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu doanh thu:', err);
    } finally {
      setLoading(false);
    }
  }, [period, year, month]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  // Generate year options: last 5 years
  const yearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) {
    yearOptions.push(y);
  }

  const monthOptions = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  // Bar chart config
  const barData = data?.timeline
    ? {
        labels: data.timeline.map((t) => t.label),
        datasets: [
          {
            label: 'Doanh thu',
            data: data.timeline.map((t) => t.revenue),
            backgroundColor: 'rgba(0, 229, 255, 0.7)',
            hoverBackgroundColor: 'rgba(0, 229, 255, 0.9)',
            borderColor: '#00e5ff',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: 'rgba(0, 229, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => `Doanh thu: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#888', font: { size: 12 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#888',
          font: { size: 12 },
          callback: (value) => formatCompact(value),
        },
      },
    },
  };

  // Doughnut chart builder
  const buildDoughnutData = (items) => {
    if (!items || items.length === 0) return null;
    return {
      labels: items.map((i) => i.name),
      datasets: [
        {
          data: items.map((i) => i.revenue),
          backgroundColor: items.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
          hoverBackgroundColor: items.map(
            (_, idx) => CHART_COLORS[idx % CHART_COLORS.length]
          ),
          borderColor: 'rgba(0,0,0,0.3)',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#aaa',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: 'rgba(0, 229, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((sum, v) => sum + v, 0);
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
          },
        },
      },
    },
  };

  const categoryData = buildDoughnutData(data?.byCategory);
  const brandData = buildDoughnutData(data?.byBrand);
  const paymentData = buildDoughnutData(data?.byPayment);

  const getTimelineTitle = () => {
    if (period === 'year') return 'Doanh thu theo năm';
    if (period === 'quarter') return `Doanh thu theo quý — ${year}`;
    if (period === 'month') return `Doanh thu theo tháng — ${year}`;
    if (period === 'day') return `Doanh thu theo ngày — Tháng ${month}/${year}`;
    return 'Doanh thu';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>📊</span>
        Phân tích doanh thu
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.periodTabs}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`${styles.periodTab} ${period === p.key ? styles.periodTabActive : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.selectors}>
          {period !== 'year' && (
            <select
              className={styles.select}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          )}

          {period === 'day' && (
            <select
              className={styles.select}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Đang tải dữ liệu doanh thu...</span>
        </div>
      )}

      {/* Charts */}
      {!loading && data && (
        <>
          {/* Bar Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>
              <span className={styles.chartTitleIcon}>📈</span>
              {getTimelineTitle()}
            </div>
            {barData && barData.datasets[0].data.some((v) => v > 0) ? (
              <div className={styles.barChartWrapper}>
                <Bar data={barData} options={barOptions} />
              </div>
            ) : (
              <div className={styles.emptyState}>Không có dữ liệu doanh thu cho khoảng thời gian này</div>
            )}
          </div>

          {/* Doughnut Charts */}
          <div className={styles.doughnutGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>
                <span className={styles.chartTitleIcon}>🏷️</span>
                Theo danh mục
              </div>
              {categoryData ? (
                <div className={styles.doughnutWrapper}>
                  <Doughnut data={categoryData} options={doughnutOptions} />
                </div>
              ) : (
                <div className={styles.emptyState}>Chưa có dữ liệu</div>
              )}
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>
                <span className={styles.chartTitleIcon}>🏢</span>
                Theo thương hiệu
              </div>
              {brandData ? (
                <div className={styles.doughnutWrapper}>
                  <Doughnut data={brandData} options={doughnutOptions} />
                </div>
              ) : (
                <div className={styles.emptyState}>Chưa có dữ liệu</div>
              )}
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>
                <span className={styles.chartTitleIcon}>💳</span>
                Theo phương thức thanh toán
              </div>
              {paymentData ? (
                <div className={styles.doughnutWrapper}>
                  <Doughnut data={paymentData} options={doughnutOptions} />
                </div>
              ) : (
                <div className={styles.emptyState}>Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* No data at all */}
      {!loading && !data && (
        <div className={styles.emptyState}>Không thể tải dữ liệu doanh thu. Vui lòng thử lại.</div>
      )}
    </div>
  );
}
