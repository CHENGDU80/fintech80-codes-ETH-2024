import React from 'react';
import { Card, Row, Col } from 'antd';
import {
  ComposedChart, Line, Bar, BarChart, FunnelChart, Funnel, PieChart, Pie, Cell, ScatterChart, Scatter, Tooltip, CartesianGrid, XAxis, YAxis, Legend, LabelList, ResponsiveContainer
} from 'recharts';
import { useClaimants } from '../context/ClaimantsContext';

const Dashboard = () => {
  const { claimants } = useClaimants();

 // Remove NaN/undefined attributes and ensure all numeric values
  const validClaimants = claimants.filter(c => 
    c.age != null &&
    c.insurance_cost != null &&
    c.mileage != null &&
    c.speed != null &&
    c.incident_severity != null &&
    !isNaN(Number(c.insurance_cost)) // Ensure insurance_cost is numeric
  );

  // Group by age range for average insurance cost
  const ageGroups = validClaimants.reduce((acc, c) => {
    const ageRange = `${Math.floor(c.age / 10) * 10}-${Math.floor(c.age / 10) * 10 + 9}`;
    if (!acc[ageRange]) acc[ageRange] = { totalCost: 0, count: 0 };
    acc[ageRange].totalCost += Number(c.insurance_cost); // Ensure addition with numeric values
    acc[ageRange].count += 1;
    return acc;
  }, {});
  const ageGroupData = Object.entries(ageGroups)
    .map(([range, data]) => ({
      ageRange: range,
      avgInsuranceCost: data.totalCost / data.count,
    }))
    .sort((a, b) => parseInt(a.ageRange.split('-')[0]) - parseInt(b.ageRange.split('-')[0])); // Sort by age range start


  // Group by speed range for average insurance cost
  const speedRanges = validClaimants.reduce((acc, c) => {
    const speedRange = `${Math.floor(c.speed / 10) * 10}-${Math.floor(c.speed / 10) * 10 + 9}`;
    if (!acc[speedRange]) acc[speedRange] = { totalCost: 0, count: 0 };
    acc[speedRange].totalCost += c.insurance_cost;
    acc[speedRange].count += 1;
    return acc;
  }, {});
  const speedEffectData = Object.entries(speedRanges).map(([range, data]) => ({
    speedRange: range,
    avgInsuranceCost: data.totalCost / data.count,
  }));

  // Merging age and speed data for ComposedChart
  const composedData = ageGroupData.map((item, index) => ({
    ageRange: item.ageRange,
    avgInsuranceCostByAge: item.avgInsuranceCost,
    avgInsuranceCostBySpeed: speedEffectData[index] ? speedEffectData[index].avgInsuranceCost : 0,
  }));

  // Categorical data for Row 2
  const funnelData = [
    { name: 'Approved', value: validClaimants.filter(c => c.claimStatus === 'Approved').length },
    { name: 'Pending', value: validClaimants.filter(c => c.claimStatus === 'Pending').length },
    { name: 'Rejected', value: validClaimants.filter(c => c.claimStatus === 'Rejected').length }
  ];
  const pieData = Object.entries(validClaimants.reduce((acc, c) => {
    acc[c.weather] = (acc[c.weather] || 0) + 1;
    return acc;
  }, {})).map(([weather, count]) => ({ name: weather, value: count }));
  const collisionTypeData = validClaimants.reduce((acc, c) => {
    acc[c.collision_type] = (acc[c.collision_type] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(collisionTypeData).map(([type, count]) => ({ name: type, value: count }));

  // Scatter plot data for Row 3
  const scatterData1 = validClaimants.map(c => ({ x: c.age, y: c.insurance_cost }));
  const scatterData2 = validClaimants.map(c => ({ x: c.mileage, y: c.insurance_cost }));
  const scatterData3 = validClaimants.map(c => ({ x: c.speed, y: c.insurance_cost }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card title="Insurance Analysis Dashboard" style={{ marginTop: 20 }}>
      <Row gutter={[16, 16]}>
        {/* Row 1: Combined ComposedChart */}
        <Col span={24}>
          <Card title="Average Insurance Cost by Age Group and Speed Effect" bordered={false}>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={composedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageRange" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgInsuranceCostByAge" fill="#8884d8" name="Avg Insurance Cost by Age" />
                <Line type="monotone" dataKey="avgInsuranceCostBySpeed" stroke="#ff7300" name="Avg Insurance Cost by Speed" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Row 2: Three Categorical Charts */}
        <Col span={8}>
          <Card title="Claim Status Distribution" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive fill="#8884d8">
                  <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Weather Conditions Distribution" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Collision Type Distribution" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Row 3: Three Scatter Plots */}
        <Col span={8}>
          <Card title="Age vs. Insurance Cost" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Age" />
                <YAxis type="number" dataKey="y" name="Insurance Cost" />
                <Tooltip />
                <Scatter data={scatterData1} fill="#82ca9d" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Mileage vs. Insurance Cost" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Mileage" />
                <YAxis type="number" dataKey="y" name="Insurance Cost" />
                <Tooltip />
                <Scatter data={scatterData2} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Speed vs. Insurance Cost" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Speed" />
                <YAxis type="number" dataKey="y" name="Insurance Cost" />
                <Tooltip />
                <Scatter data={scatterData3} fill="#ff7300" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
    </Card>
  );
};

export default Dashboard;
