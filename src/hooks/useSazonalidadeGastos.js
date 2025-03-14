import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const useSazonalidadeGastos = (user, periodoAnos = 2) => {
  const [dadosSazonalidade, setDadosSazonalidade] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriasDestaque, setCategoriasDestaque] = useState([]);

  useEffect(() => {
    const analisarSazonalidadeGastos = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Obter data atual e calcular período de análise
        const dataAtual = new Date();
        const anoAtual = dataAtual.getFullYear();
        const anosAnalise = [];

        // Definir anos para análise
        for (let i = 0; i < periodoAnos; i++) {
          anosAnalise.push(anoAtual - i);
        }

        // Estrutura para armazenar dados por mês e categoria
        const dadosPorMesCategoria = {};
        let todasCategorias = new Set();

        // Inicializar estrutura de dados
        for (let mes = 1; mes <= 12; mes++) {
          const mesPadronizado = mes.toString().padStart(2, "0");
          dadosPorMesCategoria[mesPadronizado] = {};
        }

        // Para cada ano no período, buscar transações de todos os meses
        for (const ano of anosAnalise) {
          for (let mes = 1; mes <= 12; mes++) {
            const mesPadronizado = mes.toString().padStart(2, "0");
            const mesReferencia = `${ano}-${mesPadronizado}`;

            // Não buscar meses futuros
            if (ano === anoAtual && mes > dataAtual.getMonth() + 1) {
              continue;
            }

            const q = query(
              collection(db, "transactions"),
              where("userId", "==", user.uid),
              where("mesReferencia", "==", mesReferencia),
              where("tipo", "==", "saida") // Apenas despesas
            );

            const querySnapshot = await getDocs(q);
            const transacoesMes = [];

            querySnapshot.forEach((doc) => {
              const transacao = { id: doc.id, ...doc.data() };
              transacoesMes.push(transacao);

              // Registrar categoria
              if (transacao.categoria) {
                todasCategorias.add(transacao.categoria);
              }
            });

            // Agrupar por categoria e somar valores
            transacoesMes.forEach((transacao) => {
              const categoria = transacao.categoria || "Sem categoria";

              if (!dadosPorMesCategoria[mesPadronizado][categoria]) {
                dadosPorMesCategoria[mesPadronizado][categoria] = {
                  soma: 0,
                  contagem: 0,
                  anos: new Set(),
                };
              }

              dadosPorMesCategoria[mesPadronizado][categoria].soma +=
                transacao.valor;
              dadosPorMesCategoria[mesPadronizado][categoria].contagem += 1;
              dadosPorMesCategoria[mesPadronizado][categoria].anos.add(ano);
            });
          }
        }

        // Converter categorias para array
        const categoriasArray = Array.from(todasCategorias);
        setCategorias(categoriasArray);

        // Calcular médias mensais e identificar padrões sazonais
        const dadosFormatados = [];
        const indiceSazonalidade = {};
        let mediaTotalCategoria = {};

        // Inicializar média total por categoria
        categoriasArray.forEach((categoria) => {
          mediaTotalCategoria[categoria] = 0;
          indiceSazonalidade[categoria] = {};
        });

        // Calcular médias por mês e categoria
        for (let mes = 1; mes <= 12; mes++) {
          const mesPadronizado = mes.toString().padStart(2, "0");
          const nomeMes = new Date(2000, mes - 1, 1).toLocaleString("pt-BR", {
            month: "short",
          });

          const dadoMes = {
            name: nomeMes,
            mes: mesPadronizado,
          };

          categoriasArray.forEach((categoria) => {
            const dados = dadosPorMesCategoria[mesPadronizado][categoria];

            if (dados && dados.anos.size > 0) {
              // Calcular média considerando apenas anos com dados
              dadoMes[categoria] = parseFloat(
                (dados.soma / dados.anos.size).toFixed(2)
              );
              mediaTotalCategoria[categoria] += dadoMes[categoria];
            } else {
              dadoMes[categoria] = 0;
            }
          });

          dadosFormatados.push(dadoMes);
        }

        // Calcular índice de sazonalidade (valor mês / média anual)
        categoriasArray.forEach((categoria) => {
          mediaTotalCategoria[categoria] = mediaTotalCategoria[categoria] / 12;

          dadosFormatados.forEach((dadoMes) => {
            const valorMes = dadoMes[categoria];
            const media = mediaTotalCategoria[categoria];

            if (media > 0) {
              const indice = parseFloat((valorMes / media).toFixed(2));

              if (!indiceSazonalidade[categoria][dadoMes.mes]) {
                indiceSazonalidade[categoria][dadoMes.mes] = indice;
              }

              // Adicionar índice de sazonalidade aos dados
              dadoMes[`${categoria}_indice`] = indice;
            } else {
              dadoMes[`${categoria}_indice`] = 1;
            }
          });
        });

        // Identificar categorias com maior variação sazonal
        const variacaoSazonal = {};
        categoriasArray.forEach((categoria) => {
          const indices = Object.values(indiceSazonalidade[categoria]);
          const validos = indices.filter((i) => !isNaN(i) && i !== 0);

          if (validos.length > 0) {
            const max = Math.max(...validos);
            const min = Math.min(...validos);
            variacaoSazonal[categoria] = {
              variacao: max - min,
              max,
              min,
            };
          }
        });

        // Ordenar categorias por variação e selecionar as 5 principais
        const categoriasOrdenadas = Object.keys(variacaoSazonal)
          .filter((cat) => variacaoSazonal[cat].variacao > 0.3) // Filtrar apenas variações significativas
          .sort(
            (a, b) => variacaoSazonal[b].variacao - variacaoSazonal[a].variacao
          )
          .slice(0, 5);

        setCategoriasDestaque(categoriasOrdenadas);
        setDadosSazonalidade(dadosFormatados);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao analisar sazonalidade de gastos:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    analisarSazonalidadeGastos();
  }, [user, periodoAnos]);

  return { dadosSazonalidade, categorias, categoriasDestaque, loading, error };
};

export default useSazonalidadeGastos;
