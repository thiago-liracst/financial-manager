// src/hooks/useMonthStatus.js
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const useMonthStatus = (user, currentMonth) => {
  const [isMonthClosed, setIsMonthClosed] = useState(false);
  const [monthClosingData, setMonthClosingData] = useState(null);
  const [initialBalance, setInitialBalance] = useState(0);

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

  // Função para obter o mês anterior
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
    const prevYear = monthNum === 1 ? year - 1 : year;
    return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
  };

  const handleMonthClosed = () => {
    // Recarregar os dados após o fechamento do mês
    setIsMonthClosed(true);
  };

  return {
    isMonthClosed,
    monthClosingData,
    initialBalance,
    handleMonthClosed,
  };
};

export default useMonthStatus;
