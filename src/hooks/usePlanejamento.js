// src/hooks/usePlanejamento.js
import { useState, useEffect } from "react";
import {
  getPlanejamentoMensal,
  calcularGastosPorCategoria,
  compararGastosPlanejados,
  getDadosGrafico,
} from "../services/PlanejamentoService";

const usePlanejamento = (user, currentMonth, transactions) => {
  const [planejamento, setPlanejamento] = useState(null);
  const [comparacaoGastos, setComparacaoGastos] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState({ pizza: [], barras: [] });

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

  return {
    planejamento,
    comparacaoGastos,
    dadosGrafico,
    handlePlanejamentoUpdated,
  };
};

export default usePlanejamento;
