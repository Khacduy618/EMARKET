import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { FC, useEffect, useState } from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import axios from 'axios';

type Props = {
  apiUrl: string;
};

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartOrderSuccessRate: FC<Props> = ({ apiUrl }) => {
  const [chartData, setChartData] = useState<ChartData<'pie', number[], string>>({
    labels: ['Giao thành công', 'Trả hàng', 'Đơn bị hủy'],
    datasets: [
      {
        label: 'Tỷ lệ đơn hàng',
        data: [0, 0, 0],
        backgroundColor: ['#4CAF50', '#FF9800', '#808080'],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        const data = res.data.summaryDataChart;

        setChartData({
          labels: ['Giao thành công', 'Trả hàng', 'Đơn bị hủy'],
          datasets: [
            {
              label: 'Tỷ lệ đơn hàng',
              data: [
                Number(data.Completed) || 0,
                Number(data.Returned) || 0,
                Number(data.Cancelled) || 0,
              ],
              backgroundColor: ['#4CAF50', '#FF9800', '#808080'],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu biểu đồ:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { 
        // display: false, 
        position: 'bottom' 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const data = context.dataset.data as number[];
            const total = data.reduce((acc, val) => acc + val, 0);
            const percent = total ? ((value / total) * 100).toFixed(2) : '0';

            return `${label}: ${value} đơn (${percent}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '220px', margin: 'auto' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ChartOrderSuccessRate;
