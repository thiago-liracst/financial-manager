// src/hooks/usePerformanceIndicators.js
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const usePerformanceIndicators = (
  user,
  currentMonth,
  transactions,
  comparacaoGastos
) => {
  const [indicators, setIndicators] = useState({
    taxaEconomia: 0,
    taxaDesvioOrcamento: 0,
    diasReserva: 0,
    loadingIndicators: true,
  });

  useEffect(() => {
    const calcularIndicadores = async () => {
      if (!user || !transactions) {
        setIndicators((prev) => ({ ...prev, loadingIndicators: false }));
        return;
      }

      try {
        // 1. Calcular Taxa de Economia
        let totalReceitas = 0;
        let totalDespesas = 0;

        transactions.forEach((transaction) => {
          if (transaction.tipo === "entrada") {
            totalReceitas += transaction.valor;
          } else {
            totalDespesas += transaction.valor;
          }
        });

        const taxaEconomia =
          totalReceitas > 0
            ? ((totalReceitas - totalDespesas) / totalReceitas) * 100
            : 0;

        // 2. Calcular Taxa de Desvio do Orçamento
        let totalDesvio = 0;
        let categoriasComPlanejamento = 0;

        if (comparacaoGastos && comparacaoGastos.length > 0) {
          comparacaoGastos.forEach((item) => {
            if (item.planejado > 0) {
              const desvioPercentual =
                Math.abs((item.realizado - item.planejado) / item.planejado) *
                100;
              totalDesvio += desvioPercentual;
              categoriasComPlanejamento++;
            }
          });
        }

        const taxaDesvioOrcamento =
          categoriasComPlanejamento > 0
            ? totalDesvio / categoriasComPlanejamento
            : 0;

        // 3. Calcular Dias de Reserva Financeira
        // Buscar histórico de gastos dos últimos 3 meses para média diária
        const dataAtual = new Date(currentMonth + "-01");
        const ultimosTresMeses = [];

        for (let i = 0; i < 3; i++) {
          const data = new Date(dataAtual);
          data.setMonth(data.getMonth() - i);
          const mes = data.toISOString().substring(0, 7); // formato 'yyyy-MM'
          ultimosTresMeses.push(mes);
        }

        // Buscar transações dos últimos 3 meses
        const transacoesQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          where("tipo", "==", "saida"),
          where("mesReferencia", "in", ultimosTresMeses)
        );

        const transacoesSnapshot = await getDocs(transacoesQuery);
        let totalGastosTresMeses = 0;

        transacoesSnapshot.forEach((doc) => {
          const transacao = doc.data();
          totalGastosTresMeses += transacao.valor;
        });

        // Calcular média diária de gastos dos últimos 3 meses
        const diasTresMeses = 90; // aproximação
        const mediaDiariaGastos =
          totalGastosTresMeses > 0
            ? totalGastosTresMeses / diasTresMeses
            : totalDespesas / 30; // fallback para média do mês atual se não houver dados

        // Saldo atual considerado como reserva financeira
        // Buscar o saldo atual na coleção de fechamentos ou calculá-lo com base nas transações
        // Aqui estamos usando apenas o saldo calculado das transações do mês atual como simplificação
        const saldoAtual = totalReceitas - totalDespesas;

        // Calcular quantos dias o saldo atual duraria com o padrão médio de gastos
        const diasReserva =
          mediaDiariaGastos > 0
            ? Math.floor(saldoAtual / mediaDiariaGastos)
            : 0;

        setIndicators({
          taxaEconomia: parseFloat(taxaEconomia.toFixed(2)),
          taxaDesvioOrcamento: parseFloat(taxaDesvioOrcamento.toFixed(2)),
          diasReserva: Math.max(0, diasReserva), // Não permitir valores negativos
          loadingIndicators: false,
        });
      } catch (error) {
        console.error("Erro ao calcular indicadores de performance:", error);
        setIndicators((prev) => ({ ...prev, loadingIndicators: false }));
      }
    };

    calcularIndicadores();
  }, [user, currentMonth, transactions, comparacaoGastos]);

  return indicators;
};

export default usePerformanceIndicators;
