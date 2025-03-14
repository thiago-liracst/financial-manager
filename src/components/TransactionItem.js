// src/components/TransactionItem.js
import React, { useState } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const TransactionItem = ({ transaction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(transaction.data);
  const [descricao, setDescricao] = useState(transaction.descricao);
  const [categoria, setCategoria] = useState(transaction.categoria);
  const [tipo, setTipo] = useState(transaction.tipo);
  const [valor, setValor] = useState(transaction.valor);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "transactions", transaction.id));
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    // Validação simples
    if (!data || !descricao || !categoria || !tipo || !valor) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    const valorNumber = parseFloat(valor);
    if (isNaN(valorNumber) || valorNumber <= 0) {
      setError("Insira um valor válido.");
      return;
    }
    try {
      await updateDoc(doc(db, "transactions", transaction.id), {
        data,
        descricao,
        categoria,
        tipo,
        valor: valorNumber,
      });
      setIsEditing(false);
    } catch (err) {
      setError("Erro ao atualizar a transação.");
      console.error(err);
    }
  };

  return (
    <li>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            step="0.01"
          />
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancelar
          </button>
        </form>
      ) : (
        <>
          <span>
            <strong>{transaction.data}</strong> - {transaction.descricao} -{" "}
            {transaction.categoria} -{" "}
            {transaction.tipo === "entrada" ? "+" : "-"} R$
            {transaction.valor.toFixed(2)}
          </span>
          <button onClick={() => setIsEditing(true)}>Editar</button>
          <button onClick={handleDelete}>Excluir</button>
        </>
      )}
    </li>
  );
};

export default TransactionItem;
