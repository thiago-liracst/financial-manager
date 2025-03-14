// componentes/GraficoPizza.js
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const GraficoPizza = ({ pizzaData }) => {
  const theme = useTheme();

  // Cores para os gráficos
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
  ];

  // Renderizar os indicadores de legenda personalizada para o gráfico de pizza
  const renderCustomLegend = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          fontSize: 12,
        }}
      >
        {/* Não use window.innerWidth, use o sistema de breakpoints do MUI */}
        {pizzaData.map((entry, index) => (
          <Box
            key={`legend-item-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              flexWrap: "wrap", // Permitir quebra em telas pequenas
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: 1,
                mr: 1,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ mr: 1, flexShrink: 0 }}>
              {entry.name}:
            </Typography>
            <Typography
              variant="caption"
              fontWeight="medium"
              sx={{ wordBreak: "break-word" }}
            >
              R$ {entry.value.toFixed(2)} (
              {(
                (entry.value /
                  pizzaData.reduce((sum, item) => sum + item.value, 0)) *
                100
              ).toFixed(1)}
              %)
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        height: "auto",
        minHeight: 200,
      }}
    >
      {/* Manter a altura fixa da ResponsiveContainer */}
      <Box sx={{ width: { xs: "100%", sm: "60%" }, height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pizzaData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70} // Reduzir em telas menores
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={false}
            >
              {pizzaData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Legenda responsiva */}
      <Box
        sx={{
          width: { xs: "100%", sm: "40%" },
          mt: { xs: 2, sm: 0 },
          pl: { xs: 0, sm: 2 },
        }}
      >
        {renderCustomLegend()}
      </Box>
    </Box>
  );
};

export default GraficoPizza;
