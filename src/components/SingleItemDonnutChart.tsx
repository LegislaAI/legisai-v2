import ReactApexChart from "react-apexcharts";

interface SingleDonutChartProps {
  total: number;
  current: number;
  height?: number;
}
const SingleDonutChart = ({
  total,
  current,
  height = 200,
}: SingleDonutChartProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const series = [percentage];
  const chartType = "radialBar" as const;

  const options = {
    chart: {
      type: chartType,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "60%", // mais espesso que "100%" porque o anel é fora do centro
          offsetY: 10,
        },
        track: {
          background: "#e7e7e7",
          strokeWidth: "100%", // largura do track
          margin: 0,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            formatter: () => `${Math.round(percentage)}%`,
            fontSize: "16px",
            fontWeight: "dark",
            color: "#749c5b", // cor primária
            show: true,
            offsetY: 5,
          },
        },
      },
    },
    fill: {
      colors: ["#749c5b"],
    },
    tooltip: {
      enabled: true,
      custom: () => {
        return `<div style="padding: 5px; font-size: 20px">${current} de ${total}</div>`;
      },
    },
    labels: ["Progresso"],
  };

  return (
    <div id="chart" className="bg-transparent">
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height={height}
        width={height}
      />
    </div>
  );
};

export default SingleDonutChart;
