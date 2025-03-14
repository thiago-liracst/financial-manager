// src/components/dashboard/TransactionPanel.js
import React from "react";
import { Grid, Card, CardContent } from "@mui/material";
import TransactionForm from "../TransactionForm";
import TransactionList from "../TransactionList";
import CloseMonthButton from "../CloseMonthButton";

const TransactionPanel = ({
  user,
  transactions,
  isMonthClosed,
  currentMonth,
  showForm,
  toggleForm,
  balance,
  onMonthClosed,
}) => {
  return (
    <>
      {/* Formulário de nova transação */}
      {showForm && !isMonthClosed && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <TransactionForm
              onClose={toggleForm}
              mesReferencia={currentMonth}
            />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Botão de fechamento de mês (apenas para meses não fechados) */}
        {!isMonthClosed && (
          <Grid item xs={12} md={4}>
            <CloseMonthButton
              userId={user?.uid}
              mesReferencia={currentMonth}
              saldoFinal={balance}
              onMonthClosed={onMonthClosed}
            />
          </Grid>
        )}

        {/* Lista de transações */}
        <Grid item xs={12} md={isMonthClosed ? 12 : 8}>
          <TransactionList
            transactions={transactions}
            isMonthClosed={isMonthClosed}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TransactionPanel;
