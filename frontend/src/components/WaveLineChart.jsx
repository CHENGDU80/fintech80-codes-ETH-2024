import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WaveLineChart = ({ waveData }) => {
  // Construct the data dynamically
  const data = useMemo(
    () => waveData.map((y, index) => ({ x: index, y })),
    [waveData]
  );

  return (
    <ResponsiveContainer width="90%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WaveLineChart;
