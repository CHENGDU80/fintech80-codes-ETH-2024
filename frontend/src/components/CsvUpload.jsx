// src/components/CsvUpload.jsx

import React, { useContext, useState } from 'react';
import { Upload, Button, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { CsvContext } from '../context/CsvContext';

const { Text } = Typography;

const CsvUpload = () => {
  const [fileName, setFileName] = useState(null);
  const { setCsvData, csvData } = useContext(CsvContext);

  const props = {
    name: 'file',
    accept: '.csv',
    beforeUpload: (file) => {
      const isCsv = file.type === 'text/csv';
      if (!isCsv) {
        message.error(`${file.name} is not a CSV file`);
      }
      return isCsv || Upload.LIST_IGNORE;
    },
    onChange(info) {
      const { status, originFileObj } = info.file;
      if (status === 'done' || status === 'uploading') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvDataParse = Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
          });
          if (csvDataParse.errors.length === 0) {
            message.success(`${info.file.name} file uploaded successfully`);
            setFileName(info.file.name);
            setCsvData({ file: originFileObj, data: csvDataParse.data });
          } else {
            message.error('Error parsing CSV file');
          }
        };
        reader.readAsText(originFileObj);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setFileName(null);
      }
    },
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Upload {...props} showUploadList={false} customRequest={({ file, onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}>
        <Button icon={<UploadOutlined />}>Upload CSV File</Button>
      </Upload>
      {fileName && <Text style={{ marginLeft: 10 }}>Uploaded: {fileName}</Text>}
    </div>
  );
};

export default CsvUpload;
