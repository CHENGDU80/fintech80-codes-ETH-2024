import React, { useState, useEffect } from 'react';
import { Card, List, Select, Slider, Button, Tag, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useClaimants } from '../context/ClaimantsContext'; // Use the hook from context

const { Option } = Select;

const ReportList = () => {
  const navigate = useNavigate();
  const { claimants } = useClaimants(); // Access claimants from context

  // State for Filters
  const [filteredData, setFilteredData] = useState([]);
  const [claimStatus, setClaimStatus] = useState(null);
  const [autoMake, setAutoMake] = useState(null);
  const [claimAmountRange, setClaimAmountRange] = useState([0, 100000]);
  const [policyId, setPolicyId] = useState('');
  const [incidentType, setIncidentType] = useState(null);

  useEffect(() => {
    setFilteredData(claimants); // Set initial filtered data from context
  }, [claimants]);

  // Get unique values for claimStatus, auto_make, and collision_type
  const uniqueClaimStatuses = [...new Set(claimants.map(c => c.claimStatus))];
  const uniqueAutoMakes = [...new Set(claimants.map(c => c.auto_make))];
  const uniqueIncidentTypes = [...new Set(claimants.map(c => c.collision_type))];
  const maxClaimAmount = Math.max(...claimants.map(c => c.insurance_cost || 0));

  // Filter function
  const applyFilters = () => {
    const filtered = claimants.filter((claimant) => {
      const matchesStatus = claimStatus ? claimant.claimStatus === claimStatus : true;
      const matchesAutoMake = autoMake ? claimant.auto_make === autoMake : true;
      const matchesClaimAmount = claimant.insurance_cost >= claimAmountRange[0] &&
                                 claimant.insurance_cost <= claimAmountRange[1];
      const matchesPolicyId = policyId ? claimant.policyNumber.toString().includes(policyId) : true;
      const matchesIncidentType = incidentType ? claimant.collision_type === incidentType : true;
      return matchesStatus && matchesAutoMake && matchesClaimAmount && matchesPolicyId && matchesIncidentType;
    });
    setFilteredData(filtered);
  };

  const deleteFilters = () => {
    setFilteredData(claimants);
    setClaimStatus(null);
    setAutoMake(null);
    setClaimAmountRange([0, maxClaimAmount]);
    setPolicyId('');
    setIncidentType(null);
  };

  return (
    <Card title="Insurance Claimants" style={{ marginTop: 20 }}>
      {/* Filter Section */}
      <div style={{ marginBottom: 20, display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Claim Status Filter */}
        <Select
          placeholder="Filter by Claim Status"
          style={{ width: 180 }}
          value={claimStatus}
          onChange={(value) => setClaimStatus(value)}
          allowClear
        >
          {uniqueClaimStatuses.map(status => (
            <Option key={status} value={status}>{status}</Option>
          ))}
        </Select>

        {/* Auto Make Filter */}
        <Select
          placeholder="Filter by Auto Make"
          style={{ width: 180 }}
          value={autoMake}
          onChange={(value) => setAutoMake(value)}
          allowClear
        >
          {uniqueAutoMakes.map(make => (
            <Option key={make} value={make}>{make}</Option>
          ))}
        </Select>

        {/* Claim Amount Filter */}
        <Slider
          range
          value={claimAmountRange}
          min={0}
          max={maxClaimAmount}
          onChange={setClaimAmountRange}
          style={{ width: 300 }}
        />

        {/* Policy ID Filter */}
        <Input
          placeholder="Filter by Policy ID"
          value={policyId}
          onChange={(e) => setPolicyId(e.target.value)}
          style={{ width: 180 }}
        />

        {/* Incident Type Filter */}
        <Select
          placeholder="Filter by Incident Type"
          style={{ width: 180 }}
          value={incidentType}
          onChange={(value) => setIncidentType(value)}
          allowClear
        >
          {uniqueIncidentTypes.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>

        <Button onClick={applyFilters}>Apply</Button>
        <Button onClick={deleteFilters}>Reset</Button>
      </div>

      {/* Claimants List */}
      <List
        dataSource={filteredData}
        renderItem={item => (
          <List.Item
            actions={[<a onClick={() => navigate(`/report/${item.id}`)}>View Report</a>]}
          >
            <List.Item.Meta
              title={item.name}
              description={`Policy Number: ${item.policyNumber}, Status: ${item.claimStatus}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ReportList;
