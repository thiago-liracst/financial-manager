import React, { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import SeletorAnalise from "../SeletorAnalise";
import TendenciasGastos from "../dashboard/TendenciasGastos";
import PrevisaoGastos from "../PrevisaoGastos";
import SazonalidadeGastos from "../SazonalidadeGastos";

const AnalisesFinanceiras = ({ user }) => {
  const [tipoAnalise, setTipoAnalise] = useState("tendencias");

  const renderComponenteAnalise = () => {
    switch (tipoAnalise) {
      case "tendencias":
        return <TendenciasGastos user={user} />;
      case "previsao":
        return <PrevisaoGastos user={user} />;
      case "sazonalidade":
        return <SazonalidadeGastos user={user} />;
      default:
        return <TendenciasGastos user={user} />;
    }
  };

  return (
    <Box>
      <SeletorAnalise
        tipoAnalise={tipoAnalise}
        setTipoAnalise={setTipoAnalise}
      />
      {renderComponenteAnalise()}
    </Box>
  );
};

export default AnalisesFinanceiras;
