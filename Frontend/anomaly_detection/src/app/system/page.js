'use client';

import React, { useState, useEffect } from 'react';
import './SystemAnalysis.css';
import { get_data } from '../api/system/route';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function getCpuPercent(apiResponse) {
  try {
    const cpudata = [];
    for (const key in apiResponse) {
      if (apiResponse.hasOwnProperty(key)) {
        cpudata.push(apiResponse[key]['cpu_usage']);
      }
    }
    return cpudata;
  } catch (error) {
    console.error('Error parsing API response of getting CPU Percentage:', error);
    return null;
  }
}

function getRamPercent(apiResponse) {
  try {
    const ramdata = [];
    for (const key in apiResponse) {
      if (apiResponse.hasOwnProperty(key)) {
        ramdata.push(apiResponse[key]['ram_usage']);
      }
    }
    return ramdata;
  } catch (error) {
    console.error('Error parsing API response of getting RAM Percentage:', error);
    return null;
  }
}

function getAnomalies(apiResponse) {
  try {
    return apiResponse.anomolies;
  } catch (error) {
    console.error('Error parsing API response of getting Anomalies:', error);
    return null;
  }
}

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
      setResults({ cpuData, ramData, anomalies });
    } catch (error) {
      console.error('Error during analysis:', error);
      setError('An error occurred during the analysis. Please try again.');
    }
    setLoading(false);
  };

  const renderChart = (data, dataKey, anomalies, anomalyKey, color) => {
  let anomalyData = [];
  
  if (anomalies && anomalies[anomalyKey]) {
    const anomalyIndices = anomalies[anomalyKey];
    anomalyData = anomalyIndices.map(index => ({
      x: index,
      y: data[index]
  
    }));
  } else {
    console.warn(`No anomalies found for key: ${anomalyKey}`);
  }

  const chartData = {
    labels: data.map((_, index) => index),
    datasets: [
      {
        label: dataKey === 'cpu' ? 'CPU Usage' : 'RAM Usage',
        data: data,
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
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${dataKey.toUpperCase()} Usage with Anomalies`,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const datasetLabel = context.dataset.label || '';
              const value = context.parsed.y;
              const index = context.parsed.x;
              return `${datasetLabel}: ${value} (Index: ${index})`;
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
  
    return <Line data={chartData} options={options} />;
  };


  return (
    <div>
      <button onClick={handleAnalysis} disabled={loading}>
        {loading ? 'Analyzing...' : 'Start Analysis'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && results.cpuData && results.ramData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <h3>CPU Usage with Z-Score Anomalies</h3>
            {renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'zscore_anomalies_cpu', '#8884d8')}
          </div>
          <div>
            <h3>RAM Usage with Z-Score Anomalies</h3>
            {renderChart(results.ramData, 'ram', results.anomalies || {}, 'zscore_anomalies_ram', '#82ca9d')}
          </div>
          <div>
            <h3>CPU Usage with Isolation Forest Anomalies</h3>
            {renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'isolation_forest_anomalies_cpu', '#8884d8')}
          </div>
          <div>
            <h3>RAM Usage with Isolation Forest Anomalies</h3>
            {renderChart(results.ramData, 'ram', results.anomalies || {}, 'isolation_forest_anomalies_ram', '#82ca9d')}
          </div>
          <div>
            <h3>CPU & RAM Usage with Multivariate Isolation Forest Anomalies</h3>
            {renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'multivariate_isolation_forest_anomalies', '#8884d8')}
          </div>
          <div>
            <h3>CPU & RAM Usage with Multivariate Z-Score Anomalies</h3>
            {renderChart(results.ramData, 'ram', results.anomalies || {}, 'multivariate_zscore_anomalies', '#82ca9d')}
          </div>
        </div>
      )}
    </div>
  );
}