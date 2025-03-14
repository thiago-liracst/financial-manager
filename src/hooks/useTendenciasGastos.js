import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

const useTendenciasGastos = (
  user,
  periodoMeses = 6,
  categoriaSelecionada = null
) => {
  const [dadosTendencia, setDadosTendencia] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTendenciasGastos = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Obter data atual e calcular a data inicial (X meses atrás)
        const dataAtual = new Date();
        const dataInicial = new Date();
        dataInicial.setMonth(dataInicial.getMonth() - periodoMeses + 1);

        // Formatando as datas para o formato "YYYY-MM"
        const meses = [];
        for (let i = 0; i < periodoMeses; i++) {
          const data = new Date(dataInicial);
          data.setMonth(dataInicial.getMonth() + i);
          const mesFormatado = data.toISOString().substring(0, 7);
          meses.push(mesFormatado);
        }

        // Buscar todas as transações do período
        const transacoesPorMes = {};
        let todasCategorias = new Set();

        // Inicializar cada mês com um objeto vazio
        meses.forEach((mes) => {
          transacoesPorMes[mes] = {};
        });

        // Para cada mês no período, buscar transações
        const transacoesPromises = meses.map(async (mes) => {
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("mesReferencia", "==", mes),
            where("tipo", "==", "saida") // Apenas despesas
          );

          const querySnapshot = await getDocs(q);
          const transacoesMes = [];

          querySnapshot.forEach((doc) => {
            const transacao = { id: doc.id, ...doc.data() };
            transacoesMes.push(transacao);

            // Adicionar categoria ao conjunto de categorias
            if (transacao.categoria) {
              todasCategorias.add(transacao.categoria);
            }
          });

          // Agrupar por categoria e somar valores
          transacoesMes.forEach((transacao) => {
            const categoria = transacao.categoria || "Sem categoria";

            if (!transacoesPorMes[mes][categoria]) {
              transacoesPorMes[mes][categoria] = 0;
            }

            transacoesPorMes[mes][categoria] += transacao.valor;
          });
        });

        // Aguardar todas as consultas terminarem
        await Promise.all(transacoesPromises);

        // Converter o conjunto de categorias para um array
        const categoriasArray = Array.from(todasCategorias);
        setCategorias(categoriasArray);

        // Formatar dados para o gráfico de linhas
        const dadosFormatados = meses.map((mes) => {
          // Extrair mês e ano para exibição mais amigável
          const [ano, mesNum] = mes.split("-");
          const nomeMes = new Date(ano, mesNum - 1).toLocaleString("pt-BR", {
            month: "short",
          });

          // Criar objeto base com o nome do mês
          const dadoMes = {
            name: `${nomeMes}/${ano.substring(2)}`,
            mes: mes, // Manter o formato original para referência
          };

          // Se uma categoria específica foi selecionada, incluir apenas ela
          if (categoriaSelecionada) {
            dadoMes[categoriaSelecionada] =
              transacoesPorMes[mes][categoriaSelecionada] || 0;
          } else {
            // Caso contrário, incluir todas as categorias
            categoriasArray.forEach((categoria) => {
              dadoMes[categoria] = transacoesPorMes[mes][categoria] || 0;
            });
          }

          return dadoMes;
        });

        setDadosTendencia(dadosFormatados);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar tendências de gastos:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTendenciasGastos();
  }, [user, periodoMeses, categoriaSelecionada]);

  return { dadosTendencia, categorias, loading, error };
};

export default useTendenciasGastos;
