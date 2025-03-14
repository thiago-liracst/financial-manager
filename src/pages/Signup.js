// src/pages/Signup.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  styled,
  Link,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  maxWidth: 400,
  margin: "40px auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5),
  borderRadius: 8,
  transition: "all 0.3s ease",
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const Signup = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validação simples: confirmar se as senhas coincidem
    if (password !== confirmPassword) {
      setError("As senhas devem ser iguais.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Após o cadastro, redireciona para a Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        "Erro ao cadastrar usuário. Verifique os dados e tente novamente."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <FormContainer elevation={3}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              textAlign: "center",
              mb: 4,
            }}
          >
            Cadastro
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSignup}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
            />

            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
            />

            <TextField
              label="Confirme a Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
            />

            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <PersonAddIcon />
              }
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </StyledButton>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Já possui uma conta?{" "}
                <Link
                  component={RouterLink}
                  to="/"
                  underline="hover"
                  sx={{ fontWeight: "bold" }}
                >
                  Faça Login
                </Link>
              </Typography>
            </Box>
          </form>
        </FormContainer>
      </Box>
    </Container>
  );
};

export default Signup;
