'use client';

import React, { useState, useEffect } from 'react';
import { get_data } from './api/system/route';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
 
import { 
  getAnomalies, 
  getCpuPercent, 
  getRamPercent, 
  formatTimestamp, 
  calculateAverage,  
  getmultianomalydata,
  getAnomalyData 
} from '../../Algo/algo';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export default function SystemAnalysis() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const getData = await get_data();
      const anomalies = getAnomalies(getData);
      delete getData.anomolies;
      const cpuData = getCpuPercent(getData);
      const ramData = getRamPercent(getData);
      const tabl_zscore_ram = getAnomalyData(getData, anomalies["zscore_anomalies_ram"], 'ram');
      const tabl_zscore_cpu = getAnomalyData(getData, anomalies["zscore_anomalies_cpu"], 'cpu');
      const tabl_isolationforest_ram = getAnomalyData(getData, anomalies["isolation_forest_anomalies_ram"], 'ram');
      const tabl_isolationforest_cpu = getAnomalyData(getData, anomalies["isolation_forest_anomalies_cpu"], 'cpu');
      const tabl_multi_isolationforest_cpu = getmultianomalydata(getData,anomalies["multivariate_isolation_forest_anomalies"]);
      const tabl_multi_zscore_cpu = getmultianomalydata(getData,anomalies["multivariate_zscore_anomalies"]);
      setResults({ cpuData, ramData, anomalies, tabl_zscore_ram, tabl_zscore_cpu, tabl_isolationforest_ram, tabl_isolationforest_cpu, tabl_multi_isolationforest_cpu, tabl_multi_zscore_cpu });
    } catch (error) {
      console.error('Error during analysis:', error);
      setError('An error occurred during the analysis. Please try again.');
    }
    setLoading(false);
  };

  const renderChart = (data, dataKey, anomalies, anomalyKey, color, avgData = null, title = null) => {
    let anomalyData = [];

    if (anomalies && anomalies[anomalyKey]) {
      const anomalyIndices = anomalies[anomalyKey];
      anomalyData = anomalyIndices.map(index => ({
        x: index,
        y: avgData ? avgData[index] : data[index]
      }));
    } else {
      console.warn(`No anomalies found for key: ${anomalyKey}`);
    }

    const chartData = {
      labels: data.map((_, index) => index),
      datasets: [
        {
          label: avgData ? 'Average CPU & RAM Usage' : (dataKey === 'cpu' ? 'CPU Usage' : 'RAM Usage'),
          data: avgData || data,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
        {
          label: 'Anomalies',
          data: anomalyData,
          borderColor: 'red',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          pointRadius: 2,
          pointHoverRadius: 4,
          borderWidth: 1,
          showLine: false,
          pointStyle: 'circle',
        }
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const datasetLabel = context.dataset.label || '';
              const value = context.parsed.y;
              const index = context.parsed.x;
              return `${datasetLabel}: ${value.toFixed(2)} (Index: ${index})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          
        },
        y: {
          beginAtZero: true,
          max: 100,
         
        },
      },
    };

    return (
      <div style={{ width: '100%', height: '400px' } }>
        <Line data={chartData} options={options} />
      </div>
    );
  };

  const renderTable = (data) => {
    if (!data) return null;
  
    return (
      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="w-full border-collapse">
      <thead>
      <tr className="bg-orange-600">
        <th className="border p-2 text-white"style={{ borderColor: '#FB8C00' }}>Timestamp</th>
        <th className="border p-2 text-white"style={{ borderColor: '#FB8C00' }}>Process ID</th>
        <th className="border p-2 text-white"style={{ borderColor: '#FB8C00' }}>CPU Usage (%)</th>
        <th className="border p-2 text-white"style={{ borderColor: '#FB8C00' }}>RAM Usage (%)</th>
        <th className="border p-2 text-white"style={{ borderColor: '#FB8C00' }}>Status</th>
      </tr>
      </thead>
      <tbody>
      {Object.entries(data).map(([timestamp, process]) => (
        <tr key={timestamp} className="hover:bg-orange-200" >
        <td className="border p-2" style={{ borderColor: '#FF5722' }}>{formatTimestamp(parseFloat(timestamp))}</td>
        <td className="border p-2" style={{ borderColor: '#FF5722' }}>{process.pid}</td>
        <td className="border p-2" style={{ borderColor: '#FF5722' }}>{process.cpu_percent.toFixed(2)}</td>
        <td className="border p-2" style={{ borderColor: '#FF5722' }}>{process.memory_percent.toFixed(2)}</td>
        <td className="border p-2" style={{ borderColor: '#FF5722' }}>{process.status}</td>
        </tr>
      ))}
      </tbody>
      </table>
      </div>
    );
  };

  const ChartTableWrapper = ({ chart, table, title }) => (
    <div className="mb-10 ">
      <h2 className="text-2xl font-bold mb-4 text-center bg-orange-600 text-white">{title}</h2>
      <div className="flex gap-4 p-2 border" style={{ borderWidth: '2px', borderColor: '#FF5722' }}>
        <div className="flex-1 " >{chart}</div>
        <div className="border-l border" style={{ borderWidth: '1px', borderColor: '#FF5722' }}></div> {/* Add vertical separator */}
        <div className="flex-1 ">{table}</div>
      </div>
    </div>
  );

  
  return (
    <div className="flex flex-col justify-center items-center space-y-2 m-5">
      <button className="bg-orange-600 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded shadow" onClick={handleAnalysis} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analysis'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && results.cpuData && results.ramData && (
        <div className="w-full">
          <ChartTableWrapper
            title="CPU Usage - Z-Score Anomaly Detection"
            chart={renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'zscore_anomalies_cpu', '#8884d8')}
            table={renderTable(results.tabl_zscore_cpu)}
          />
          <ChartTableWrapper
            title="RAM Usage - Z-Score Anomaly Detection"
            chart={renderChart(results.ramData, 'ram', results.anomalies || {}, 'zscore_anomalies_ram', '#82ca9d')}
            table={renderTable(results.tabl_zscore_ram)}
          />
          <ChartTableWrapper
            title="CPU Usage - Isolation Forest Anomaly Detection"
            chart={renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'isolation_forest_anomalies_cpu', '#8884d8')}
            table={renderTable(results.tabl_isolationforest_cpu)}
          />
          <ChartTableWrapper
            title="RAM Usage - Isolation Forest Anomaly Detection"
            chart={renderChart(results.ramData, 'ram', results.anomalies || {}, 'isolation_forest_anomalies_ram', '#82ca9d')}
            table={renderTable(results.tabl_isolationforest_ram)}
          />
          <ChartTableWrapper
            title="Accumulative Anomalies - Multivariate Isolation Forest"
            chart={renderChart(
              calculateAverage(results.cpuData, results.ramData),
              'avg',
              results.anomalies || {},
              'multivariate_isolation_forest_anomalies',
              '#8884d8',
              calculateAverage(results.cpuData, results.ramData)
            )}
            table={renderTable(results.tabl_multi_isolationforest_cpu)}
          />
          <ChartTableWrapper
            title="Accumulative Anomalies - Multivariate Z-Score"
            chart={renderChart(
              calculateAverage(results.cpuData, results.ramData),
              'avg',
              results.anomalies || {},
              'multivariate_zscore_anomalies',
              '#82ca9d',
              calculateAverage(results.cpuData, results.ramData)
            )}
            table={renderTable(results.tabl_multi_zscore_cpu)}
          />
        </div>
      )}
    </div>
  );
}