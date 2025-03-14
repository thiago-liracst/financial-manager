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

  const getStatusIcon = (status) => {
    switch (status) {
      case "ok":
        return <CheckCircleIcon fontSize="small" color="success" />;
      case "alerta":
        return <WarningIcon fontSize="small" color="warning" />;
      case "ultrapassado":
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ok":
        return theme.palette.success.main;
      case "alerta":
        return theme.palette.warning.main;
      case "ultrapassado":
        return theme.palette.error.main;
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
              <Tooltip title="Comparação entre os valores planejados e os gastos reais do mês.">
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
            <Typography variant="subtitle2" gutterBottom>
              Progresso por Categoria
            </Typography>

            {comparacaoGastos.map((item, index) => (
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
                    {getStatusIcon(item.status)}
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
                  value={Math.min(item.percentualGasto, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[200],
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getStatusColor(item.status),
                    },
                  }}
                />
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom align="center">
                Distribuição de Gastos
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
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
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
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
                    name="Gasto"
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
