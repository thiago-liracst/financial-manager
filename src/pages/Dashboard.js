// src/pages/Dashboard.js
import React, { useState } from "react";
import { Box, Container, styled } from "@mui/material";
import useAuth from "../hooks/useAuth";
import useMonthStatus from "../hooks/useMonthStatus";
import useTransactions from "../hooks/useTransactions";
import usePlanejamento from "../hooks/usePlanejamento";
import Header from "../components/dashboard/Header";
import BalanceCard from "../components/dashboard/BalanceCard";
import TabNavigation from "../components/dashboard/TabNavigation";
import TransactionPanel from "../components/dashboard/TransactionPanel";
import PlanejamentoPanel from "../components/dashboard/PlanejamentoPanel";
import AddButton from "../components/dashboard/AddButton";

const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().substring(0, 7) // formato 'yyyy-MM'
  );

  // Custom hooks
  const { user, handleLogout } = useAuth();
  const { isMonthClosed, monthClosingData, initialBalance, handleMonthClosed } =
    useMonthStatus(user, currentMonth);
  const { transactions, balance } = useTransactions(
    user,
    currentMonth,
    isMonthClosed,
    initialBalance,
    monthClosingData // Passando monthClosingData como parâmetro
  );
  const { comparacaoGastos, dadosGrafico, handlePlanejamentoUpdated } =
    usePlanejamento(user, currentMonth, transactions);

  const handleSelectMonth = (month) => {
    setCurrentMonth(month);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <DashboardContainer>
      <Container maxWidth="md">
        <Header
          onLogout={handleLogout}
          onSelectMonth={handleSelectMonth}
          currentMonth={currentMonth}
          isMonthClosed={isMonthClosed}
        />

        <BalanceCard
          balance={balance}
          initialBalance={initialBalance}
          isMonthClosed={isMonthClosed}
          monthClosingData={monthClosingData}
        />

        <TabNavigation
          activeTab={activeTab}
          onChange={(newValue) => setActiveTab(newValue)}
        />

        {activeTab === 0 ? (
          <TransactionPanel
            user={user}
            transactions={transactions}
            isMonthClosed={isMonthClosed}
            currentMonth={currentMonth}
            showForm={showForm}
            toggleForm={toggleForm}
            balance={balance}
            onMonthClosed={handleMonthClosed}
          />
        ) : (
          <PlanejamentoPanel
            userId={user?.uid}
            mesReferencia={currentMonth}
            comparacaoGastos={comparacaoGastos}
            dadosGrafico={dadosGrafico}
            onPlanejamentoUpdate={handlePlanejamentoUpdated}
          />
        )}

        {!isMonthClosed && activeTab === 0 && (
          <AddButton onClick={toggleForm} />
        )}
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
