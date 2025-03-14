import React, { useState } from "react";
import { Box, Typography, Paper, Skeleton, Alert } from "@mui/material";
import GraficoLinha from "../GraficoLinha";
import SeletorPeriodo from "../SeletorPeriodo";
import useTendenciasGastos from "../../hooks/useTendenciasGastos";

const TendenciasGastos = ({ user }) => {
  const [periodo, setPeriodo] = useState(6); // Padrão: 6 meses
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null); // null = todas as categorias
  const { dadosTendencia, categorias, loading, error } = useTendenciasGastos(
    user,
    periodo,
    categoriaSelecionada
  );

  return (
    <Paper
      elevation={1}
      sx={{
        padding: 3,
        borderRadius: 2,
        backgroundColor: "white",
        mb: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Tendências de Gastos
      </Typography>

      <SeletorPeriodo
        periodo={periodo}
        setPeriodo={setPeriodo}
        categoriaSelecionada={categoriaSelecionada}
        setCategoriaSelecionada={setCategoriaSelecionada}
        categorias={categorias}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar tendências: {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ width: "100%", height: 300 }}>
          <Skeleton variant="rectangular" height={300} animation="wave" />
        </Box>
      ) : dadosTendencia.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
            border: "1px dashed grey",
            borderRadius: "8px",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Sem dados disponíveis para o período selecionado
          </Typography>
        </Box>
      ) : (
        <GraficoLinha
          data={dadosTendencia}
          categorias={categorias}
          categoriaSelecionada={categoriaSelecionada}
        />
      )}
    </Paper>
  );
};

export default TendenciasGastos;
