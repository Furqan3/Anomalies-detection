
# System Anomaly Detection

This project implements a system anomaly detection system using Python, MongoDB, FastAPI, and React.

## Project Structure

- **db.py**: Defines a MongoDB database class (`mydatabase`) for storing system data.
- **detection.py**: Contains functions for anomaly detection using Z-score and Isolation Forest algorithms.
- **retrieve_system_data.py**: Retrieves system data including RAM and CPU usage, and process information using psutil.
- **app.py**: FastAPI server setup to expose API endpoints for retrieving system data and anomalies.
- **SystemAnalysis.jsx**: React component for visualizing system data and anomalies using Chart.js.
- **api/system/route.js**: Axios configuration for making API requests to the FastAPI server.

## Setup

1. **Install Dependencies**: Ensure Python dependencies are installed using `pip install -r requirements.txt`.
2. **Run MongoDB**: Start MongoDB server locally.
3. **Start FastAPI Server**: Run `uvicorn app:app --reload` to start the FastAPI server.
4. **Start React App**: Launch the React frontend with `npm start` or `yarn start`.

## Usage

1. Access the frontend at `http://localhost:3000`.
2. Click on "Start Analysis" to fetch and analyze system data.
3. Charts display CPU and RAM usage with identified anomalies highlighted.

## Technologies Used

- **Backend**: Python, FastAPI, MongoDB
- **Frontend**: React, Chart.js
- **Data Analysis**: NumPy, SciPy, scikit-learn

