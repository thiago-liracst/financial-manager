// src/components/dashboard/PlanejamentoPanel.js
import React from "react";
import PlanejamentoComparacao from "../PlanejamentoComparacao";

const PlanejamentoPanel = ({
  userId,
  mesReferencia,
  comparacaoGastos,
  dadosGrafico,
  onPlanejamentoUpdate,
}) => {
  return (
    <PlanejamentoComparacao
      comparacaoGastos={comparacaoGastos}
      dadosGrafico={dadosGrafico}
      userId={userId}
      mesReferencia={mesReferencia}
      onPlanejamentoUpdate={onPlanejamentoUpdate}
    />
  );
};

export default PlanejamentoPanel;
