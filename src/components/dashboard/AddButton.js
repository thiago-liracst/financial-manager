// src/components/dashboard/AddButton.js
import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const AddButton = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        boxShadow: 3,
      }}
    >
      <AddIcon />
    </Fab>
  );
};

export default AddButton;
