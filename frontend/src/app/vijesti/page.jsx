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
    
    // Ukloni HTML tagove
    const stripHtml = text.replace(/<[^>]*>/g, '')
    
    // Uzmi prvi deo teksta
    return stripHtml.length > 120 ? stripHtml.slice(0, 120) + "..." : stripHtml
  }

  const getRelativeTime = (dateString) => {
    console.log('=== DEBUG getRelativeTime ===');
    console.log('Original dateString:', dateString);
    
    // Parsiraj datum string kao UTC (jer se čuva u UTC)
    const date = new Date(dateString + 'Z'); // Dodaj 'Z' da označi UTC
    console.log('Parsed date (with Z):', date);
    console.log('Date UTC time:', date.getTime());
    console.log('Date UTC string:', date.toISOString());
    
    // Ako je datum invalid, vrati fallback
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return "datum nepoznat";
    }
    
    // Koristi UTC vrijeme za računanje
    const now = new Date();
    console.log('Current now:', now);
    console.log('Current UTC time:', now.getTime());
    console.log('Current UTC string:', now.toISOString());
    
    const diff = now.getTime() - date.getTime();
    console.log('Time difference (ms):', diff);
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    console.log('Calculated:', { minutes, hours, days });
    
    if (minutes < 1) {
      console.log('Result: upravo sada');
      return "upravo sada";
    } else if (minutes < 60) {
      const result = `prije ${minutes} ${minutes === 1 ? 'minutu' : minutes < 5 ? 'minute' : 'minuta'}`;
      console.log('Result:', result);
      return result;
    } else if (hours < 24) {
      const result = `prije ${hours} ${hours === 1 ? 'sat' : hours < 5 ? 'sata' : 'sati'}`;
      console.log('Result:', result);
      return result;
    } else {
      // Za datume starije od 24 sata, koristi UTC format
      const months = [
        'januar', 'februar', 'mart', 'april', 'maj', 'juni',
        'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'
      ];
      const day = date.getUTCDate();
      const month = months[date.getUTCMonth()];
      const year = date.getUTCFullYear();
      const result = `${day}. ${month} ${year}.`;
      console.log('Result:', result);
      return result;
    }
  };

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
                  <span className={styles.newsDate}>{item.date_posted ? getRelativeTime(item.date_posted) : "-"}</span>
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
