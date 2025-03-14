// components/SeletorPeriodo.js - Modifique o componente inteiro

import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const SeletorPeriodo = ({
  periodo,
  setPeriodo,
  categoriaSelecionada,
  setCategoriaSelecionada,
  categorias = [], // Valor padrão para categorias
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handlePeriodoChange = (event, novoPeriodo) => {
    if (novoPeriodo !== null) {
      setPeriodo(novoPeriodo);
    }
  };

  const handleCategoriaChange = (event) => {
    setCategoriaSelecionada(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        mb: 2,
        gap: 2,
      }}
    >
      <ToggleButtonGroup
        value={periodo}
        exclusive
        onChange={handlePeriodoChange}
        aria-label="período de análise"
        size="small"
        sx={{
          flexGrow: 0,
          "& .MuiToggleButton-root": {
            px: { xs: 1, sm: 2 },
          },
        }}
      >
        <ToggleButton value={3} aria-label="3 meses">
          3 Meses
        </ToggleButton>
        <ToggleButton value={6} aria-label="6 meses">
          6 Meses
        </ToggleButton>
        <ToggleButton value={12} aria-label="12 meses">
          12 Meses
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControl sx={{ minWidth: 200, flexGrow: 0 }} size="small">
        <InputLabel id="categoria-select-label">Categoria</InputLabel>
        <Select
          labelId="categoria-select-label"
          id="categoria-select"
          value={categoriaSelecionada}
          label="Categoria"
          onChange={handleCategoriaChange}
        >
          <MenuItem value={null}>Todas</MenuItem>
          {categorias.map((categoria) => (
            <MenuItem key={categoria} value={categoria}>
              {categoria}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SeletorPeriodo;
