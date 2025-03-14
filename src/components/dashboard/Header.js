// src/components/dashboard/Header.js
import React from "react";
import { Box, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MonthSelector from "../MonthSelector";

const Header = ({ onLogout, onSelectMonth, currentMonth, isMonthClosed }) => {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton onClick={onLogout} color="primary">
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* Seletor de mês */}
      <MonthSelector
        onSelectMonth={onSelectMonth}
        currentMonth={currentMonth}
        isMonthClosed={isMonthClosed}
      />
    </>
  );
};

export default Header;
