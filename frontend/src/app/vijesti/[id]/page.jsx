"use client"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "../../../styles/VijestiDetalji.module.css"

const CATEGORY_LABELS = {
  transfer: "Transferi",
  injury: "Povrede",
  preview: "Najave",
  result: "Rezultati",
  general: "Ostalo",
}

export default function VijestiDetalji() {
  const params = useParams()
  const id = params.id
  const [news, setNews] = useState(null)
  const [allNews, setAllNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    const fetchNews = async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/news/${id}`)
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
  }, [id])

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/news`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setAllNews(data)
      } catch {
        // ignore
      }
    }
    fetchAllNews()
  }, [])

  if (!id) return null
  if (loading) return <div className={styles.container}><p>Učitavanje...</p></div>
  if (error || !news) return <div className={styles.container}><p style={{ color: "red" }}>{error || "Vijest nije pronađena."}</p></div>

  // Povezane vijesti: ista kategorija ili isti klub, osim trenutne
  const related = allNews.filter(
    (item) =>
      item.id !== news.id &&
      (item.category === news.category || (news.club_id && item.club_id === news.club_id))
  ).slice(0, 3)

  const getRelativeTime = (dateString) => {
    // Parsiraj datum string
    const date = new Date(dateString);
    
    // Ako je datum invalid, vrati fallback
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return "datum nepoznat";
    }
    
    // Koristi UTC vrijeme za računanje
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return "upravo sada";
    } else if (minutes < 60) {
      return `prije ${minutes} ${minutes === 1 ? 'minutu' : minutes < 5 ? 'minute' : 'minuta'}`;
    } else if (hours < 24) {
      return `prije ${hours} ${hours === 1 ? 'sat' : hours < 5 ? 'sata' : 'sati'}`;
    } else {
      // Za datume starije od 24 sata, koristi UTC format
      const months = [
        'januar', 'februar', 'mart', 'april', 'maj', 'juni',
        'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'
      ];
      const day = date.getUTCDate();
      const month = months[date.getUTCMonth()];
      const year = date.getUTCFullYear();
      return `${day}. ${month} ${year}.`;
    }
  };

  return (
    <>
      <Head>
        <title>{news.title} | PLKutak</title>
        <meta name="description" content={news.title} />
      </Head>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Početna</Link> / <Link href="/vijesti">Vijesti</Link> / <span>{news.title}</span>
        </div>
        <article className={styles.article}>
          <div className={styles.articleHeader}>
            <h1 className={styles.title}>{news.title}</h1>
            <div className={styles.meta}>
              <span className={styles.date}>{news.date_posted ? getRelativeTime(news.date_posted) : "-"}</span>
              <span className={styles.category}>{CATEGORY_LABELS[news.category] || news.category}</span>
            </div>
          </div>
          <div className={styles.imageContainer}>
            {news.image_url ? (
              <img src={news.image_url} alt={news.title} className={styles.image} style={{ width: "100%", height: "320px", objectFit: "cover", borderRadius: "8px" }} />
            ) : (
              <div className={styles.imagePlaceholder} style={{ height: "320px" }}></div>
            )}
          </div>
          <div className={styles.content}>
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          </div>
        </article>
        <div className={styles.relatedNews}>
          <h2 className={styles.relatedTitle}>Povezane vijesti</h2>
          <div className={styles.relatedGrid}>
            {related.length === 0 ? (
              <p>Nema povezanih vijesti.</p>
            ) : (
              related.map((item) => (
                <Link href={`/vijesti/${item.id}`} key={item.id} className={styles.relatedCard}>
                  <div className={styles.relatedImage}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className={styles.relatedImageImg} />
                    ) : (
                      <div className={styles.relatedImagePlaceholder}>
                        <span>Nema slike</span>
                      </div>
                    )}
                  </div>
                  <h3 className={styles.relatedCardTitle}>{item.title}</h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
