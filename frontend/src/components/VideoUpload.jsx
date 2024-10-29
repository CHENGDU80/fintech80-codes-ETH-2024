// src/components/VideoUpload.jsx

import React, { useState, useContext } from 'react';
import { Upload, Button, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { CsvContext } from '../context/CsvContext';

const { Text } = Typography;

const VideoUpload = () => {
  const [fileName, setFileName] = useState(null);
  const { setVideoData } = useContext(CsvContext); // You may want to add a dedicated context for videos if CsvContext is specific to CSV files

  const props = {
    name: 'file',
    accept: 'video/*', // Accept video files only
    beforeUpload: (file) => {
      const isVideo = file.type.startsWith('video/');
      if (!isVideo) {
        message.error(`${file.name} is not a video file`);
      }
      return isVideo || Upload.LIST_IGNORE;
    },
    onChange(info) {
      const { status, originFileObj } = info.file;
      if (status === 'done' || status === 'uploading') {
        setFileName(info.file.name);
        // Use URL.createObjectURL to generate a URL for the uploaded video
        const videoURL = URL.createObjectURL(originFileObj);
        setVideoData(videoURL);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setFileName(null);
      }
    },
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
      <Upload {...props} showUploadList={false} customRequest={({ file, onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}>
        <Button icon={<UploadOutlined />}>Upload Video</Button>
      </Upload>
      {fileName && <Text style={{ marginLeft: 10 }}>Uploaded: {fileName}</Text>}
    </div>
  );
};

export default VideoUpload;
