import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Chip,
  styled,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  FaShoppingCart,
  FaCar,
  FaHome,
  FaUtensils,
  FaMoneyBillWave,
  FaRegCreditCard,
  FaMedkit,
  FaGraduationCap,
  FaGamepad,
  FaUsers,
  FaMotorcycle,
  FaFileInvoiceDollar,
  FaKey,
  FaPlane,
  FaGasPump,
  FaLandmark,
  FaCreditCard,
  FaCarAlt,
  FaChartLine,
  FaBriefcase,
  FaGift,
  FaEllipsisH,
} from "react-icons/fa";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { getPlanejamentoMensal } from "../services/PlanejamentoService";

const TransactionCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const TransactionList = ({ transactions, isMonthClosed }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Estado para cada campo do formulário de edição
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    categoria: "",
    tipo: "",
    valor: "",
  });

  // Categorias padrão
  const categoriasDefault = [
    "Família",
    "Moto",
    "Custos Gerais",
    "Aluguel",
    "Saúde",
    "Viagem",
    "Lazer",
    "Gasolina",
    "Imposto",
    "Fatura",
    "Carro",
    "Investimento",
    "Salário 1",
    "Salário 2",
    "Extra",
    "Outros",
  ];

  // Buscar categorias quando abrir o diálogo de edição
  useEffect(() => {
    const buscarCategoriasPlanejamento = async () => {
      if (!openEditDialog || !editingTransaction) return;

      try {
        setLoadingCategorias(true);
        const user = auth.currentUser;

        if (!user || !editingTransaction.mesReferencia) {
          setCategorias(categoriasDefault);
          setLoadingCategorias(false);
          return;
        }

        const planejamento = await getPlanejamentoMensal(
          user.uid,
          editingTransaction.mesReferencia
        );

        if (
          planejamento &&
          planejamento.categorias &&
          planejamento.categorias.length > 0
        ) {
          const categoriasEntrada = planejamento.categorias
            .filter((cat) => cat.tipo === "entrada")
            .map((cat) => cat.nome);

          const categoriasSaida = planejamento.categorias
            .filter((cat) => cat.tipo === "saida")
            .map((cat) => cat.nome);

          if (!categoriasSaida.includes("Outros")) {
            categoriasSaida.push("Outros");
          }
          if (!categoriasEntrada.includes("Outros")) {
            categoriasEntrada.push("Outros");
          }

          setCategorias({
            entrada: categoriasEntrada,
            saida: categoriasSaida,
          });
        } else {
          setCategorias(categoriasDefault);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias do planejamento:", error);
        setCategorias(categoriasDefault);
      } finally {
        setLoadingCategorias(false);
      }
    };

    buscarCategoriasPlanejamento();
  }, [openEditDialog, editingTransaction]);

  const getCategoryIcon = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case "família":
      case "familia":
        return <FaUsers />;
      case "moto":
        return <FaMotorcycle />;
      case "custos gerais":
        return <FaFileInvoiceDollar />;
      case "aluguel":
        return <FaKey />;
      case "saúde":
      case "saude":
        return <FaMedkit />;
      case "viagem":
        return <FaPlane />;
      case "lazer":
        return <FaGamepad />;
      case "gasolina":
        return <FaGasPump />;
      case "imposto":
        return <FaLandmark />;
      case "fatura":
        return <FaCreditCard />;
      case "carro":
        return <FaCarAlt />;
      case "investimento":
        return <FaChartLine />;
      case "salário 1":
      case "salario 1":
        return <FaBriefcase />;
      case "salário 2":
      case "salario 2":
        return <FaBriefcase />;
      case "extra":
        return <FaGift />;
      case "outros":
        return <FaEllipsisH />;
      case "alimentação":
      case "alimentacao":
        return <FaUtensils />;
      case "transporte":
        return <FaCar />;
      case "moradia":
        return <FaHome />;
      case "compras":
        return <FaShoppingCart />;
      case "educação":
      case "educacao":
        return <FaGraduationCap />;
      case "entrada":
        return <FaMoneyBillWave />;
      default:
        return categoria === "entrada" ? (
          <FaMoneyBillWave />
        ) : (
          <FaRegCreditCard />
        );
    }
  };

  const formatDate = (data) => {
    if (data && typeof data.toDate === "function") {
      return data.toDate().toLocaleDateString("pt-BR");
    } else if (data && typeof data === "string") {
      return new Date(data).toLocaleDateString("pt-BR");
    }
    return "Data não disponível";
  };

  const formatDateForInput = (data) => {
    if (data && typeof data.toDate === "function") {
      const date = data.toDate();
      return date.toISOString().split("T")[0];
    } else if (data && typeof data === "string") {
      const date = new Date(data);
      return date.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  };

  const handleOpenEditDialog = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      data: formatDateForInput(transaction.data),
      descricao: transaction.descricao,
      categoria: transaction.categoria,
      tipo: transaction.tipo,
      valor: transaction.valor,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingTransaction(null);
    setError("");
    setCategorias([]);
  };

  const handleOpenDeleteDialog = (transaction) => {
    setTransactionToDelete(transaction);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTransactionToDelete(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "valor" ? parseFloat(value) || "" : value,
    });
  };

  const handleTipoChange = (event, newTipo) => {
    if (newTipo !== null) {
      setFormData({
        ...formData,
        tipo: newTipo,
        categoria: "", // Limpar categoria ao mudar tipo
      });
    }
  };

  const handleUpdateTransaction = async () => {
    setError("");
    if (
      !formData.data ||
      !formData.descricao ||
      !formData.categoria ||
      !formData.tipo ||
      !formData.valor
    ) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    const valorNumber = parseFloat(formData.valor);
    if (isNaN(valorNumber) || valorNumber <= 0) {
      setError("Insira um valor válido.");
      return;
    }

    try {
      await updateDoc(doc(db, "transactions", editingTransaction.id), {
        data: formData.data,
        descricao: formData.descricao,
        categoria: formData.categoria,
        tipo: formData.tipo,
        valor: valorNumber,
        userId: editingTransaction.userId,
        mesReferencia: editingTransaction.mesReferencia,
      });
      handleCloseEditDialog();
    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
      setError("Ocorreu um erro ao salvar as alterações.");
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await deleteDoc(doc(db, "transactions", transactionToDelete.id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
    }
  };

  // Obter categorias baseadas no tipo
  const getCategoriasParaTipo = () => {
    if (loadingCategorias) {
      return [];
    }

    if (typeof categorias === "object" && !Array.isArray(categorias)) {
      return formData.tipo === "entrada"
        ? categorias.entrada || []
        : categorias.saida || [];
    }

    return categorias;
  };

  const categoriasDisponiveis = getCategoriasParaTipo();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Transações</Typography>

        {isMonthClosed && (
          <Chip
            label="Mês fechado - Transações bloqueadas"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {transactions.length === 0 ? (
        <Card sx={{ borderRadius: 3, bgcolor: "#f9f9f9" }}>
          <CardContent>
            <Typography align="center" color="textSecondary">
              Nenhuma transação encontrada para este mês.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        transactions.map((transaction) => (
          <TransactionCard key={transaction.id}>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar
                    sx={{
                      bgcolor:
                        transaction.tipo === "entrada" ? "#4caf50" : "#f44336",
                    }}
                  >
                    {getCategoryIcon(transaction.categoria || transaction.tipo)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="subtitle1">
                    {transaction.descricao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(transaction.data)}
                    {transaction.categoria && (
                      <>
                        <span> • </span>
                        <span>{transaction.categoria}</span>
                      </>
                    )}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color:
                        transaction.tipo === "entrada" ? "#4caf50" : "#f44336",
                      fontWeight: "bold",
                    }}
                  >
                    {transaction.tipo === "entrada" ? "+" : "-"}
                    R${Math.abs(transaction.valor).toFixed(2)}
                  </Typography>
                </Grid>
                {!isMonthClosed && (
                  <Grid item>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditDialog(transaction)}
                      sx={{ color: "primary.main" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteDialog(transaction)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </TransactionCard>
        ))
      )}

      {/* Diálogo de Edição */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar Transação</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <ToggleButtonGroup
            value={formData.tipo}
            exclusive
            onChange={handleTipoChange}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            <ToggleButton
              value="entrada"
              sx={{
                py: 1.5,
                color: formData.tipo === "entrada" ? "#4caf50" : "inherit",
                "&.Mui-selected": {
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(76, 175, 80, 0.2)",
                  },
                },
              }}
            >
              <ArrowUpwardIcon sx={{ mr: 1 }} />
              Entrada
            </ToggleButton>
            <ToggleButton
              value="saida"
              sx={{
                py: 1.5,
                color: formData.tipo === "saida" ? "#f44336" : "inherit",
                "&.Mui-selected": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.2)",
                  },
                },
              }}
            >
              <ArrowDownwardIcon sx={{ mr: 1 }} />
              Saída
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Descrição"
            name="descricao"
            value={formData.descricao}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            required
          />

          <TextField
            label="Valor"
            name="valor"
            type="number"
            value={formData.valor}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            required
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
            }}
            step="0.01"
          />

          <TextField
            label="Data"
            name="data"
            type="date"
            value={formData.data}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            required
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="dense" disabled={loadingCategorias}>
            <InputLabel>Categoria</InputLabel>
            <Select
              name="categoria"
              value={formData.categoria}
              onChange={handleFormChange}
              required
            >
              {loadingCategorias ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Carregando categorias...
                </MenuItem>
              ) : categoriasDisponiveis.length > 0 ? (
                categoriasDisponiveis.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Nenhuma categoria disponível</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button
            onClick={handleUpdateTransaction}
            variant="contained"
            color="primary"
            disabled={loadingCategorias}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação para Excluir */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a transação "
            {transactionToDelete?.descricao}"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button
            onClick={handleDeleteTransaction}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;
