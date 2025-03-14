// src/components/MonthSelector.js
import React, { useState } from "react";
import {
  Box,
  Stack,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { format, parse, addYears, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";

const MonthSelector = ({ onSelectMonth, currentMonth, isMonthClosed }) => {
  // Inicializar com a data atual ou a data do mês selecionado
  const initialDate = currentMonth
    ? parse(currentMonth, "yyyy-MM", new Date())
    : new Date();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState(format(initialDate, "yyyy"));
  const [selectedMonth, setSelectedMonth] = useState(format(initialDate, "MM"));

  const handleOpenDialog = () => {
    // Reiniciar os valores ao abrir o diálogo
    const date = currentMonth
      ? parse(currentMonth, "yyyy-MM", new Date())
      : new Date();

    setSelectedYear(format(date, "yyyy"));
    setSelectedMonth(format(date, "MM"));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirm = () => {
    const newDate = `${selectedYear}-${selectedMonth}`;
    onSelectMonth(newDate);
    handleCloseDialog();
  };

  // Gerar opções de anos (10 anos atrás até 10 anos à frente)
  const generateYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = -10; i <= 10; i++) {
      const year = currentYear + i;
      years.push(year.toString());
    }

    return years;
  };

  // Gerar opções de meses
  const generateMonthOptions = () => {
    const months = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(2000, i, 1);
      const monthKey = format(monthDate, "MM");
      const monthLabel = format(monthDate, "MMMM", { locale: ptBR });

      months.push({
        key: monthKey,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      });
    }

    return months;
  };

  // Formatar a data atual para exibição
  const formattedCurrentMonth = currentMonth
    ? format(parse(currentMonth, "yyyy-MM", new Date()), "MMMM yyyy", {
        locale: ptBR,
      })
    : "";

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Mês Selecionado"
          value={
            formattedCurrentMonth.charAt(0).toUpperCase() +
            formattedCurrentMonth.slice(1)
          }
          size="small"
          InputProps={{ readOnly: true }}
          onClick={handleOpenDialog}
          sx={{ minWidth: 200, cursor: "pointer" }}
        />
        <Button variant="outlined" size="small" onClick={handleOpenDialog}>
          Escolher Mês
        </Button>

        {isMonthClosed && (
          <Chip
            label="Mês Fechado"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Stack>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Selecione um Mês</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1, width: "360px" }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="year-select-label">Ano</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={selectedYear}
                  label="Ano"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {generateYearOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="month-select-label">Mês</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedMonth}
                  label="Mês"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {generateMonthOptions().map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirm} variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonthSelector;
