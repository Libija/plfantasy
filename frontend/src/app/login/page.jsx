"use client"

import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import styles from "../../styles/Login.module.css"

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Ovdje bi se implementirala logika za prijavu/registraciju
    console.log("Form submitted:", formData)
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
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
            {!isLogin && (
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
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email adresa</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

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

            <button type="submit" className={styles.submitButton}>
              {isLogin ? "Prijavi se" : "Registruj se"}
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

          <div className={styles.socialLogin}>
            <p>Ili se prijavite putem</p>
            <div className={styles.socialButtons}>
              <button type="button" className={`${styles.socialButton} ${styles.facebook}`}>
                Facebook
              </button>
              <button type="button" className={`${styles.socialButton} ${styles.google}`}>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
