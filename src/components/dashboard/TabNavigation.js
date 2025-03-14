import React from "react";
import { Paper, Tabs, Tab } from "@mui/material";
import {
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon, // Ícone alterado para análises
} from "@mui/icons-material";

const TabNavigation = ({ activeTab, onChange }) => {
  return (
    <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onChange(newValue)}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab icon={<ReceiptIcon />} label="Transações" />
        <Tab icon={<BarChartIcon />} label="Planejamento" />
        <Tab icon={<AnalyticsIcon />} label="Análises" />{" "}
        {/* Nome da aba alterado de "Tendências" para "Análises" */}
      </Tabs>
    </Paper>
  );
};

export default TabNavigation;
