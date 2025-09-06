"use client"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "../../../styles/VijestiDetalji.module.css"
import useAuth from "../../../hooks/use-auth"

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
  const [polls, setPolls] = useState([])
  const [userVotes, setUserVotes] = useState({})
  const { isLoggedIn, token } = useAuth()

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
    if (!id) return
    const fetchPolls = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const headers = {}
        if (isLoggedIn && token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        console.log('Fetching polls from:', `${apiUrl}/polls/news/${id}`)
        const res = await fetch(`${apiUrl}/polls/news/${id}`, {
          headers
        })
        console.log('Polls response status:', res.status)
        if (res.ok) {
          const data = await res.json()
          console.log('Polls data received:', data)
          setPolls(data)
        } else {
          console.error('Polls fetch failed:', res.status, res.statusText)
        }
      } catch (error) {
        console.error('Polls fetch error:', error)
      }
    }
    fetchPolls()
  }, [id, isLoggedIn, token])


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

  const handleVote = async (pollId, optionId) => {
    if (!isLoggedIn || !token) {
      alert("Morate biti ulogovani da biste glasali!")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const res = await fetch(`${apiUrl}/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ option_id: optionId })
      })

      if (res.ok) {
        // Ažuriraj lokalno stanje
        setUserVotes(prev => ({ ...prev, [pollId]: optionId }))
        
        // Ponovo učitaj ankete da dobijemo ažurirane rezultate
        const pollsRes = await fetch(`${apiUrl}/polls/news/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (pollsRes.ok) {
          const updatedPolls = await pollsRes.json()
          setPolls(updatedPolls)
        }
      } else {
        const error = await res.json()
        alert(error.detail || "Greška pri glasanju!")
      }
    } catch {
      alert("Greška pri glasanju!")
    }
  }

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

        {/* Polls Section */}
        {polls.length > 0 && (
          <div className={styles.pollsSection} style={{ position: 'relative' }}>
            <h2 className={styles.pollsTitle}>Ankete</h2>
            
            {/* Login poruka ako nije logovan */}
            {!isLoggedIn && polls.length > 0 && (
              <div className={styles.pollOverlay}>
                <div className={styles.pollOverlayContent}>
                  <h3>🔐 Prijava potrebna</h3>
                  <p>Morate se prijaviti da biste glasali na anketama</p>
                  <a href="/login" className={styles.loginLink}>Prijavite se ovdje</a>
                </div>
              </div>
            )}
            
            {/* Overlay nakon glasanja na svim anketama */}
            {polls.length > 0 && polls.every(p => p.all_polls_voted) && (
              <div className={styles.pollOverlay}>
                <div className={styles.pollOverlayContent}>
                  <h3>🎉 Hvala vam što ste glasali na anketi!</h3>
                  <p>Vaš glas je zabeležen i uzet u obzir.</p>
                </div>
              </div>
            )}
            
            {/* Overlay za neaktivne ankete */}
            {polls.length > 0 && polls.every(p => !p.is_active) && (
              <div className={styles.pollOverlay}>
                <div className={styles.pollOverlayContent}>
                  <h3>⏰ Ankete su zatvorene</h3>
                  <p>Glasanje na ovim anketama je završeno.</p>
                </div>
              </div>
            )}
            
            {polls.map((poll) => (
              <div key={poll.id} className={`${styles.pollCard} ${poll.all_polls_voted ? styles.pollVoted : ''}`}>
                <h3 className={styles.pollQuestion}>{poll.question}</h3>
                
                {/* Rating ankete u liniji */}
                {poll.poll_type === 'rating' ? (
                  <div className={styles.ratingOptions}>
                    {poll.options.map((option) => {
                      const isVoted = userVotes[poll.id] === option.id
                      const isDisabled = !isLoggedIn || poll.user_voted || !poll.is_active
                      return (
                        <button
                          key={option.id}
                          className={`${styles.ratingOption} ${isVoted ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                          onClick={() => handleVote(poll.id, option.id)}
                          disabled={isDisabled}
                        >
                          <span className={styles.ratingNumber}>{option.option_text}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  /* Choice ankete - vertikalno */
                  <div className={styles.pollOptions}>
                    {poll.options.map((option) => {
                      const isVoted = userVotes[poll.id] === option.id
                      const isDisabled = !isLoggedIn || poll.user_voted || !poll.is_active
                      
                      return (
                        <div key={option.id} className={styles.pollOption}>
                          <button
                            className={`${styles.optionButton} ${isVoted ? styles.optionVoted : ''} ${isDisabled ? styles.optionDisabled : ''}`}
                            onClick={() => handleVote(poll.id, option.id)}
                            disabled={isDisabled}
                          >
                            <span className={styles.optionText}>{option.option_text}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                <div className={styles.pollFooter}>
                  {!poll.is_active && (
                    <span className={styles.pollInactive}>Anketa je zatvorena</span>
                  )}
                  {isLoggedIn && poll.is_active && poll.user_voted && (
                    <span className={styles.pollVoted}>Već ste glasali</span>
                  )}
                  {!isLoggedIn && poll.is_active && (
                    <span className={styles.pollLoginRequired}>Morate biti ulogovani da glasate</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
