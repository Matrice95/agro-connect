import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ScaleOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Configure default options
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

// Export configured ChartJS
export const Chart = ChartJS;

// Export default chart options
export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(0, 0, 0, 0.7)',
        font: {
          family: "'Poppins', sans-serif",
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(0, 0, 0, 0.7)',
        font: {
          family: "'Poppins', sans-serif",
          size: 12
        }
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: "'Poppins', sans-serif",
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#000',
      titleFont: {
        family: "'Poppins', sans-serif",
        size: 13,
        weight: '600'
      },
      bodyColor: '#666',
      bodyFont: {
        family: "'Poppins', sans-serif",
        size: 12
      },
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 12,
      boxPadding: 4
    }
  }
};