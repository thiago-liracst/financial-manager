// PlanejamentoComparacao.js
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import PlanejamentoForm from "./PlanejamentoForm";
import ProgressoCategoria from "./ProgressoCategoria";
import GraficoPizza from "./GraficoPizza";
import GraficoBarras from "./GraficoBarras";

const PlanejamentoComparacao = ({
  comparacaoGastos,
  dadosGrafico,
  userId,
  mesReferencia,
  onPlanejamentoUpdate,
}) => {
  const [openPlanejamentoForm, setOpenPlanejamentoForm] = useState(false);

  // Separar as categorias por tipo
  const categoriasSaida =
    comparacaoGastos?.filter((item) => item.tipo === "saida") || [];
  const categoriasEntrada =
    comparacaoGastos?.filter((item) => item.tipo === "entrada") || [];

  const handleOpenPlanejamentoForm = () => {
    setOpenPlanejamentoForm(true);
  };

  const handleClosePlanejamentoForm = () => {
    setOpenPlanejamentoForm(false);
  };

  const handlePlanejamentoSuccess = () => {
    setOpenPlanejamentoForm(false);
    if (onPlanejamentoUpdate) {
      onPlanejamentoUpdate();
    }
  };

  // Renderizar quando não há planejamento
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
            sx={{
              display: { xs: "none", sm: "flex" },
              ml: { xs: 0, sm: 1 },
            }}
          >
            Editar Planejamento
          </Button>
          <IconButton
            onClick={handleOpenPlanejamentoForm}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <EditIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 4 }}>
          {/* Seção de Gastos (Saídas) */}
          {categoriasSaida.length > 0 && (
            <ProgressoCategoria
              categorias={categoriasSaida}
              titulo="Progresso de Gastos por Categoria"
              tipo="saida"
            />
          )}

          {/* Seção de Receitas (Entradas) */}
          {categoriasEntrada.length > 0 && (
            <ProgressoCategoria
              categorias={categoriasEntrada}
              titulo="Progresso de Receitas por Categoria"
              tipo="entrada"
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom align="center">
              Distribuição de Gastos
            </Typography>
            <GraficoPizza pizzaData={dadosGrafico?.pizza || []} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom align="center">
              Planejado vs. Real
            </Typography>
            <GraficoBarras dadosBarras={dadosGrafico?.barras || []} />
          </Grid>
        </Grid>

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
};

export default PlanejamentoComparacao;
