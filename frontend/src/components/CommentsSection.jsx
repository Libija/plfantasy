"use client"

import { useState, useEffect } from "react"
import useAuth from "../hooks/use-auth"
import styles from "../styles/CommentsSection.module.css"

const MAX_CONTENT_LENGTH = 300 // Prikazuje se prvih 300 karaktera, onda "View More"

export default function CommentsSection({ newsId }) {
  const { isLoggedIn, token, user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [expandedContent, setExpandedContent] = useState(new Set())

  useEffect(() => {
    fetchComments()
  }, [newsId, token])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const res = await fetch(`${apiUrl}/comments/news/${newsId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      alert("Morate biti ulogovani da biste komentarisali")
      return
    }

    if (!newComment.trim()) {
      alert("Komentar ne može biti prazan")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          news_id: newsId,
          content: newComment.trim()
        })
      })

      if (res.ok) {
        setNewComment("")
        fetchComments()
      } else {
        const error = await res.json()
        alert(error.detail || "Greška pri kreiranju komentara")
      }
    } catch (error) {
      alert("Greška pri kreiranju komentara")
    }
  }

  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim()) {
      alert("Reply ne može biti prazan")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          news_id: newsId,
          parent_id: parentId,
          content: replyContent.trim()
        })
      })

      if (res.ok) {
        setReplyContent("")
        setReplyingTo(null)
        fetchComments()
      } else {
        const error = await res.json()
        alert(error.detail || "Greška pri kreiranju reply-ja")
      }
    } catch (error) {
      alert("Greška pri kreiranju reply-ja")
    }
  }

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) {
      alert("Komentar ne može biti prazan")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editContent.trim()
        })
      })

      if (res.ok) {
        setEditingId(null)
        setEditContent("")
        fetchComments()
      } else {
        const error = await res.json()
        alert(error.detail || "Greška pri editovanju komentara")
      }
    } catch (error) {
      alert("Greška pri editovanju komentara")
    }
  }

  const handleDelete = async (commentId, isMainComment) => {
    if (!confirm(isMainComment ? "Da li ste sigurni da želite obrisati komentar? Sve reply-jeve će također biti obrisani." : "Da li ste sigurni da želite obrisati ovaj reply?")) {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        fetchComments()
      } else {
        alert("Greška pri brisanju komentara")
      }
    } catch (error) {
      alert("Greška pri brisanju komentara")
    }
  }

  const handleLike = async (commentId) => {
    if (!isLoggedIn) {
      alert("Morate biti ulogovani da biste lajkovali")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const toggleReplies = (commentId) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const toggleContent = (commentId) => {
    const newExpanded = new Set(expandedContent)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedContent(newExpanded)
  }

  const getRelativeTime = (dateString) => {
    // Parsiraj datum string kao UTC (backend šalje UTC bez 'Z')
    // Dodaj 'Z' da označi UTC timezone
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z')
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (diff < 60000) return "upravo sada" // Manje od 1 minute
    if (minutes < 60) return `prije ${minutes} ${minutes === 1 ? 'minutu' : minutes < 5 ? 'minute' : 'minuta'}`
    if (hours < 24) return `prije ${hours} ${hours === 1 ? 'sat' : hours < 5 ? 'sata' : 'sati'}`
    if (days < 7) return `prije ${days} ${days === 1 ? 'dan' : 'dana'}`
    
    const months = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar']
    return `${date.getUTCDate()}. ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}.`
  }

  const renderContent = (comment) => {
    const isExpanded = expandedContent.has(comment.id)
    const shouldTruncate = comment.content.length > MAX_CONTENT_LENGTH

    if (shouldTruncate && !isExpanded) {
      return (
        <>
          {comment.content.substring(0, MAX_CONTENT_LENGTH)}...
          <button 
            className={styles.viewMoreBtn}
            onClick={() => toggleContent(comment.id)}
          >
            View More
          </button>
        </>
      )
    }

    return (
      <>
        {comment.content}
        {shouldTruncate && (
          <button 
            className={styles.viewMoreBtn}
            onClick={() => toggleContent(comment.id)}
          >
            View Less
          </button>
        )}
      </>
    )
  }

  const renderComment = (comment, isReply = false) => {
    // Ako je soft deleted, prikaži poruku
    if (comment.status === "deleted") {
      return (
        <div className={`${styles.commentItem} ${styles.deleted}`}>
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
          </div>
        </div>
        
        <div className={styles.commentContent}>
          {editingId === comment.id ? (
            <div className={styles.editForm}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={styles.editTextarea}
                maxLength={1000}
              />
              <div className={styles.editActions}>
                <button 
                  onClick={() => handleEdit(comment.id)}
                  className={styles.saveBtn}
                >
                  Sačuvaj
                </button>
                <button 
                  onClick={() => {
                    setEditingId(null)
                    setEditContent("")
                  }}
                  className={styles.cancelBtn}
                >
                  Otkaži
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.contentText}>
              {renderContent(comment)}
            </div>
          )}
        </div>

        <div className={styles.commentActions}>
          <button
            onClick={() => handleLike(comment.id)}
            className={`${styles.likeBtn} ${comment.user_liked ? styles.liked : ''}`}
            disabled={!isLoggedIn}
          >
            👍 {comment.likes_count}
          </button>
          
          {!isReply && (
            <button
              onClick={() => {
                setReplyingTo(comment.id)
                setReplyContent("")
              }}
              className={styles.replyBtn}
              disabled={!isLoggedIn}
            >
              💬 Reply
            </button>
          )}

          {comment.can_edit && editingId !== comment.id && (
            <button
              onClick={() => {
                setEditingId(comment.id)
                setEditContent(comment.content)
              }}
              className={styles.editBtn}
            >
              ✏️ Edit
            </button>
          )}

          {comment.can_delete && (
            <button
              onClick={() => handleDelete(comment.id, !isReply)}
              className={styles.deleteBtn}
            >
              🗑️ Delete
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className={styles.replyForm}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Napišite reply..."
              className={styles.replyTextarea}
              maxLength={1000}
            />
            <div className={styles.replyActions}>
              <button 
                onClick={() => handleSubmitReply(comment.id)}
                className={styles.submitBtn}
              >
                Pošalji
              </button>
              <button 
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
                className={styles.cancelBtn}
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && !isReply && (
          <div className={styles.repliesSection}>
            <button
              onClick={() => toggleReplies(comment.id)}
              className={styles.toggleRepliesBtn}
            >
              {expandedComments.has(comment.id) ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
            {expandedComments.has(comment.id) && (
              <div className={styles.replies}>
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.commentsSection}>
      <h2 className={styles.title}>Komentari ({comments.length})</h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Napišite komentar..."
            className={styles.commentTextarea}
            maxLength={1000}
            rows={4}
          />
          <div className={styles.formFooter}>
            <span className={styles.charCount}>{newComment.length}/1000</span>
            <button type="submit" className={styles.submitBtn}>
              Pošalji komentar
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <p>Morate biti ulogovani da biste komentarisali.</p>
          <a href="/login" className={styles.loginLink}>Prijavite se ovdje</a>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Učitavanje komentara...</div>
      ) : comments.length === 0 ? (
        <div className={styles.noComments}>Nema komentara. Budite prvi koji će komentarisati!</div>
      ) : (
        <div className={styles.commentsList}>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  )
}

