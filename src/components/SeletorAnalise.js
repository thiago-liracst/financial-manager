import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";

const SeletorAnalise = ({ tipoAnalise, setTipoAnalise }) => {
  const handleChange = (event, novoTipo) => {
    if (novoTipo !== null) {
      setTipoAnalise(novoTipo);
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Typography variant="body1" sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}>
        Tipo de análise:
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={tipoAnalise}
        exclusive
        onChange={handleChange}
        aria-label="Tipo de análise"
        size="small"
        fullWidth
      >
        <ToggleButton value="tendencias">Tendências</ToggleButton>
        <ToggleButton value="previsao">Previsão</ToggleButton>
        <ToggleButton value="sazonalidade">Sazonalidade</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default SeletorAnalise;
