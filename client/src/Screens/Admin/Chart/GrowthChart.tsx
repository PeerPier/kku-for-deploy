import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

interface GrowthChartProps {
  data: any[];
}

interface BlogCountByMonth {
  month: string;
  blogCount: number;
}

function transformBlogData(blogs: any[]): BlogCountByMonth[] {
  const monthCount: { [key: string]: number } = {};

  if (blogs && Array.isArray(blogs)) {
    blogs.forEach((blog) => {
      const date = new Date(blog.publishedAt);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      monthCount[monthYear] = (monthCount[monthYear] || 0) + 1;
    });
  }

  const emptyMonths: BlogCountByMonth[] = Array.from({ length: 7 }, (_, i) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    const monthYear = monthDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    return { month: monthYear, blogCount: monthCount[monthYear] || 0 };
  });

  return emptyMonths.reverse();
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [charts, setCharts] = useState<BlogCountByMonth[]>([]);

  useEffect(() => {
    const transformedData = transformBlogData(data);
    setCharts(transformedData);
  }, [data]);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar", // เปลี่ยนประเภทเป็นแผนภูมิแท่ง
          data: {
            labels: charts.map((item) => item.month),
            datasets: [
              {
                label: "ยอดการโพสต์ทั้งหมด",
                data: charts.map((item) => item.blogCount),
                backgroundColor: "rgba(75, 192, 192, 0.2)", // สีพื้นหลังของแท่ง
                borderColor: "rgba(75, 192, 192, 1)", // สีขอบของแท่ง
                borderWidth: 1, // ความหนาของขอบ
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false, // ไม่แสดงกริดในแกน Y
                },
              },
              x: {
                grid: {
                  display: false, // ไม่แสดงกริดในแกน X
                },
              },
            },
          },
        });
      }
    }
  }, [charts]);

  return <canvas ref={chartRef} style={{ height: "180px" }} />;
};

export default GrowthChart;
