import React, { createContext, useState } from 'react';

export const ResContext = createContext();

export const ResProvider = ({ children }) => {
  const [resultData, setResultData] = useState();

  return (
    <ResContext.Provider value={{ resultData, setResultData }}>
      {children}
    </ResContext.Provider>
  );
};