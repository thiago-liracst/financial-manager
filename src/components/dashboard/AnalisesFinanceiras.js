import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import SeletorAnalise from "../SeletorAnalise";
import TendenciasGastos from "../dashboard/TendenciasGastos";
import PrevisaoGastos from "../PrevisaoGastos";
import SazonalidadeGastos from "../SazonalidadeGastos";
import PerformanceIndicatorsPanel from "./PerformanceIndicatorsPanel";
import usePerformanceIndicators from "../../hooks/usePerformanceIndicators";
import useTransactions from "../../hooks/useTransactions";
import usePlanejamento from "../../hooks/usePlanejamento";
import useMonthStatus from "../../hooks/useMonthStatus";

const AnalisesFinanceiras = ({ user }) => {
  const [tipoAnalise, setTipoAnalise] = useState("tendencias");

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().substring(0, 7) // formato 'yyyy-MM'
  );

  const { isMonthClosed, monthClosingData, initialBalance } = useMonthStatus(
    user,
    currentMonth
  );

  const { transactions } = useTransactions(
    user,
    currentMonth,
    isMonthClosed,
    initialBalance,
    monthClosingData
  );

  const { comparacaoGastos } = usePlanejamento(
    user,
    currentMonth,
    transactions
  );

  const renderComponenteAnalise = () => {
    switch (tipoAnalise) {
      case "tendencias":
        return <TendenciasGastos user={user} />;
      case "previsao":
        return <PrevisaoGastos user={user} />;
      case "sazonalidade":
        return <SazonalidadeGastos user={user} />;
      default:
        return <TendenciasGastos user={user} />;
    }
  };

  // Utilizar o novo hook para cálculo dos indicadores
  const indicators = usePerformanceIndicators(
    user,
    currentMonth,
    transactions,
    comparacaoGastos
  );

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box>
        <SeletorAnalise
          tipoAnalise={tipoAnalise}
          setTipoAnalise={setTipoAnalise}
        />
        {renderComponenteAnalise()}
      </Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          Análises Financeiras
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* Indicadores de Performance */}
        <PerformanceIndicatorsPanel indicators={indicators} />

        {/* Local para futura expansão - outras análises */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Mais análises serão adicionadas em breve.
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default AnalisesFinanceiras;
