import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface HeartRateData {
  timestamp: string;
  bpm: number;
  time: number; // Unix timestamp for sorting
}

export function LiveHeartRateGraph({ data }: { data: HeartRateData[] }) {
  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Heart Rate Over Time
        </h2>
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
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> This graph is synced with the time slide of the
          video.
        </p>
      </div>
    </div>
  );
}
