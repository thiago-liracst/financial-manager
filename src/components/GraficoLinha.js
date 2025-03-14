import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

const GraficoLinha = ({ data, categorias, categoriaSelecionada }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  // Formatador para o tooltip
  const formatTooltip = (value) => {
    return `R$ ${value.toFixed(2)}`;
  };

  // Categorias a serem exibidas
  const categoriasParaExibir = categoriaSelecionada
    ? [categoriaSelecionada]
    : categorias;

  return (
    <Box sx={{ width: "100%", height: isMobile ? 300 : 400, mt: 2 }}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              height={60}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => `R$ ${value}`}
              width={isMobile ? 50 : 80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            {categoriasParaExibir.map((categoria, index) => (
              <Line
                key={categoria}
                type="monotone"
                dataKey={categoria}
                name={categoria}
                stroke={COLORS[index % COLORS.length]}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            border: "1px dashed grey",
            borderRadius: "8px",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Não há dados suficientes para mostrar a tendência
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GraficoLinha;
