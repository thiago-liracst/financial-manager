import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
  Box,
  CircularProgress,
  List,
  ListItem,
  Divider,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const PlanejamentoForm = ({
  open,
  onClose,
  userId,
  mesReferencia,
  onSuccess,
}) => {
  const [categorias, setCategorias] = useState([
    { nome: "Aluguel", valorPlanejado: "", tipo: "saida" },
    { nome: "Alimentação", valorPlanejado: "", tipo: "saida" },
    { nome: "Transporte", valorPlanejado: "", tipo: "saida" },
    { nome: "Salário", valorPlanejado: "", tipo: "entrada" },
  ]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugestedCategories, setSuggestedCategories] = useState([]);
  const [existingPlanejamentoId, setExistingPlanejamentoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Usar o mês atual para o planejamento, não o próximo
  const mesPlanejamento = mesReferencia;

  // Verificar se já existe um planejamento para este mês
  useEffect(() => {
    const checkExistingPlanejamento = async () => {
      if (!open || !userId || !mesReferencia) return;

      setIsLoading(true);
      try {
        const planejamentoQuery = query(
          collection(db, "planejamentos"),
          where("userId", "==", userId),
          where("mesReferencia", "==", mesPlanejamento)
        );

        const querySnapshot = await getDocs(planejamentoQuery);

        if (!querySnapshot.empty) {
          // Já existe um planejamento para este mês
          const planejamentoDoc = querySnapshot.docs[0];
          const planejamentoData = planejamentoDoc.data();

          setExistingPlanejamentoId(planejamentoDoc.id);
          setCategorias(planejamentoData.categorias || []);
        } else {
          // Não existe planejamento, inicializar com valores padrão
          setExistingPlanejamentoId(null);
          setCategorias([
            { nome: "Aluguel", valorPlanejado: "" },
            { nome: "Alimentação", valorPlanejado: "" },
            { nome: "Transporte", valorPlanejado: "" },
          ]);
        }
      } catch (error) {
        console.error("Erro ao verificar planejamento existente:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingPlanejamento();
  }, [open, userId, mesReferencia, mesPlanejamento]);

  // Buscar categorias de transações anteriores do usuário para sugestões
  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId || !open) return;

      try {
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const uniqueCategories = new Set();

        querySnapshot.forEach((doc) => {
          const { categoria } = doc.data();
          if (categoria && !categorias.some((cat) => cat.nome === categoria)) {
            uniqueCategories.add(categoria);
          }
        });

        setSuggestedCategories(Array.from(uniqueCategories));
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, [userId, categorias, open]);

  const handleAddCategoria = () => {
    if (
      novaCategoria.trim() &&
      !categorias.some((cat) => cat.nome === novaCategoria.trim())
    ) {
      setCategorias([
        ...categorias,
        { nome: novaCategoria.trim(), valorPlanejado: "", tipo: "saida" }, // Tipo padrão é saída
      ]);
      setNovaCategoria("");
    }
  };

  const handleRemoveCategoria = (index) => {
    const newCategorias = [...categorias];
    newCategorias.splice(index, 1);
    setCategorias(newCategorias);
  };

  const handleChangeValor = (index, valor) => {
    const newCategorias = [...categorias];
    newCategorias[index].valorPlanejado = valor;
    setCategorias(newCategorias);
  };

  const handleAddSuggestedCategory = (category) => {
    if (!categorias.some((cat) => cat.nome === category)) {
      // Determinar o tipo com base na categoria
      const tipo = categorySuggestionType(category);
      setCategorias([
        ...categorias,
        { nome: category, valorPlanejado: "", tipo },
      ]);
    }
  };

  const categorySuggestionType = (category) => {
    const entradasComuns = [
      "Salário",
      "Freelance",
      "Investimento",
      "Aluguel (Recebido)",
      "Reembolso",
      "Bonificação",
    ];
    return entradasComuns.some((entrada) =>
      category.toLowerCase().includes(entrada.toLowerCase())
    )
      ? "entrada"
      : "saida";
  };

  const handleSubmit = async () => {
    // Validação: todas as categorias devem ter valores válidos
    const isValid = categorias.every(
      (cat) =>
        cat.valorPlanejado !== "" &&
        !isNaN(parseFloat(cat.valorPlanejado)) &&
        parseFloat(cat.valorPlanejado) >= 0
    );

    if (!isValid) {
      alert("Por favor, preencha valores válidos para todas as categorias.");
      return;
    }

    setLoading(true);
    try {
      // Formatar os valores para números
      const categoriasFormatadas = categorias.map((cat) => ({
        nome: cat.nome,
        valorPlanejado: parseFloat(cat.valorPlanejado),
        tipo: cat.tipo || "saida",
      }));

      if (existingPlanejamentoId) {
        // Atualizar planejamento existente
        const planejamentoRef = doc(
          db,
          "planejamentos",
          existingPlanejamentoId
        );
        await updateDoc(planejamentoRef, {
          categorias: categoriasFormatadas,
          dataAtualizacao: serverTimestamp(),
        });
        console.log("Planejamento atualizado com sucesso!");
      } else {
        // Criar novo planejamento
        await addDoc(collection(db, "planejamentos"), {
          userId,
          mesReferencia: mesPlanejamento,
          categorias: categoriasFormatadas,
          dataCriacao: serverTimestamp(),
        });
        console.log("Novo planejamento criado com sucesso!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar planejamento:", error);
      alert("Ocorreu um erro ao salvar o planejamento.");
    } finally {
      setLoading(false);
    }
  };

  const formatMonthDisplay = (mesReferencia) => {
    if (!mesReferencia) return "";
    const [ano, mes] = mesReferencia.split("-");
    return `${mes}/${ano}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {existingPlanejamentoId
          ? `Editar Planejamento para ${formatMonthDisplay(mesPlanejamento)}`
          : `Planejamento para ${formatMonthDisplay(mesPlanejamento)}`}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Defina os valores planejados para cada categoria neste mês.
            </Typography>

            <List sx={{ mb: 3 }}>
              {categorias.map((cat, index) => (
                <React.Fragment key={index}>
                  <ListItem disableGutters>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          flexGrow: 1,
                          mr: 2,
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        {cat.nome}
                      </Typography>

                      {/* Adicionar este seletor de tipo */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        <Select
                          value={cat.tipo || "saida"}
                          onChange={(e) => {
                            const newCategorias = [...categorias];
                            newCategorias[index].tipo = e.target.value;
                            setCategorias(newCategorias);
                          }}
                          size="small"
                          sx={{ mr: 2, minWidth: { xs: 90, sm: 100 } }}
                        >
                          <MenuItem value="entrada">Entrada</MenuItem>
                          <MenuItem value="saida">Saída</MenuItem>
                        </Select>

                        <TextField
                          label="Valor (R$)"
                          type="number"
                          size="small"
                          value={cat.valorPlanejado}
                          onChange={(e) =>
                            handleChangeValor(index, e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                R$
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            width: { xs: "60%", sm: "40%" },
                          }}
                        />
                        <IconButton
                          onClick={() => handleRemoveCategoria(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < categorias.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Box
              sx={{
                display: "flex",
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Nova categoria"
                fullWidth
                size="small"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                sx={{
                  mr: { xs: 0, sm: 1 },
                  mb: { xs: 1, sm: 0 },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddCategoria}
                startIcon={<AddIcon />}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Adicionar
              </Button>
            </Box>

            {sugestedCategories.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  Categorias sugeridas:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {sugestedCategories.map((cat) => (
                    <Button
                      key={cat}
                      size="small"
                      variant="outlined"
                      onClick={() => handleAddSuggestedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading || isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || isLoading || categorias.length === 0}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : existingPlanejamentoId ? (
            "Atualizar Planejamento"
          ) : (
            "Salvar Planejamento"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanejamentoForm;
