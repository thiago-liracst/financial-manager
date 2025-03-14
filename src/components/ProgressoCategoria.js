// componentes/ProgressoCategoria.js
import React from "react";
import { Box, Typography, LinearProgress, useTheme } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

const ProgressoCategoria = ({ categorias, titulo, tipo }) => {
  const theme = useTheme();

  const getStatusIcon = (status, tipo) => {
    switch (status) {
      case "ok":
        return <CheckCircleIcon fontSize="small" color="success" />;
      case "alerta":
        return <WarningIcon fontSize="small" color="warning" />;
      case "ultrapassado":
        return (
          <ErrorIcon
            fontSize="small"
            color={tipo === "entrada" ? "warning" : "error"}
          />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status, tipo) => {
    switch (status) {
      case "ok":
        return theme.palette.success.main;
      case "alerta":
        return theme.palette.warning.main;
      case "ultrapassado":
        return tipo === "entrada"
          ? theme.palette.warning.main
          : theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          mt: 2,
        }}
      >
        {tipo === "entrada" ? (
          <ArrowUpwardIcon
            fontSize="small"
            sx={{ mr: 1, color: theme.palette.success.main }}
          />
        ) : (
          <ArrowDownwardIcon
            fontSize="small"
            sx={{ mr: 1, color: theme.palette.error.main }}
          />
        )}
        <Typography
          variant="subtitle2"
          color={tipo === "entrada" ? "success" : "error"}
        >
          {titulo}
        </Typography>
      </Box>

      {categorias.map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 0.5,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: { xs: 0.5, sm: 0 },
              }}
            >
              {getStatusIcon(item.status, item.tipo)}
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {item.nome}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight="medium"
              sx={{
                fontSize: { xs: 11, sm: 12 },
              }}
            >
              R$ {item.valorGasto.toFixed(2)} / R${" "}
              {item.valorPlanejado.toFixed(2)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(item.percentualGasto, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                backgroundColor: getStatusColor(item.status, item.tipo),
              },
            }}
          />
        </Box>
      ))}
    </>
  );
};

export default ProgressoCategoria;
