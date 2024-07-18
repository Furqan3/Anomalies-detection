function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  
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
  
  function findHighest(data, check) {
    try {
      let mydata = data[1];
      for (let i in data) {
        if (mydata[check] <= data[i][check]) {
          mydata = data[i];
        }
      }
      return mydata;
    } catch (error) {
      console.error('Error in finding:', error);
    }
  }
  
  function getAnomalyData(api, data, mystr) {
    try {
      if (mystr == 'ram') {
        mystr = 'memory_percent';
      } else {
        mystr = 'cpu_percent';
      }
  
      const mydata = {};
  
      data.forEach(index => {
        const timestamp = api[index]["timestamp"];
        const highestProcess = findHighest(api[index]["process_data"], mystr);
        mydata[timestamp] = highestProcess;
      });
  
      return mydata;
    } catch (error) {
      console.error('Error parsing API response of getting Anomalies:', error);
      return null;
    }
  }
  
  function getmultianomalydata(api,data){
    try {
      const mydata ={}
      data.forEach(index => {
        const timestamp = api[index]["timestamp"];
        let temp=api[index]["process_data"];
        let highestProcess = temp[1];
        for (let i in temp) {
          if (((highestProcess['cpu_percent']+highestProcess['memory_percent'])/2) <= ((temp[i]['memory_percent']+temp[i]['cpu_percent'])/2)) { 
            highestProcess = temp[i];
          }         
        }
        mydata[timestamp] = highestProcess;
      });
      return mydata;
    } catch (error) {
      console.error('Error in finding Accumulative Anomalies :', error);
    }
  }
  export {
    formatTimestamp,
    getCpuPercent,
    getRamPercent,
    getAnomalies,
    calculateAverage,
    findHighest,
    getAnomalyData,
    getmultianomalydata
  };
  