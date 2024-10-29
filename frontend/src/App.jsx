// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Dashboard from './pages/Dashboard';
import ReportList from './pages/ReportList';
import Report from './pages/Report';
import AccidentAnalysis from './components/AccidentAnalysis';

const { Header, Content, Footer } = Layout;

const App = () => {
  return (
    <Router>
      <Layout>
        <Header>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="1"><Link to="/">Dashboard</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/accident-analysis">Data Analysis</Link></Menu.Item>
            <Menu.Item key="3"><Link to="/report-list">Crash Events</Link></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report-list" element={<ReportList />} />
            <Route path="/accident-analysis" element={<AccidentAnalysis />} />
            <Route path="/report/:id" element={<Report />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>ZurichFive©2024</Footer>
      </Layout>
    </Router>
  );
};

export default App;
