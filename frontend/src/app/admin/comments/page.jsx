"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaTrash } from "react-icons/fa"
import styles from "../../../styles/AdminComments.module.css"
import useAuth from "../../../hooks/use-auth"

export default function AdminComments() {
  const { token, role, loading: authLoading } = useAuth()
  const [newsList, setNewsList] = useState([])
  const [selectedNewsId, setSelectedNewsId] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Čekaj dok se auth ne učita
    if (authLoading) return
    
    // Provjeri role tek nakon što se auth učita
    if (role !== "admin") {
      window.location.href = "/"
      return
    }
    fetchNews()
  }, [role, authLoading])

  useEffect(() => {
    if (selectedNewsId) {
      fetchComments(selectedNewsId)
    }
  }, [selectedNewsId, token])

  const fetchNews = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/news`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setNewsList(data)
      if (data.length > 0 && !selectedNewsId) {
        setSelectedNewsId(data[0].id)
      }
    } catch {
      setError("Greška pri dohvatu vijesti!")
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (newsId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/comments/news/${newsId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComments(data)
    } catch {
      setError("Greška pri dohvatu komentara!")
    }
  }

  const handleDelete = async (commentId, isMainComment) => {
    if (!confirm(isMainComment ? "Da li ste sigurni da želite obrisati komentar? Sve reply-jeve će također biti obrisani." : "Da li ste sigurni da želite obrisati ovaj reply?")) {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        fetchComments(selectedNewsId)
      } else {
        alert("Greška pri brisanju komentara")
      }
    } catch {
      alert("Greška pri brisanju komentara")
    }
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return "upravo sada"
    if (minutes < 60) return `prije ${minutes} ${minutes === 1 ? 'minutu' : minutes < 5 ? 'minute' : 'minuta'}`
    if (hours < 24) return `prije ${hours} ${hours === 1 ? 'sat' : hours < 5 ? 'sata' : 'sati'}`
    if (days < 7) return `prije ${days} ${days === 1 ? 'dan' : 'dana'}`
    
    const months = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar']
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`
  }

  const renderComment = (comment, isReply = false) => {
    if (comment.status === "deleted") {
      return (
        <div key={comment.id} className={`${styles.commentItem} ${styles.deleted}`}>
          <div className={styles.deletedMessage}>
            Korisnik je uklonio komentar
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className={styles.replies}>
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={comment.id} className={`${styles.commentItem} ${isReply ? styles.reply : ''}`}>
        <div className={styles.commentHeader}>
          <div className={styles.commentAuthor}>
            <span className={styles.username}>{comment.user_username}</span>
            <span className={styles.time}>{getRelativeTime(comment.created_at)}</span>
            {comment.is_edited && (
              <span className={styles.edited}>✏️ (edited)</span>
            )}
            <span className={styles.status}>{comment.status}</span>
          </div>
        </div>
        
        <div className={styles.commentContent}>
          {comment.content}
        </div>

        <div className={styles.commentActions}>
          <span className={styles.likes}>👍 {comment.likes_count}</span>
          <button
            onClick={() => handleDelete(comment.id, !isReply)}
            className={styles.deleteBtn}
          >
            <FaTrash /> Obriši
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && !isReply && (
          <div className={styles.replies}>
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  // Čekaj dok se auth ne učita
  if (authLoading) {
    return <div className={styles.container}><p>Učitavanje...</p></div>
  }

  // Provjeri role tek nakon što se auth učita
  if (role !== "admin") {
    return null
  }

  return (
    <>
      <Head>
        <title>Upravljanje komentarima | Admin</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <h1 className={styles.title}>Upravljanje komentarima</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Vijesti</h2>
            {loading ? (
              <p>Učitavanje...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <div className={styles.newsList}>
                {newsList.map(news => (
                  <button
                    key={news.id}
                    onClick={() => setSelectedNewsId(news.id)}
                    className={`${styles.newsItem} ${selectedNewsId === news.id ? styles.active : ''}`}
                  >
                    <div className={styles.newsTitle}>{news.title}</div>
                    <div className={styles.newsDate}>
                      {news.date_posted ? new Date(news.date_posted).toLocaleDateString() : "-"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.mainContent}>
            {selectedNewsId ? (
              <>
                <h2 className={styles.commentsTitle}>
                  Komentari ({comments.length})
                </h2>
                {comments.length === 0 ? (
                  <div className={styles.noComments}>Nema komentara za ovu vijest.</div>
                ) : (
                  <div className={styles.commentsList}>
                    {comments.map(comment => renderComment(comment))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noSelection}>
                Odaberite vijest da vidite komentare
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

