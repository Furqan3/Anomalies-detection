'use client';

import React, { useState, useEffect } from 'react';

import { get_data } from './api/system/route';
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

function calculateAverage(cpuData, ramData) {
  return cpuData.map((cpu, index) => (cpu + ramData[index]) / 2);
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
          display: true,
          text: title || (avgData ? `Average ${dataKey.toUpperCase()} Usage with Anomalies` : `${dataKey.toUpperCase()} Usage with Anomalies`),
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
      <div style={ {width: '100%'} }>
        <Line data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-2 m-5">
      <button  className="bg-orange-600 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded shadow" onClick={handleAnalysis} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analysis'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && results.cpuData && results.ramData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '20px', width: '100%' }}>
          <div>
            {renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'zscore_anomalies_cpu', '#8884d8')}
          </div>
          <div>
            {renderChart(results.ramData, 'ram', results.anomalies || {}, 'zscore_anomalies_ram', '#82ca9d')}
          </div>
          <div>
            {renderChart(results.cpuData, 'cpu', results.anomalies || {}, 'isolation_forest_anomalies_cpu', '#8884d8')}
          </div>
          <div>
            {renderChart(results.ramData, 'ram', results.anomalies || {}, 'isolation_forest_anomalies_ram', '#82ca9d')}
          </div>
          <div>
            {renderChart(
              calculateAverage(results.cpuData, results.ramData),
              'avg',
              results.anomalies || {},
              'multivariate_isolation_forest_anomalies',
              '#8884d8',
              calculateAverage(results.cpuData, results.ramData),
              'Accumulative Anomalies Isolation Forest'
            )}
          </div>
          <div>
            {renderChart(
              calculateAverage(results.cpuData, results.ramData),
              'avg',
              results.anomalies || {},
              'multivariate_zscore_anomalies',
              '#82ca9d',
              calculateAverage(results.cpuData, results.ramData),
              'Accumulative Anomalies Z-Score'
            )}
          </div>
        </div>
      )}
    </div>
  );
}
