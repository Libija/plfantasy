"use client"

import Head from "next/head"
import Link from "next/link"
import styles from "../../styles/Vijesti.module.css"
import { useEffect, useState } from "react"

const CATEGORY_LABELS = {
  all: "Sve",
  transfer: "Transferi",
  injury: "Povrede",
  preview: "Najave",
  result: "Rezultati",
  general: "Ostalo",
}
const CATEGORY_ORDER = ["all", "transfer", "injury", "preview", "result", "general"]

export default function Vijesti() {
  const [news, setNews] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/news`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setNews(data)
      } catch {
        setError("Greška pri dohvatu vijesti!")
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  const filteredNews = selectedCategory === "all"
    ? news
    : news.filter((item) => item.category === selectedCategory)

  const getExcerpt = (text) => {
    if (!text) return ""
    return text.length > 120 ? text.slice(0, 120) + "..." : text
  }

  return (
    <>
      <Head>
        <title>Vijesti | PLKutak</title>
        <meta name="description" content="Najnovije vijesti iz Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Vijesti</h1>
        <p className={styles.subtitle}>Najnovije vijesti iz Premijer lige BiH</p>

        <div className={styles.categoriesFilter}>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryButton} ${selectedCategory === cat ? styles.active : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className={styles.newsGrid}>
          {loading ? (
            <p>Učitavanje vijesti...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : filteredNews.length === 0 ? (
            <p>Nema vijesti za prikaz.</p>
          ) : (
            filteredNews.map((item) => (
              <article key={item.id} className={styles.newsCard}>
                <div className={styles.imageContainer}>
                  <div className={styles.categoryLabel}>
                    {CATEGORY_LABELS[item.category] || item.category}
                  </div>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className={styles.imagePlaceholder}></div>
                  )}
                </div>
                <div className={styles.newsContent}>
                  <span className={styles.newsDate}>{item.date_posted ? new Date(item.date_posted).toLocaleDateString() : "-"}</span>
                  <h3 className={styles.newsTitle}>
                    <Link href={`/vijesti/${item.id}`}>{item.title}</Link>
                  </h3>
                  <p className={styles.newsExcerpt}>{getExcerpt(item.content)}</p>
                  <Link href={`/vijesti/${item.id}`} className={styles.readMore}>
                    Pročitaj više
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </>
  )
}
