// src/pages/Login.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Container,
  styled,
} from "@mui/material";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaApple,
  FaMicrosoft,
} from "react-icons/fa";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  width: "100%",
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: "12px 24px",
  textTransform: "none",
  fontSize: "1rem",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const GradientBox = styled(Box)({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // Redirecionar para o Dashboard após login bem-sucedido
      navigate("/dashboard");
    } catch (error) {
      setErro("Falha no login. Verifique suas credenciais.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <GradientBox>
      <Container maxWidth="sm">
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Bem-vindo de Volta
            </Typography>

            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={erro && !validateEmail(email)}
                  helperText={
                    erro && !validateEmail(email)
                      ? "Por favor, insira um email válido"
                      : ""
                  }
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  error={!!erro}
                  helperText={erro ? erro : ""}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Entrar"
                  )}
                </StyledButton>

                <Typography
                  variant="body2"
                  align="center"
                  sx={{ cursor: "pointer", color: "primary.main" }}
                >
                  Esqueceu a senha?
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center">
                  <IconButton sx={{ backgroundColor: "#DB4437" }}>
                    <FaGoogle color="white" />
                  </IconButton>
                  <IconButton sx={{ backgroundColor: "#000000" }}>
                    <FaApple color="white" />
                  </IconButton>
                  <IconButton sx={{ backgroundColor: "#2F2F2F" }}>
                    <FaMicrosoft color="white" />
                  </IconButton>
                </Stack>

                <Typography align="center">
                  Não tem uma conta?{" "}
                  <Typography
                    component="span"
                    sx={{
                      color: "primary.main",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={() => navigate("/signup")}
                  >
                    Cadastre-se
                  </Typography>
                </Typography>
              </Stack>
            </form>
          </CardContent>
        </StyledCard>
      </Container>
    </GradientBox>
  );
};

export default Login;
