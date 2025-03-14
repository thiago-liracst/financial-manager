import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import GraficoLinha from "../components/GraficoLinha";
import usePrevisaoGastos from "../hooks/usePrevisaoGastos";

const PrevisaoGastos = ({ user }) => {
  const [mesesHistorico, setMesesHistorico] = useState(6); // Padrão: 6 meses de histórico
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null); // null = todas as categorias

  const { dadosPrevisao, categorias, loading, error } = usePrevisaoGastos(
    user,
    mesesHistorico,
    3 // Sempre prever os próximos 3 meses
  );

  const formatarValor = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

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
        Previsão de Gastos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Projeção dos seus gastos para os próximos 3 meses com base no histórico
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="historico-select-label">Histórico</InputLabel>
            <Select
              labelId="historico-select-label"
              value={mesesHistorico}
              label="Histórico"
              onChange={(e) => setMesesHistorico(e.target.value)}
            >
              <MenuItem value={3}>Últimos 3 meses</MenuItem>
              <MenuItem value={6}>Últimos 6 meses</MenuItem>
              <MenuItem value={12}>Último ano</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="categoria-select-label">Categoria</InputLabel>
            <Select
              labelId="categoria-select-label"
              value={categoriaSelecionada || ""}
              label="Categoria"
              onChange={(e) => setCategoriaSelecionada(e.target.value || null)}
            >
              <MenuItem value="">Todas as categorias</MenuItem>
              {categorias.map((categoria) => (
                <MenuItem key={categoria} value={categoria}>
                  {categoria}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao calcular previsão: {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ width: "100%" }}>
          <Skeleton variant="rectangular" height={300} animation="wave" />
        </Box>
      ) : dadosPrevisao.length === 0 ? (
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
            Dados históricos insuficientes para gerar previsão
          </Typography>
        </Box>
      ) : (
        <>
          <GraficoLinha
            data={dadosPrevisao}
            categorias={
              categoriaSelecionada ? [categoriaSelecionada] : categorias
            }
            categoriaSelecionada={categoriaSelecionada}
          />

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {dadosPrevisao.map((mes) => (
              <Grid item xs={12} sm={4} key={mes.mes}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {mes.name}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {formatarValor(mes.total || 0)}
                    </Typography>
                    {categoriaSelecionada ? (
                      <Typography variant="body2">
                        {categoriaSelecionada}:{" "}
                        {formatarValor(mes[categoriaSelecionada] || 0)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Total previsto
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default PrevisaoGastos;
