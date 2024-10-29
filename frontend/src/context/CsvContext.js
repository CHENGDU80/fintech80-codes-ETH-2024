import React, { createContext, useState } from 'react';

export const CsvContext = createContext();

export const CsvProvider = ({ children }) => {
  const [csvData, setCsvData] = useState([]);
  const [videoData, setVideoData] = useState()

  return (
    <CsvContext.Provider value={{ csvData, setCsvData, videoData, setVideoData }}>
      {children}
    </CsvContext.Provider>
  );
};