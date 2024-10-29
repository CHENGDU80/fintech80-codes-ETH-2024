import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Statistic } from 'antd';
import { useParams } from 'react-router-dom';
import { useClaimants } from '../context/ClaimantsContext';
import { useSpring, animated } from 'react-spring';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import CarModel  from '../components/CarModel'

const { Text, Title } = Typography;

const Report = () => {
  const { id } = useParams();
  const { getClaimantById } = useClaimants();
  const [claimant, setClaimant] = useState();

  useEffect(() => {
    const data = getClaimantById(id);
    setClaimant(data);
  }, [id, getClaimantById]);

  const speedProps = useSpring({
    from: { value: 0 },
    to: { value: claimant ? claimant.speed : 0 },
    config: { duration: 1500 }
  });

  if (!claimant) {
    return <Card style={{ marginTop: 20 }}>Claimant not found</Card>;
  }

  return (
    <Card title={`Insurance Claimant's Information - ${claimant.name}`} style={{ marginTop: 20 }}>
      <Card type="inner" title="Claimant Details" style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Text><strong>Name:</strong> {claimant.name}</Text><br />
            <Text><strong>Age:</strong> {claimant.age}</Text><br />
            <Text><strong>Policy Number:</strong> {claimant.policyNumber}</Text><br />
            <Text><strong>Claim Status:</strong> {
              claimant.claimStatus === 'Approved' ? 
              <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag> :
              claimant.claimStatus === 'Pending' ? 
              <Tag icon={<ClockCircleOutlined />} color="processing">Pending</Tag> :
              claimant.claimStatus === 'Denied' ? 
              <Tag icon={<CloseCircleOutlined />} color="error">Denied</Tag> :
              <Tag icon={<SyncOutlined spin />} color="warning">In Review</Tag>
            }</Text><br />
            <Text><strong>Weather:</strong> {claimant.weather}</Text><br />
            <Text><strong>Lighting:</strong> {claimant.lighting}</Text><br />
            {/* <Text><strong>Description:</strong> {claimant.description}</Text><br /> */}
          </Col>
          <Col span={4}>
            <Statistic title="Vehicle Make" value={claimant.auto_make} />
            <Statistic title="Vehicle Year" value={claimant.usage_year} />
            <Statistic title="Mileage" value={claimant.mileage} />
          </Col>
          <Col span={4}>
            <Statistic title="Incident Type" value={claimant.acceleration} />
            <Statistic title="Incident Severity" value={claimant.incident_severity} />
            <Statistic title="Disengagement?" value={claimant.disengagement?'Yes': 'No'} />
          </Col>
          <Col span={4}>
            <Statistic title="Collision Type" value={claimant.collision_type} />
            <Statistic title="Incident Speed" value={`${claimant.speed} mph`} />
            <Statistic title="Autonomy Level"  value={claimant.autonomy_level} valueStyle={{color: '#abab12', fontSize: '2em'}}/>
          </Col>
          <Col span={4}>
            <Statistic title="Insurance Amount" prefix={<DollarOutlined spin />} value={claimant.insurance_cost} valueStyle={{color: '#cf1322', fontSize: '2.5em'}}/>
          </Col>
        </Row>
      </Card>

      {/* Interactive Car Model */}
      <Card title="Vehicle Collision Overview" style={{ marginTop: 20 }}>
        <CarModel collisionType={claimant.collision_type} />
      </Card>
    </Card>
  );
};

export default Report;
