// src/components/TransactionForm.js
import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  styled,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import { getPlanejamentoMensal } from "../services/PlanejamentoService";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  maxWidth: 600,
  margin: "40px auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  position: "relative",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5),
  borderRadius: 8,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
}));

const TransactionForm = ({ onClose, mesReferencia }) => {
  const theme = useTheme();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [valor, setValor] = useState("");
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Categorias padrão caso não haja planejamento
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
    "Casa Nova",
    "Investimento",
    "Salário 1",
    "Salário 2",
    "Extra",
    "Outros",
  ];

  // Buscar categorias do planejamento ao carregar o componente
  useEffect(() => {
    const buscarCategoriasPlanejamento = async () => {
      try {
        setLoadingCategorias(true);
        const user = auth.currentUser;

        if (!user || !mesReferencia) {
          setCategorias(categoriasDefault);
          setLoadingCategorias(false);
          return;
        }

        // Buscar planejamento do mês
        const planejamento = await getPlanejamentoMensal(
          user.uid,
          mesReferencia
        );

        if (
          planejamento &&
          planejamento.categorias &&
          planejamento.categorias.length > 0
        ) {
          // Separar categorias por tipo
          const categoriasEntrada = planejamento.categorias
            .filter((cat) => cat.tipo === "entrada")
            .map((cat) => cat.nome);

          const categoriasSaida = planejamento.categorias
            .filter((cat) => cat.tipo === "saida")
            .map((cat) => cat.nome);

          // Adicionar "Outros" se não existir
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
          // Se não houver planejamento, usar categorias padrão
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
  }, [mesReferencia]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      const user = auth.currentUser;
      if (!user) {
        setError("Usuário não autenticado.");
        return;
      }

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        data,
        descricao,
        categoria,
        tipo,
        valor: valorNumber,
        mesReferencia: mesReferencia,
        createdAt: new Date(),
      });

      // Limpar o formulário
      setData(new Date().toISOString().split("T")[0]);
      setDescricao("");
      setCategoria("");
      setTipo("entrada");
      setValor("");

      // Fechar o componente
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Erro ao adicionar transação:", err);
      setError("Erro ao salvar transação.");
    }
  };

  const handleTipoChange = (event, newTipo) => {
    if (newTipo !== null) {
      setTipo(newTipo);
      // Limpar categoria ao mudar o tipo
      setCategoria("");
    }
  };

  // Obter lista de categorias baseada no tipo selecionado
  const getCategoriasParaTipo = () => {
    if (loadingCategorias) {
      return [];
    }

    // Se categorias for um objeto com entrada/saida
    if (typeof categorias === "object" && !Array.isArray(categorias)) {
      return tipo === "entrada"
        ? categorias.entrada || []
        : categorias.saida || [];
    }

    // Se for array (categorias padrão)
    return categorias;
  };

  const categoriasDisponiveis = getCategoriasParaTipo();

  return (
    <Container>
      <FormContainer elevation={0}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: theme.palette.primary.main, pr: 4 }}
        >
          Nova Transação
        </Typography>

        {onClose && (
          <CloseButton onClick={onClose} aria-label="fechar">
            <CloseIcon />
          </CloseButton>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <ToggleButtonGroup
            value={tipo}
            exclusive
            onChange={handleTipoChange}
            fullWidth
            sx={{ mb: 4 }}
          >
            <ToggleButton
              value="entrada"
              sx={{
                py: 2,
                color: tipo === "entrada" ? "#4caf50" : "inherit",
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
                py: 2,
                color: tipo === "saida" ? "#f44336" : "inherit",
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
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
            }}
            step="0.01"
          />

          <TextField
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal" disabled={loadingCategorias}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
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

          {!loadingCategorias && categoriasDisponiveis.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Crie um planejamento para o mês para ter categorias
              personalizadas.
            </Alert>
          )}

          <StyledButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            startIcon={tipo === "entrada" ? <AddIcon /> : <RemoveIcon />}
            disabled={loadingCategorias}
            sx={{
              backgroundColor: tipo === "entrada" ? "#4caf50" : "#f44336",
              "&:hover": {
                backgroundColor: tipo === "entrada" ? "#45a049" : "#e53935",
              },
            }}
          >
            Adicionar {tipo === "entrada" ? "Entrada" : "Saída"}
          </StyledButton>
        </form>
      </FormContainer>
    </Container>
  );
};

export default TransactionForm;
