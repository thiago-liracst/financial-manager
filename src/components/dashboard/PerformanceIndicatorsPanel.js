// src/components/dashboard/PerformanceIndicatorsPanel.js
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Savings as SavingsIcon,
  Compare as CompareIcon,
  Timer as TimerIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const IndicatorCard = ({
  icon,
  title,
  value,
  format,
  description,
  color,
  loading,
}) => {
  const theme = useTheme();

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: "50%",
              p: 1,
              mr: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { color: `${color}.main` } })}
          </Box>
          <Typography variant="h6" component="div">
            {title}
            <Tooltip title={description} placement="top">
              <InfoIcon
                sx={{
                  fontSize: 16,
                  ml: 1,
                  verticalAlign: "text-top",
                  opacity: 0.7,
                }}
              />
            </Tooltip>
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "medium", mb: 1 }}
            >
              {format === "percentage"
                ? `${value}%`
                : format === "days"
                ? `${value} dias`
                : value}
            </Typography>

            {format === "percentage" && (
              <LinearProgress
                variant="determinate"
                value={Math.min(value, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: theme.palette.grey[200],
                  "& .MuiLinearProgress-bar": {
                    bgcolor: `${color}.main`,
                  },
                }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const PerformanceIndicatorsPanel = ({ indicators }) => {
  const { taxaEconomia, taxaDesvioOrcamento, diasReserva, loadingIndicators } =
    indicators;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Indicadores de Performance
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <IndicatorCard
            icon={<SavingsIcon />}
            title="Taxa de Economia"
            value={taxaEconomia}
            format="percentage"
            description="Porcentagem da renda que é poupada mensalmente"
            color="success"
            loading={loadingIndicators}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <IndicatorCard
            icon={<CompareIcon />}
            title="Desvio do Orçamento"
            value={taxaDesvioOrcamento}
            format="percentage"
            description="Percentual médio de quanto seus gastos desviam do planejado"
            color="error"
            loading={loadingIndicators}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <IndicatorCard
            icon={<TimerIcon />}
            title="Dias de Reserva"
            value={diasReserva}
            format="days"
            description="Estimativa de quantos dias seus fundos atuais durariam com seu padrão médio de gastos"
            color="info"
            loading={loadingIndicators}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceIndicatorsPanel;
