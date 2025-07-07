"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Link as MuiLink,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import { Login, PersonAdd, Sports } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function LoginPage() {
  const [authMode, setAuthMode] = useState("login")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = () => {
    console.log("Login:", loginData)
    // Logic for login
  }

  const handleRegister = () => {
    console.log("Register:", registerData)
    // Logic for registration
  }

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box className={styles.header}>
        <Box className={styles.logo}>
          <Sports className={styles.logoIcon} />
          <Typography variant="h4" className={styles.logoText}>
            PLKutak
          </Typography>
        </Box>
        <Typography variant="h6" className={styles.subtitle}>
          Dobrodošli u PLKutak - vaš kutak za Premier Ligu BiH
        </Typography>
      </Box>

      <Card className={styles.authCard}>
        <CardContent className={styles.cardContent}>
          <Box className={styles.toggleContainer}>
            <ToggleButtonGroup
              value={authMode}
              exclusive
              onChange={(_, newMode) => newMode && setAuthMode(newMode)}
              className={styles.toggleGroup}
            >
              <ToggleButton value="login" className={styles.toggleButton}>
                Prijava
              </ToggleButton>
              <ToggleButton value="register" className={styles.toggleButton}>
                Registracija
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {authMode === "login" ? (
            <Box className={styles.formContainer}>
              <Typography variant="h5" className={styles.formTitle}>
                Prijavite se
              </Typography>
              <Box className={styles.formFields}>
                <TextField
                  label="Email adresa"
                  type="email"
                  fullWidth
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className={styles.textField}
                />
                <TextField
                  label="Lozinka"
                  type="password"
                  fullWidth
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className={styles.textField}
                />
                <MuiLink href="#" className={styles.forgotPassword}>
                  Zaboravili ste lozinku?
                </MuiLink>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Login />}
                  onClick={handleLogin}
                  className={styles.submitBtn}
                >
                  Prijavite se
                </Button>
              </Box>
            </Box>
          ) : (
            <Box className={styles.formContainer}>
              <Typography variant="h5" className={styles.formTitle}>
                Registrujte se
              </Typography>
              <Box className={styles.formFields}>
                <TextField
                  label="Ime i prezime"
                  fullWidth
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className={styles.textField}
                />
                <TextField
                  label="Email adresa"
                  type="email"
                  fullWidth
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className={styles.textField}
                />
                <TextField
                  label="Lozinka"
                  type="password"
                  fullWidth
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className={styles.textField}
                />
                <TextField
                  label="Potvrdite lozinku"
                  type="password"
                  fullWidth
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className={styles.textField}
                />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={handleRegister}
                  className={styles.submitBtn}
                >
                  Registrujte se
                </Button>
              </Box>
            </Box>
          )}

          <Divider className={styles.divider} />

          <Box className={styles.footer}>
            <Typography variant="body2" className={styles.footerText}>
              <Link href="/" className={styles.homeLink}>
                ← Nazad na početnu
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
