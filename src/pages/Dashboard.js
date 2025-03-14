// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Box,
  Container,
  Typography,
  Fab,
  Card,
  CardContent,
  Stack,
  IconButton,
  Grid,
  styled,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import { format } from "date-fns";
import TransactionForm from "../components/TransactionForm";
import MonthSelector from "../components/MonthSelector";
import TransactionList from "../components/TransactionList";
import CloseMonthButton from "../components/CloseMonthButton";
import PlanejamentoComparacao from "../components/PlanejamentoComparacao";
import {
  getPlanejamentoMensal,
  calcularGastosPorCategoria,
  compararGastosPlanejados,
  getDadosGrafico,
} from "../services/PlanejamentoService";

const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",
  color: "white",
  marginBottom: theme.spacing(3),
  borderRadius: 16,
}));

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [isMonthClosed, setIsMonthClosed] = useState(false);
  const [monthClosingData, setMonthClosingData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [planejamento, setPlanejamento] = useState(null);
  const [comparacaoGastos, setComparacaoGastos] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState({ pizza: [], barras: [] });
  const navigate = useNavigate();

  useEffect(() => {
    // Listener de autenticação
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setTransactions([]);
        navigate("/");
        setBalance(0);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Efeito para verificar se o mês está fechado e buscar dados do fechamento
  useEffect(() => {
    if (!user) return;

    const checkMonthClosed = async () => {
      try {
        // Verificar se o mês está fechado
        const closingQuery = query(
          collection(db, "fechamentos"),
          where("userId", "==", user.uid),
          where("mesReferencia", "==", currentMonth)
        );

        const closingSnapshot = await getDocs(closingQuery);

        if (!closingSnapshot.empty) {
          const closingData = closingSnapshot.docs[0].data();
          setIsMonthClosed(true);
          setMonthClosingData(closingData);
          setBalance(closingData.saldoFinal);
        } else {
          setIsMonthClosed(false);
          setMonthClosingData(null);

          // Buscar saldo final do mês anterior para usar como saldo inicial
          const previousMonth = getPreviousMonth(currentMonth);
          const previousClosingQuery = query(
            collection(db, "fechamentos"),
            where("userId", "==", user.uid),
            where("mesReferencia", "==", previousMonth)
          );

          const previousClosingSnapshot = await getDocs(previousClosingQuery);

          if (!previousClosingSnapshot.empty) {
            const previousClosingData = previousClosingSnapshot.docs[0].data();
            setInitialBalance(previousClosingData.saldoFinal);
          } else {
            setInitialBalance(0);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar fechamento do mês:", error);
      }
    };

    checkMonthClosed();
  }, [user, currentMonth]);

  // Efeito para buscar transações do mês selecionado
  useEffect(() => {
    if (!user) return;

    // Buscar transações do mês selecionado
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("mesReferencia", "==", currentMonth)
      // Removido o orderBy para evitar o erro de índice
    );

    // Listener de Firestore para atualizações em tempo real
    const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
      const trans = [];
      querySnapshot.forEach((doc) => {
        trans.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar as transações manualmente pelo campo data
      trans.sort((a, b) => {
        const dateA = a.data?.toDate?.() || new Date(a.data);
        const dateB = b.data?.toDate?.() || new Date(b.data);
        return dateB - dateA; // Ordenação decrescente (mais recente primeiro)
      });

      setTransactions(trans);

      // Se o mês não estiver fechado, calcular o saldo atual
      if (!isMonthClosed) {
        // Cálculo do saldo (saldo inicial + soma das transações)
        const transactionsTotal = trans.reduce((acc, t) => {
          return acc + (t.tipo === "entrada" ? t.valor : -t.valor);
        }, 0);

        setBalance(initialBalance + transactionsTotal);
      }
    });

    return () => unsubscribeSnapshot();
  }, [user, currentMonth, isMonthClosed, initialBalance]);

  // Efeito para buscar o planejamento e calcular a comparação
  useEffect(() => {
    const buscarPlanejamento = async () => {
      if (!user) return;

      try {
        // Buscar planejamento do mês atual
        const planejamentoData = await getPlanejamentoMensal(
          user.uid,
          currentMonth
        );
        setPlanejamento(planejamentoData);

        // Calcular gastos e entradas por categoria
        const categorizado = calcularGastosPorCategoria(transactions);

        // Comparar gastos planejados vs realizados
        if (planejamentoData) {
          const comparacao = compararGastosPlanejados(
            planejamentoData,
            categorizado
          );
          setComparacaoGastos(comparacao);

          // Gerar dados para os gráficos
          const dados = getDadosGrafico(comparacao);
          setDadosGrafico(dados);
        } else {
          setComparacaoGastos([]);
          setDadosGrafico({ pizza: [], barras: [] });
        }
      } catch (error) {
        console.error("Erro ao buscar planejamento:", error);
      }
    };

    buscarPlanejamento();
  }, [user, currentMonth, transactions]);

  // Função para obter o mês anterior
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
    const prevYear = monthNum === 1 ? year - 1 : year;
    return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao deslogar", error);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSelectMonth = (month) => {
    setCurrentMonth(month);
  };

  const handleMonthClosed = () => {
    // Recarregar os dados após o fechamento do mês
    setIsMonthClosed(true);
    // O efeito acima se encarregará de buscar os dados de fechamento
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePlanejamentoUpdated = async () => {
    try {
      // Buscar planejamento do mês atual
      const planejamentoData = await getPlanejamentoMensal(
        user.uid,
        currentMonth
      );
      setPlanejamento(planejamentoData);

      // Calcular gastos por categoria
      const gastosPorCategoria = calcularGastosPorCategoria(transactions);

      // Comparar gastos planejados vs realizados
      if (planejamentoData) {
        const comparacao = compararGastosPlanejados(
          planejamentoData,
          gastosPorCategoria
        );
        setComparacaoGastos(comparacao);

        // Gerar dados para os gráficos
        const dados = getDadosGrafico(comparacao);
        setDadosGrafico(dados);
      }
    } catch (error) {
      console.error("Erro ao atualizar dados do planejamento:", error);
    }
  };

  return (
    <DashboardContainer>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <IconButton onClick={handleLogout} color="primary">
            <LogoutIcon />
          </IconButton>
        </Box>

        {/* Seletor de mês */}
        <MonthSelector
          onSelectMonth={handleSelectMonth}
          currentMonth={currentMonth}
          isMonthClosed={isMonthClosed}
        />

        {/* Card de saldo */}
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

        {/* Tabs para alternar entre Transações e Planejamento */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            variant="fullWidth"
          >
            <Tab label="Transações" />
            <Tab label="Planejamento" />
          </Tabs>
        </Box>

        {/* Formulário de nova transação */}
        {showForm && !isMonthClosed && activeTab === 0 && (
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <TransactionForm
                onClose={toggleForm}
                mesReferencia={currentMonth}
              />
            </CardContent>
          </Card>
        )}

        {/* Conteúdo da tab ativa */}
        {activeTab === 0 ? (
          // Tab de Transações
          <Grid container spacing={3}>
            {/* Botão de fechamento de mês (apenas para meses não fechados) */}
            {!isMonthClosed && (
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 3 }}>
                  <CloseMonthButton
                    userId={user?.uid}
                    mesReferencia={currentMonth}
                    saldoFinal={balance}
                    onMonthClosed={handleMonthClosed}
                  />
                </Box>
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
        ) : (
          // Tab de Planejamento
          <PlanejamentoComparacao
            comparacaoGastos={comparacaoGastos}
            dadosGrafico={dadosGrafico}
            userId={user?.uid}
            mesReferencia={currentMonth}
            onPlanejamentoUpdate={handlePlanejamentoUpdated}
          />
        )}

        {/* Botão flutuante para adicionar transação (apenas para meses não fechados e na tab de transações) */}
        {!isMonthClosed && activeTab === 0 && (
          <Fab
            color="primary"
            onClick={toggleForm}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              boxShadow: 3,
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
