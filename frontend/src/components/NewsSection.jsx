"use client"
import Link from "next/link"
import styles from "../styles/NewsSection.module.css"
import { useEffect, useState } from "react"

const CATEGORY_LABELS = {
  transfer: "Transferi",
  injury: "Povrede",
  preview: "Najave",
  result: "Rezultati",
  general: "Ostalo",
}

export default function NewsSection() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/news?limit=3`)
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

  const getExcerpt = (text) => {
    if (!text) return ""
    return text.length > 100 ? text.slice(0, 100) + "..." : text
  }

  return (
    <section className={styles.newsSection}>
      <div className={styles.sectionHeader}>
        <h2>Najnovije vijesti</h2>
        <Link href="/vijesti" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>
      <div className={styles.newsGrid}>
        {loading ? (
          <p>Učitavanje vijesti...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : news.length === 0 ? (
          <p>Nema vijesti za prikaz.</p>
        ) : (
          news.map((item) => (
            <article key={item.id} className={styles.newsCard}>
              <div className={styles.imageContainer}>
                <div className={styles.categoryLabel}>
                  {CATEGORY_LABELS[item.category] || item.category}
                </div>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                ) : (
                  <div className={styles.imagePlaceholder} style={{ height: "200px" }}></div>
                )}
              </div>
              <div className={styles.newsContent}>
                <span className={styles.newsDate}>{item.date_posted ? new Date(item.date_posted).toLocaleDateString() : "-"}</span>
                <h3 className={styles.newsTitle}>
                  <Link href={`/vijesti/${item.id}`}>{item.title}</Link>
                </h3>
                <div 
                  className={styles.newsExcerpt} 
                  dangerouslySetInnerHTML={{ __html: getExcerpt(item.content) }}
                />
                <Link href={`/vijesti/${item.id}`} className={styles.readMore}>
                  Pročitaj više
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
