// src/components/dashboard/TabNavigation.js
import React from "react";
import { Box, Tabs, Tab } from "@mui/material";

const TabNavigation = ({ activeTab, onChange }) => {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs value={activeTab} onChange={handleChange} variant="fullWidth">
        <Tab label="Transações" />
        <Tab label="Planejamento" />
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
