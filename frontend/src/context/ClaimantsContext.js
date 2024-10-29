import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const ClaimantsContext = createContext();

// Fetch CSV data function
async function fetchClaimants() {
  const response = await fetch('./moments.csv');
  const data = await response.text();
  const rows = data.split('\n').slice(1); // Remove header

  return rows.map(row => {
    const values = row.split(',');
    return {
      id: values[0],
      name: values[1],
      age: parseInt(values[2]),
      policyNumber: values[3],
      months_as_customer: parseInt(values[4]),
      claimStatus: values[5],
      description: values[6],
      auto_make: values[7],
      autonomy_level: values[8],
      roadway_type: values[9],
      roadway_surface: values[10],
      posted_speed_limit: parseInt(values[11]),
      lighting: values[12],
      weather: values[13],
      mileage: parseInt(values[14]),
      usage_year: parseInt(values[15]),
      speed: parseInt(values[16]),
      acceleration: values[17],
      disengagement: parseInt(values[18]),
      collision_type: values[19],
      incident_severity: values[20],
      insurance_cost: parseInt(values[21]),
      cornering: values[22],
      distance_to_next_car: values[23],
    };
  });
}

// Provider component
export const ClaimantsProvider = ({ children }) => {
  const [claimants, setClaimants] = useState([]);

  useEffect(() => {
    const loadClaimants = async () => {
      const data = await fetchClaimants();
      setClaimants(data);
    };
    loadClaimants();
  }, []);

  // Function to get a claimant by ID
  const getClaimantById = (id) => {
    return claimants.find(claimant => claimant.id === id);
  };

  return (
    <ClaimantsContext.Provider value={{ claimants, getClaimantById }}>
      {children}
    </ClaimantsContext.Provider>
  );
};

// Custom hook for using the claimants context
export const useClaimants = () => {
  return useContext(ClaimantsContext);
};
