// src/services/PlanejamentoService.js
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

// Função para buscar o planejamento de um determinado mês
export const getPlanejamentoMensal = async (userId, mesReferencia) => {
  try {
    const q = query(
      collection(db, "planejamentos"),
      where("userId", "==", userId),
      where("mesReferencia", "==", mesReferencia),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Erro ao buscar planejamento:", error);
    throw error;
  }
};

// Correção para a função calcularGastosPorCategoria
export const calcularGastosPorCategoria = (transactions) => {
  const gastosPorCategoria = {};
  const entradasPorCategoria = {};

  // Inicializar os objetos
  transactions.forEach((transaction) => {
    if (transaction.tipo === "saida") {
      if (!gastosPorCategoria[transaction.categoria]) {
        gastosPorCategoria[transaction.categoria] = 0;
      }
    } else if (transaction.tipo === "entrada") {
      if (!entradasPorCategoria[transaction.categoria]) {
        entradasPorCategoria[transaction.categoria] = 0;
      }
    }
  });

  // Somar os valores
  transactions.forEach((transaction) => {
    if (transaction.tipo === "saida") {
      gastosPorCategoria[transaction.categoria] += transaction.valor;
    } else if (transaction.tipo === "entrada") {
      entradasPorCategoria[transaction.categoria] += transaction.valor;
    }
  });

  return { gastosPorCategoria, entradasPorCategoria };
};

// Função corrigida para comparar gastos planejados vs realizados
export const compararGastosPlanejados = (
  planejamento,
  { gastosPorCategoria, entradasPorCategoria }
) => {
  if (!planejamento || !planejamento.categorias) return [];

  const comparacao = [];

  planejamento.categorias.forEach((categoria) => {
    const nome = categoria.nome;
    const valorPlanejado = categoria.valorPlanejado || 0;
    const tipo = categoria.tipo || "saida"; // Default para saída caso não especificado

    // Dependendo do tipo, pegamos do objeto correto
    const valorGasto =
      tipo === "saida"
        ? gastosPorCategoria[nome] || 0
        : entradasPorCategoria[nome] || 0;

    const percentualGasto =
      valorPlanejado > 0 ? (valorGasto / valorPlanejado) * 100 : 0;

    // Determinar o status com base no percentual e no tipo
    let status;
    if (tipo === "saida") {
      if (percentualGasto <= 100) status = "ok";
      //else if (percentualGasto <= 100) status = "alerta";
      else status = "ultrapassado";
    } else {
      // Para entradas
      if (percentualGasto >= 100) status = "ok";
      else if (percentualGasto >= 80) status = "alerta";
      else status = "ultrapassado";
    }

    comparacao.push({
      nome,
      valorPlanejado,
      valorGasto,
      percentualGasto,
      status,
      tipo,
    });
  });

  return comparacao;
};

// Função corrigida para gerar dados para os gráficos
export const getDadosGrafico = (comparacao) => {
  if (!comparacao || comparacao.length === 0) {
    return { pizza: [], barras: [] };
  }

  // Filtrar apenas gastos (saídas) para o gráfico de pizza
  const gastosApenas = comparacao.filter((item) => item.tipo === "saida");

  // Dados para o gráfico de pizza (distribuição de gastos)
  const pizza = gastosApenas.map((item) => ({
    name: item.nome,
    value: item.valorGasto,
  }));

  // Dados para o gráfico de barras (comparação planejado vs realizado)
  const barras = comparacao.map((item) => ({
    name: item.nome,
    planejado: item.valorPlanejado,
    gasto: item.valorGasto,
    tipo: item.tipo,
  }));

  return { pizza, barras };
};
