import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity } from "lucide-react";

interface HeartRateData {
  timestamp: string;
  bpm: number;
  time: number; // Unix timestamp for sorting
}

export const LiveHeartRateGraph: React.FC = () => {
  const [data, setData] = useState<HeartRateData[]>([]);
  const [currentBpm, setCurrentBpm] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const maxDataPoints = 30; // Keep last 30 readings

  // Simulate receiving live heart rate data
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate heart rate data (replace with your actual data source)
      const now = Date.now();
      const bpm = Math.floor(Math.random() * (100 - 60) + 60); // Random BPM between 60-100

      const newDataPoint: HeartRateData = {
        timestamp: new Date(now).toLocaleTimeString(),
        bpm,
        time: now,
      };

      setCurrentBpm(bpm);

      setData((prevData) => {
        const updated = [...prevData, newDataPoint];
        // Keep only the last N data points
        return updated.slice(-maxDataPoints);
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (isMonitoring) {
      setData([]);
      setCurrentBpm(0);
    }
  };

  // const getHeartRateStatus = (bpm: number) => {
  //   if (bpm === 0) return { status: "Not monitoring", color: "text-gray-500" };
  //   if (bpm < 60) return { status: "Low", color: "text-blue-500" };
  //   if (bpm <= 100) return { status: "Normal", color: "text-green-500" };
  //   return { status: "High", color: "text-red-500" };
  // };

  // const hrStatus = getHeartRateStatus(currentBpm);

  useMemo(() => {
    toggleMonitoring();
  },[]);

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Heart Rate Over Time
        </h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ value: "BPM", angle: -90, position: "insideLeft" }}
                domain={[40, 120]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
                name="Heart Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            {isMonitoring
              ? "Waiting for data..."
              : 'Click "Start Monitoring" to begin tracking heart rate'}
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> This graph is synced with the time slide of the video.
        </p>
      </div>
    </div>
  );
};
