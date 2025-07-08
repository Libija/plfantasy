"use client"

import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import styles from "../../styles/Login.module.css"
import { useRouter } from "next/navigation"
import { Snackbar, Alert } from "@mui/material"

export default function Login() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setSnackbar({ open: true, message: "Lozinke se ne podudaraju.", severity: "error" })
        setLoading(false)
        return
      }

      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      const payload = isLogin
        ? {
            username: formData.username,
            password: formData.password,
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }

      const res = await fetch(apiUrl + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setSnackbar({ open: true, message: data.detail || "Greška pri prijavi/registraciji.", severity: "error" })
        setLoading(false)
        return
      }

      if (isLogin) {
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("user", JSON.stringify(data.user))
        window.dispatchEvent(new Event("authChanged"))
        const role = data.user?.role || "user"
        setSnackbar({ open: true, message: "Uspješna prijava!", severity: "success" })
        setTimeout(() => {
          router.push(role === "admin" ? "/admin" : "/")
        }, 1000)
      } else {
        setSnackbar({ open: true, message: "Uspješna registracija! Prijavite se.", severity: "success" })
        setFormData({ email: "", username: "", password: "", confirmPassword: "" })
        setTimeout(() => {
          setIsLogin(true)
        }, 1000)
      }

      setLoading(false)
    } catch (err) {
      setSnackbar({ open: true, message: "Došlo je do greške. Pokušajte ponovo.", severity: "error" })
      setLoading(false)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <>
      <Head>
        <title>{isLogin ? "Prijava" : "Registracija"} | PLKutak</title>
        <meta name="description" content={isLogin ? "Prijavite se na PLKutak" : "Registrujte se na PLKutak"} />
      </Head>

      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>{isLogin ? "Prijava" : "Registracija"}</h1>
          <p className={styles.subtitle}>
            {isLogin
              ? "Dobrodošli nazad! Prijavite se na svoj račun."
              : "Kreirajte svoj račun i pridružite se PLKutak zajednici."}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Korisničko ime</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="email">Email adresa</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="password">Lozinka</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Potvrdite lozinku</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className={styles.forgotPassword}>
                <Link href="/reset-password">Zaboravili ste lozinku?</Link>
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Molimo sačekajte..." : isLogin ? "Prijavi se" : "Registruj se"}
            </button>
          </form>

          <div className={styles.formToggle}>
            <p>
              {isLogin ? "Nemate račun?" : "Već imate račun?"}{" "}
              <button type="button" onClick={toggleForm} className={styles.toggleButton}>
                {isLogin ? "Registrujte se" : "Prijavite se"}
              </button>
            </p>
          </div>

          
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
