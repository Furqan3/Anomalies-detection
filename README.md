Sure, here is the GitHub README in Markdown format:

```markdown
# System Anomaly Detection Project

## Introduction

This project involves detecting anomalies in system performance data collected from a personal computer at 3-second intervals. The aim is to identify unusual patterns that could indicate potential issues in CPU and RAM usage.

## Data Collection

Data was extracted at 3-second intervals, including:
- CPU percentage usage
- RAM percentage usage
- All processes data

## Anomaly Detection Techniques

The following techniques were used to detect anomalies:
- **Z-score**: Identifies outliers by measuring the number of standard deviations a data point is from the mean.
- **Isolation Forest**: Isolates observations by randomly selecting a feature and then a split value between the maximum and minimum values of the selected feature.
- **Local Outlier Factor (LOF)**: Measures the local density deviation of a given data point with respect to its neighbors.

These techniques were applied to both individual CPU and RAM usage data as well as their cumulative usage.

## Data Storage

Processed data, including identified anomalies, was stored in MongoDB for efficient retrieval and management.

## API Development

Two APIs were developed for data retrieval:
- **Flask API**: Initially used for creating endpoints for data retrieval from MongoDB.
- **FastAPI**: Later used for improved performance and data retrieval from MongoDB.

## Frontend Development

The frontend was developed using Next.js, providing a seamless user experience with server-side rendering. The UI displays charts and visualizations of CPU and RAM usage, with anomalies clearly marked.

## System Diagram

![System Diagram](link_to_diagram)

## Usage

1. **Clone the repository**:
   ```sh
   git clone https://github.com/yourusername/system-anomaly-detection.git
   cd system-anomaly-detection
   ```

2. **Install dependencies**:
   ```sh
   pip install -r requirements.txt
   npm install
   ```

3. **Run the APIs**:
   - For Flask API:
     ```sh
     python app_flask.py
     ```
   - For FastAPI:
     ```sh
     uvicorn app_fastapi:app --reload
     ```

4. **Run the Next.js frontend**:
   ```sh
   npm run dev
   ```

## Conclusion

This project provided valuable experience in working with APIs, data visualization, and integrating data-driven web applications using modern web technologies like Next.js. The anomaly detection techniques and efficient data retrieval methods implemented here can be applied to various system monitoring and performance optimization tasks.

## License

This project is licensed under the MIT License.

---

Feel free to contribute, raise issues, and suggest improvements. For more details, visit the [GitHub repository](https://github.com/yourusername/system-anomaly-detection).
```

Replace `yourusername` with your actual GitHub username and `link_to_diagram` with the actual link to your system diagram image if available.
