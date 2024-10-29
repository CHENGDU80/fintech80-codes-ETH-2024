import React, { useState, useContext, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Modal, List, Empty, Select, message, Statistic } from 'antd';
import CsvUpload from './CsvUpload';
import VideoUpload from './VideoUpload'
import { useClaimants } from '../context/ClaimantsContext';
import { useNavigate } from 'react-router-dom';
import { CsvContext } from '../context/CsvContext';
import { ResContext } from '../context/resultContext';
import {RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend} from 'recharts';
import './accidentAnalysis.css';
import { DollarOutlined } from '@ant-design/icons'
import WaveLineChart from './WaveLineChart'

const { Option } = Select;

const mapping = {
  "Roadway": {
    "Parking lot": 1,
    "Rural": 2,
    "Highway": 3,
    "Urban": 4
  },
  "Humidity": {
    "Dry": 1,
    "Wet": 2
  },
  "Speed Limit": {
    "numerical, range 1-40": 1
  },
  "Lighting": {
    "Dark - Not Lighted": 1,
    "Dark - Lighted": 2,
    "Dawn / Dusk": 3,
    "Daylight": 4
  },
  "Acceleration": {
    "hard_braking": 1,
    "normal": 2,
    "risky": 3,
    "crash": 4
  }
}

const AccidentAnalysis = () => {
  const { csvData, setCsvData, videoData, setVideoData } = useContext(CsvContext);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modelMode, setModelMode] = useState(null);
  const {resultData, setResultData} = useContext(ResContext); // Store model response including `pre_results` and `similarity`
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const [currentEventID, setCurrentEventID] = useState()

  const { getClaimantById } = useClaimants();
  const { claimants } = useClaimants();

  // Mapping of IDs to `pre_results` values for background color control
  const [idColorMapping, setIdColorMapping] = useState({});

  useEffect(() => {
    // Load csvData and resultData from sessionStorage on mount
    const storedCsvData = JSON.parse(sessionStorage.getItem("csvData"));
    const storedResultData = JSON.parse(sessionStorage.getItem("resultData"));
    if (storedCsvData) setCsvData(storedCsvData);
    if (storedResultData) setResultData(storedResultData);
    // sessionStorage.setItem("inference", 0);
  }, []);

  useEffect(() => {
    // Store csvData and resultData to sessionStorage when they change
    if (csvData) sessionStorage.setItem("csvData", JSON.stringify(csvData));
    if (resultData) sessionStorage.setItem("resultData", JSON.stringify(resultData));
  }, [csvData, resultData]);


  const handleCsvUpload = (data) => {
    // setCsvData(v => ({file: v.file, data: data}));
  };

  const handleModelChange = (value) => {
    setModelMode(value);
  };

  const handleInference = async () => {
    if (!modelMode || !csvData?.file) {
      message.warning("Please select a model mode and upload a CSV file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('model_choice', modelMode);
      formData.append('input_csv', csvData.file);

      setIsLoading(true)
      const response = await fetch('http://3.0.153.48:5000/api/model', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResultData(data); // Store pre_results and similarity in resultData
      sessionStorage.setItem("inference", 1);

      // Create a mapping of IDs to `pre_results` values
      const mapping = {};
      csvData.data.forEach((item, index) => {
        mapping[item.ID] = data.pre_results[index];
      });
      setIdColorMapping(mapping); // Set the mapping in state
      setIsLoading(false)
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to fetch results from the model.");
    }
  };

  const handleRowClick = (recordId) => {
    const eventList = resultData?.similarity[recordId] || [];
    setCurrentEventID(recordId)
    setSimilarEvents(eventList);
    setIsModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'ID', key: 'ID', width: 100 },
    { title: 'Autonomy Level', dataIndex: 'Autonomy_level', key: 'Autonomy_level', width: 150 },
    { title: 'Roadway Type', dataIndex: 'Roadway Type', key: 'Roadway Type', width: 150 },
    { title: 'Roadway Surface', dataIndex: 'Roadway Surface', key: 'Roadway Surface', width: 150 },
    { title: 'Posted Speed Limit (MPH)', dataIndex: 'Posted Speed Limit (MPH)', key: 'Posted Speed Limit (MPH)', width: 200 },
    { title: 'Lighting', dataIndex: 'Lighting', key: 'Lighting', width: 150 },
    { title: 'Weather', dataIndex: 'Weather', key: 'Weather', width: 150 },
    { title: 'Mileage', dataIndex: 'Mileage', key: 'Mileage', width: 100 },
    { title: 'Usage Year', dataIndex: 'Usage_year', key: 'Usage_year', width: 150 },
    { title: 'Speed', dataIndex: 'Speed', key: 'Speed', width: 100 },
    { title: 'Acceleration', dataIndex: 'Acceleration', key: 'Acceleration', width: 150 },
    { title: 'Disengagement', dataIndex: 'Disengagement', key: 'Disengagement', width: 150 },
    { title: 'Cornering', dataIndex: 'Cornering', key: 'Cornering', width: 150 },
    { title: 'Distance To Next Car', dataIndex: 'Distance_to_next_car', key: 'Distance_to_next_car', width: 150 },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => handleRowClick(record.ID)}>
          View Similar Events
        </Button>
      ),
    },
  ];

  

  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Upload Car IOT Data" bordered={false}>
            <CsvUpload onUpload={handleCsvUpload} />
            <VideoUpload />
            <Select
              placeholder="Select Model Mode"
              onChange={handleModelChange}
              style={{ width: '100%', marginTop: '10px' }}
            >
              <Option value="1">SVM</Option>
              <Option value="2">Random Forest</Option>
              <Option value="3">Neural Network</Option>
            </Select>
            <Button type="primary" onClick={handleInference} style={{ marginTop: '10px' }} loading={isLoading}>
              Inference
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Results" bordered={false} style={{ minHeight: '200px' }}>
            {resultData ? (
              <div>
                <Row>
                  <Col span={24}>
                    <Statistic title="Number of Near Crash Moments" value={resultData.pre_results.filter(value => value === 1).length }/>
                  </Col>
                  {/* <Col span={12}>
                    <Statistic title="Near Crash Rates" value={resultData.pre_results.filter(value => value === 1).length / resultData.pre_results.length *100 } suffix={"%"}/>
                  </Col> */}
                </Row>
                <Row>
                  <WaveLineChart waveData={resultData.pre_results}/>
                </Row>
              </div>
            ) : (
              <p>Results will appear here after inference.</p>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Corresponding Video" bordered={false} style={{ minHeight: '200px' }}>
            {videoData && sessionStorage.getItem("inference") == 1  ? (
              <video controls width="100%">
                <source src={videoData} type="video/mp4" />
              </video>
            ) : (
              <div>Video will appear after the inference.</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={24}>
          {sessionStorage.getItem("inference") == 1 ? (
          <Table
            columns={columns}
            dataSource={csvData.data}
            rowKey="ID"
            pagination={false} // Disable pagination
            scroll={{ x: 'max-content' }} // Enable horizontal scroll
            rowClassName={(record, index) => 
              (resultData.pre_results[index] === 1 ? 'red-row' : '')
            }
          />
          ) : (
            <p>Please upload a CSV file and select a model mode, then click Inference to see the results.</p>
          )}
        </Col>
      </Row>

      <Modal
        title="Similar Crash Events"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {similarEvents.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={similarEvents}
            renderItem={(eventID) => {
              const similarEvent = getClaimantById(eventID);
              const currentEvent = csvData.data.find(obj => obj.ID === currentEventID);

              const data = [
                {
                  "subject": "Humidity",
                  "A": mapping["Humidity"][similarEvent.roadway_surface], // assuming roadway_surface refers to humidity
                  "B": mapping["Humidity"][currentEvent["Roadway Surface"]],
                  "fullMark": 5
                },
                {
                  "subject": "Roadway",
                  "A": mapping["Roadway"][similarEvent.roadway_type],
                  "B": mapping["Roadway"][currentEvent["Roadway Type"]],
                  "fullMark": 5
                },
                {
                  "subject": "Lighting",
                  "A": mapping["Lighting"][similarEvent.lighting], // Adjust according to actual data
                  "B": mapping["Lighting"][currentEvent["Lighting"]],
                  "fullMark": 5
                },
                {
                  "subject": "Acceleration",
                  "A": mapping["Acceleration"][similarEvent.acceleration], // Adjust according to actual data
                  "B": mapping["Acceleration"][currentEvent["Acceleration"]],
                  "fullMark": 5
                },
              ]
              return similarEvent ? (
                <List.Item>
                  <Card
                    title={similarEvent.title}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/report/${similarEvent.id}`)}
                  >
                    <Row>
                      <Col span={6}>
                      {/* <Row>
                        <p>{similarEvent.description || 'No details available.'}</p>
                      </Row> */}
                      <Row>
                        <Statistic title="Insurance Amount" prefix={<DollarOutlined spin />} value={similarEvent.insurance_cost} valueStyle={{color: '#cf1322', fontSize: '2em'}}/>
                      </Row>
                      <Row>
                        <Statistic title="Autonomy Level"  value={similarEvent.autonomy_level} valueStyle={{color: '#abab12', fontSize: '2em'}}/>
                      </Row>
                      </Col>
                      <Col span={18}>
                      <RadarChart outerRadius={90} width={730} height={250} data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar name="Current Event" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Similar Event" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              ) : (
                <Empty />
              );
            }}
          />
        ) : (
          <Empty description="No similar events found." />
        )}
      </Modal>
    </div>
  );
};

export default AccidentAnalysis;
