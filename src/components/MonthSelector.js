// src/components/MonthSelector.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const MonthSelector = ({ onSelectMonth, currentMonth, isMonthClosed }) => {
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    // Gerar os últimos 12 meses
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMMM yyyy", { locale: ptBR });

      months.push({
        key: monthKey,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      });
    }

    setAvailableMonths(months);
  }, []);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Mês</InputLabel>
          <Select
            value={currentMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            label="Mês"
          >
            {availableMonths.map((month) => (
              <MenuItem key={month.key} value={month.key}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isMonthClosed && (
          <Chip
            label="Mês Fechado"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Stack>
    </Box>
  );
};

export default MonthSelector;
