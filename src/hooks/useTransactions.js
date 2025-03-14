// src/hooks/useTransactions.js
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const useTransactions = (
  user,
  currentMonth,
  isMonthClosed,
  initialBalance,
  monthClosingData
) => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  // Efeito para buscar transações do mês selecionado
  useEffect(() => {
    if (!user) return;

    // Buscar transações do mês selecionado
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("mesReferencia", "==", currentMonth)
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

  // Efeito para atualizar o saldo quando o mês estiver fechado
  useEffect(() => {
    if (isMonthClosed && monthClosingData?.saldoFinal) {
      setBalance(monthClosingData.saldoFinal);
    }
  }, [isMonthClosed, monthClosingData]);

  return { transactions, balance };
};

export default useTransactions;
