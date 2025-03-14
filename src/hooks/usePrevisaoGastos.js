import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

const usePrevisaoGastos = (user, mesesHistorico = 6, mesesPrevisao = 3) => {
  const [dadosPrevisao, setDadosPrevisao] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calcularPrevisaoGastos = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Obter data atual
        const dataAtual = new Date();
        const mesAtual = dataAtual.toISOString().substring(0, 7);

        // Calcular o período de histórico (X meses atrás)
        const dataInicial = new Date();
        dataInicial.setMonth(dataInicial.getMonth() - mesesHistorico);

        // Gerar array de meses para histórico
        const mesesHistoricos = [];
        for (let i = 0; i < mesesHistorico; i++) {
          const data = new Date(dataInicial);
          data.setMonth(dataInicial.getMonth() + i);
          const mesFormatado = data.toISOString().substring(0, 7);
          mesesHistoricos.push(mesFormatado);
        }

        // Buscar transações históricas
        const historicoTransacoes = {};
        const todasCategorias = new Set();

        // Para cada mês no histórico, buscar transações
        const transacoesPromises = mesesHistoricos.map(async (mes) => {
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("mesReferencia", "==", mes),
            where("tipo", "==", "saida") // Apenas despesas
          );

          const querySnapshot = await getDocs(q);
          historicoTransacoes[mes] = [];

          querySnapshot.forEach((doc) => {
            const transacao = { id: doc.id, ...doc.data() };
            historicoTransacoes[mes].push(transacao);

            // Registrar categoria
            if (transacao.categoria) {
              todasCategorias.add(transacao.categoria);
            }
          });
        });

        await Promise.all(transacoesPromises);

        // Converter categorias para array
        const categoriasArray = Array.from(todasCategorias);
        setCategorias(categoriasArray);

        // Calcular médias e tendências por categoria
        const estatisticasPorCategoria = {};

        categoriasArray.forEach((categoria) => {
          // Extrair valores históricos desta categoria
          const valoresHistoricos = mesesHistoricos.map((mes) => {
            const transacoesMes = historicoTransacoes[mes] || [];
            return transacoesMes
              .filter((t) => t.categoria === categoria)
              .reduce((sum, t) => sum + t.valor, 0);
          });

          // Calcular média simples
          const media =
            valoresHistoricos.reduce((sum, val) => sum + val, 0) /
            valoresHistoricos.length;

          // Calcular tendência linear simples (para determinar se gastos estão aumentando ou diminuindo)
          let tendencia = 0;
          if (valoresHistoricos.length >= 3) {
            // Usando os últimos 3 meses para determinar a tendência
            const ultimos3Meses = valoresHistoricos.slice(-3);
            if (ultimos3Meses[2] > ultimos3Meses[0]) {
              // Tendência de aumento
              tendencia = (ultimos3Meses[2] - ultimos3Meses[0]) / 2;
            } else {
              // Tendência de diminuição ou estabilidade
              tendencia = (ultimos3Meses[2] - ultimos3Meses[0]) / 2;
            }
          }

          estatisticasPorCategoria[categoria] = {
            media,
            tendencia,
            valoresHistoricos,
          };
        });

        // Gerar meses de previsão
        const mesesPrevistos = [];
        for (let i = 1; i <= mesesPrevisao; i++) {
          const data = new Date(dataAtual);
          data.setMonth(dataAtual.getMonth() + i);
          const nomeMes = data.toLocaleString("pt-BR", { month: "short" });
          const ano = data.getFullYear().toString().substring(2);
          const mesFormatado = data.toISOString().substring(0, 7);

          mesesPrevistos.push({
            nome: `${nomeMes}/${ano}`,
            mesRef: mesFormatado,
          });
        }

        // Calcular previsões
        const previsoes = mesesPrevistos.map((mes, index) => {
          const dadoMes = {
            name: mes.nome,
            mes: mes.mesRef,
          };

          // Calcular valor previsto para cada categoria
          categoriasArray.forEach((categoria) => {
            const { media, tendencia } = estatisticasPorCategoria[categoria];
            // Aplicar tendência para cada mês no futuro
            const valorPrevisto = Math.max(0, media + tendencia * (index + 1));
            dadoMes[categoria] = parseFloat(valorPrevisto.toFixed(2));
          });

          // Total de gastos previsto
          dadoMes.total = Object.keys(dadoMes)
            .filter((key) => key !== "name" && key !== "mes")
            .reduce((sum, categoria) => sum + dadoMes[categoria], 0);

          return dadoMes;
        });

        setDadosPrevisao(previsoes);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao calcular previsão de gastos:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    calcularPrevisaoGastos();
  }, [user, mesesHistorico, mesesPrevisao]);

  return { dadosPrevisao, categorias, loading, error };
};

export default usePrevisaoGastos;
