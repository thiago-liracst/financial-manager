// src/components/CloseMonthButton.js
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import LockIcon from "@mui/icons-material/Lock";
import PlanejamentoForm from "./PlanejamentoForm";

const CloseMonthButton = ({
  userId,
  mesReferencia,
  saldoFinal,
  onMonthClosed,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openPlanejamento, setOpenPlanejamento] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseMonth = async () => {
    setLoading(true);
    try {
      // Criar documento de fechamento na coleção 'fechamentos'
      await addDoc(collection(db, "fechamentos"), {
        userId,
        mesReferencia,
        saldoFinal,
        dataFechamento: serverTimestamp(),
      });

      setOpenDialog(false);
      // Após fechar o mês, abre o formulário de planejamento
      setOpenPlanejamento(true);
      // Informa que o mês foi fechado
      onMonthClosed();
    } catch (error) {
      console.error("Erro ao fechar o mês:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanejamentoClose = () => {
    setOpenPlanejamento(false);
  };

  const handlePlanejamentoSuccess = () => {
    // Chamado após salvar o planejamento com sucesso
    console.log("Planejamento salvo com sucesso!");
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
        startIcon={<LockIcon />}
        fullWidth
      >
        Fechar Mês
      </Button>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Fechamento do Mês</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você está prestes a fechar o mês {mesReferencia.split("-")[0]}/
            {mesReferencia.split("-")[1]} com um saldo final de R${" "}
            {saldoFinal.toFixed(2)}.
            <br />
            <br />
            <strong>Atenção:</strong> Após o fechamento, não será possível
            adicionar ou modificar transações neste mês.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCloseMonth}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Confirmar Fechamento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulário de Planejamento */}
      <PlanejamentoForm
        open={openPlanejamento}
        onClose={handlePlanejamentoClose}
        userId={userId}
        mesReferencia={mesReferencia}
        onSuccess={handlePlanejamentoSuccess}
      />
    </>
  );
};

export default CloseMonthButton;
