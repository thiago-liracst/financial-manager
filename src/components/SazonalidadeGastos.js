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
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import GraficoLinha from "../components/GraficoLinha";
import useSazonalidadeGastos from "../hooks/useSazonalidadeGastos";

const SazonalidadeGastos = ({ user }) => {
  const [periodoAnos, setPeriodoAnos] = useState(2); // Padrão: 2 anos
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const { dadosSazonalidade, categorias, categoriasDestaque, loading, error } =
    useSazonalidadeGastos(user, periodoAnos);

  // Formatar dados específicos para o gráfico de sazonalidade
  const formatarDadosGrafico = () => {
    if (!dadosSazonalidade.length) return [];

    // Se uma categoria específica foi selecionada, mostrar essa
    if (categoriaSelecionada) {
      return dadosSazonalidade.map((item) => ({
        ...item,
        [categoriaSelecionada]: item[categoriaSelecionada],
        [`${categoriaSelecionada}_indice`]:
          item[`${categoriaSelecionada}_indice`],
      }));
    }

    // Caso contrário, mostrar categorias em destaque
    const resultado = dadosSazonalidade.map((item) => {
      const dadoFormatado = { name: item.name, mes: item.mes };

      categoriasDestaque.forEach((categoria) => {
        dadoFormatado[categoria] = item[categoria];
        dadoFormatado[`${categoria}_indice`] = item[`${categoria}_indice`];
      });

      return dadoFormatado;
    });

    return resultado;
  };

  // Encontrar meses com maior gasto para a categoria selecionada
  const encontrarMesesDestaque = () => {
    if (!dadosSazonalidade.length || !categoriaSelecionada) return [];

    return dadosSazonalidade
      .filter((item) => item[`${categoriaSelecionada}_indice`] > 1.2)
      .sort(
        (a, b) =>
          b[`${categoriaSelecionada}_indice`] -
          a[`${categoriaSelecionada}_indice`]
      )
      .slice(0, 3)
      .map((item) => ({
        mes: item.name,
        indice: item[`${categoriaSelecionada}_indice`],
        valor: item[categoriaSelecionada],
      }));
  };

  const mesesDestaque = categoriaSelecionada ? encontrarMesesDestaque() : [];
  const dadosGrafico = formatarDadosGrafico();

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
        Análise de Sazonalidade
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Descubra os padrões sazonais nos seus gastos ao longo do ano
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="periodo-anos-label">Período de análise</InputLabel>
            <Select
              labelId="periodo-anos-label"
              value={periodoAnos}
              label="Período de análise"
              onChange={(e) => setPeriodoAnos(e.target.value)}
            >
              <MenuItem value={1}>Último ano</MenuItem>
              <MenuItem value={2}>Últimos 2 anos</MenuItem>
              <MenuItem value={3}>Últimos 3 anos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="sazonalidade-categoria-label">Categoria</InputLabel>
            <Select
              labelId="sazonalidade-categoria-label"
              value={categoriaSelecionada || ""}
              label="Categoria"
              onChange={(e) => setCategoriaSelecionada(e.target.value || null)}
            >
              <MenuItem value="">Categorias com maior sazonalidade</MenuItem>
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
          Erro ao analisar sazonalidade: {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ width: "100%" }}>
          <Skeleton variant="rectangular" height={300} animation="wave" />
        </Box>
      ) : dadosSazonalidade.length === 0 ? (
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
            Dados insuficientes para análise de sazonalidade
          </Typography>
        </Box>
      ) : (
        <>
          {!categoriaSelecionada && categoriasDestaque.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Categorias com maior variação sazonal:
              </Typography>
              <Box>
                {categoriasDestaque.map((categoria) => (
                  <Chip
                    key={categoria}
                    label={categoria}
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={() => setCategoriaSelecionada(categoria)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <GraficoLinha
            data={dadosGrafico}
            categorias={
              categoriaSelecionada ? [categoriaSelecionada] : categoriasDestaque
            }
            categoriaSelecionada={categoriaSelecionada}
          />

          {categoriaSelecionada && mesesDestaque.length > 0 && (
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Meses com maior gasto em {categoriaSelecionada}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {mesesDestaque.map((mes, index) => (
                  <Grid container key={index} spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="body2">{mes.mes}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        R$ {mes.valor.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Tooltip title="Índice de sazonalidade: razão entre o gasto mensal e a média anual. Valores acima de 1 indicam gastos acima da média.">
                        <Chip
                          label={`${mes.indice}x`}
                          color="primary"
                          size="small"
                        />
                      </Tooltip>
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Paper>
  );
};

export default SazonalidadeGastos;
