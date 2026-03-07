import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const DashboardAreaChart = ({
  labels,
  datasets,
}: {
  labels: string[];
  datasets: Array<{ label: string; data: number[]; border_color: string; background_color: string }>;
}) => {
  const data: ChartData<'line'> = {
    labels,
    datasets: datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.border_color,
      backgroundColor: dataset.background_color,
      fill: true,
      tension: 0.38,
      pointRadius: 2,
      pointHoverRadius: 5,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true } },
      tooltip: { enabled: true, backgroundColor: '#111827' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { grid: { display: false } },
    },
  };

  return <Line data={data} options={options} />;
};
