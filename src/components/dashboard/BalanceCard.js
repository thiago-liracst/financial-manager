// src/components/dashboard/BalanceCard.js
import React from "react";
import { Card, CardContent, Typography, styled } from "@mui/material";

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",
  color: "white",
  marginBottom: theme.spacing(3),
  borderRadius: 16,
}));

const BalanceCard = ({
  balance,
  initialBalance,
  isMonthClosed,
  monthClosingData,
}) => {
  return (
    <HeaderCard elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isMonthClosed ? "Saldo Final (Mês Fechado)" : "Saldo Atual"}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          R${balance.toFixed(2)}
        </Typography>

        {!isMonthClosed && initialBalance > 0 && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Saldo inicial: R${initialBalance.toFixed(2)}
          </Typography>
        )}

        {isMonthClosed && monthClosingData && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Fechado em:{" "}
            {monthClosingData.dataFechamento
              ?.toDate()
              .toLocaleDateString("pt-BR") || "Data não disponível"}
          </Typography>
        )}
      </CardContent>
    </HeaderCard>
  );
};

export default BalanceCard;
