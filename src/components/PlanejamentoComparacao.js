import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Divider,
  Grid,
  Tooltip,
  useTheme,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PlanejamentoForm from "./PlanejamentoForm";

const PlanejamentoComparacao = ({
  comparacaoGastos,
  dadosGrafico,
  userId,
  mesReferencia,
  onPlanejamentoUpdate,
}) => {
  const theme = useTheme();
  const [openPlanejamentoForm, setOpenPlanejamentoForm] = useState(false);
  const pizzaData = Array.isArray(dadosGrafico?.pizza)
    ? dadosGrafico.pizza
    : [];

  // Separar as categorias por tipo
  const categoriasSaida = comparacaoGastos.filter(
    (item) => item.tipo === "saida"
  );
  const categoriasEntrada = comparacaoGastos.filter(
    (item) => item.tipo === "entrada"
  );

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

  const handleOpenPlanejamentoForm = () => {
    setOpenPlanejamentoForm(true);
  };

  const handleClosePlanejamentoForm = () => {
    setOpenPlanejamentoForm(false);
  };

  const handlePlanejamentoSuccess = () => {
    // Fechar o formulário e talvez atualizar os dados
    setOpenPlanejamentoForm(false);

    if (onPlanejamentoUpdate) {
      onPlanejamentoUpdate();
    }
  };

  // Renderizar progresso para um item específico
  const renderProgressItem = (item, index) => {
    // Determinar se o progresso deve ser invertido para entradas
    // Para entradas, 100% ou mais é bom; para saídas, menos de 100% é bom
    const progressValue = Math.min(item.percentualGasto, 100);

    return (
      <Box key={index} sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {getStatusIcon(item.status, item.tipo)}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {item.nome}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="medium">
            R$ {item.valorGasto.toFixed(2)} / R${" "}
            {item.valorPlanejado.toFixed(2)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressValue}
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
    );
  };

  // Renderizar os indicadores de legenda personalizada para o gráfico de pizza
  const renderCustomLegend = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          ml: 2,
          fontSize: 12,
        }}
      >
        {pizzaData.map((entry, index) => (
          <Box
            key={`legend-item-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: 1,
                mr: 1,
              }}
            />
            <Typography variant="caption" sx={{ mr: 1 }}>
              {entry.name}:
            </Typography>
            <Typography variant="caption" fontWeight="medium">
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

  if (!comparacaoGastos || comparacaoGastos.length === 0) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" align="center">
            Sem planejamento para este mês
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Crie um planejamento para visualizar a comparação entre o planejado
            e o realizado.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenPlanejamentoForm}
            >
              Criar Planejamento
            </Button>
          </Box>

          {/* Formulário de Planejamento */}
          <PlanejamentoForm
            open={openPlanejamentoForm}
            onClose={handleClosePlanejamentoForm}
            userId={userId}
            mesReferencia={mesReferencia}
            onSuccess={handlePlanejamentoSuccess}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center" }}
            >
              Planejamento vs. Realizado
              <Tooltip title="Comparação entre os valores planejados e os gastos/receitas reais do mês.">
                <InfoIcon fontSize="small" sx={{ ml: 1, opacity: 0.7 }} />
              </Tooltip>
            </Typography>

            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleOpenPlanejamentoForm}
            >
              Editar Planejamento
            </Button>
          </Box>

          <Box sx={{ mb: 4 }}>
            {/* Seção de Gastos (Saídas) */}
            {categoriasSaida.length > 0 && (
              <>
                {categoriasSaida.map((item, index) =>
                  renderProgressItem(item, `saida-${index}`)
                )}
              </>
            )}

            {/* Seção de Receitas (Entradas) */}
            {categoriasEntrada.length > 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    mt: 2,
                  }}
                >
                  <ArrowUpwardIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.success.main }}
                  />
                  <Typography variant="subtitle2" color="success">
                    Progresso de Receitas por Categoria
                  </Typography>
                </Box>
                {categoriasEntrada.map((item, index) =>
                  renderProgressItem(item, `entrada-${index}`)
                )}
              </>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom align="center">
                Distribuição de Gastos
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", height: 200 }}>
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={pizzaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
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
                    <RechartsTooltip
                      formatter={(value) => `R$ ${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legenda personalizada na lateral */}
                {renderCustomLegend()}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom align="center">
                Planejado vs. Real
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={dadosGrafico.barras}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar
                    name="Planejado"
                    dataKey="planejado"
                    fill={theme.palette.primary.main}
                  />
                  <Bar
                    name="Real"
                    dataKey="gasto"
                    fill={theme.palette.secondary.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>

          {/* Formulário de Planejamento */}
          <PlanejamentoForm
            open={openPlanejamentoForm}
            onClose={handleClosePlanejamentoForm}
            userId={userId}
            mesReferencia={mesReferencia}
            onSuccess={handlePlanejamentoSuccess}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default PlanejamentoComparacao;
