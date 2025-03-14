// componentes/GraficoBarras.js
import React from "react";
import { useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GraficoBarras = ({ dadosBarras }) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={300} minHeight={200}>
      <BarChart
        data={dadosBarras}
        margin={{ top: 5, right: 5, left: 0, bottom: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          height={40}
          angle={-45}
          textAnchor="end"
        />
        <YAxis tick={{ fontSize: 10 }} />
        <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Bar
          name="Planejado"
          dataKey="planejado"
          fill={theme.palette.primary.main}
        />
        <Bar name="Real" dataKey="gasto" fill={theme.palette.secondary.main} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraficoBarras;
