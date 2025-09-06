"use client"

import { useState, useEffect } from 'react'
import styles from '../../../styles/PollsAdmin.module.css'

export default function PollsAdmin() {
  const [pollsData, setPollsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [selectedPolls, setSelectedPolls] = useState([])

  useEffect(() => {
    fetchPollsData()
  }, [])

  const fetchPollsData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      console.log('Fetching polls from:', `${apiUrl}/admin/polls`)
      const res = await fetch(`${apiUrl}/admin/polls`)
      
      console.log('Response status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('Polls data received:', data)
        setPollsData(data)
      } else {
        console.error('API error:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Greška pri dohvatu anketa:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleNewsPolls = async (newsId, isActive) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/polls/news/${newsId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      })
      
      if (res.ok) {
        // Ažuriraj lokalno stanje
        setPollsData(prev => 
          prev.map(news => 
            news.id === newsId 
              ? { ...news, polls: news.polls.map(poll => ({ ...poll, is_active: isActive })) }
              : news
          )
        )
      }
    } catch (error) {
      console.error('Greška pri ažuriranju anketa:', error)
    }
  }

  const showResults = (polls) => {
    setSelectedPolls(polls)
    setShowResultsModal(true)
  }

  const closeResultsModal = () => {
    setShowResultsModal(false)
    setSelectedPolls([])
  }

  if (loading) {
    return <div className={styles.loading}>Učitavanje anketa...</div>
  }

  if (!pollsData || pollsData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Upravljanje anketama</h1>
          <p>Pregled i upravljanje svim anketama grupisano po vijestima</p>
        </div>
        <div className={styles.loading}>
          Nema anketa za prikaz. Kreirajte vijest sa anketama da biste ih videli ovdje.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Upravljanje anketama</h1>
        <p>Pregled i upravljanje svim anketama grupisano po vijestima</p>
      </div>

      <div className={styles.newsList}>
        {(pollsData || []).map((news) => (
          <div key={news.id} className={styles.newsCard}>
            <div className={styles.newsHeader}>
              <h3>{news.title}</h3>
              <div className={styles.newsActions}>
                 <button
                   className={`${styles.toggleBtn} ${news.polls?.some(p => p.is_active) ? styles.active : styles.inactive}`}
                   onClick={() => toggleNewsPolls(news.id, !news.polls?.some(p => p.is_active))}
                 >
                   {news.polls?.some(p => p.is_active) ? 'Deaktiviraj sve' : 'Aktiviraj sve'}
                 </button>
                <button
                  className={styles.resultsBtn}
                  onClick={() => showResults(news.polls || [])}
                >
                  Rezultati
                </button>
              </div>
            </div>
            
            <div className={styles.pollsList}>
              {(news.polls || []).map((poll) => (
                <div key={poll.id} className={`${styles.pollItem} ${poll.is_active ? styles.active : styles.inactive}`}>
                  <div className={styles.pollInfo}>
                    <h4>{poll.question}</h4>
                    <span className={styles.pollType}>{poll.poll_type === 'rating' ? 'Ocjenjivanje' : 'Izbor'}</span>
                    <span className={styles.pollStatus}>
                      {poll.is_active ? 'Aktivna' : 'Neaktivna'}
                    </span>
                  </div>
                  <div className={styles.pollStats}>
                    <span>{poll.total_votes} glasova</span>
                    <span>{poll.options.length} opcija</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Results Modal */}
      {showResultsModal && (
        <div className={styles.modalOverlay} onClick={closeResultsModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Rezultati anketa</h2>
              <button className={styles.closeBtn} onClick={closeResultsModal}>×</button>
            </div>
             <div className={styles.modalBody}>
               {(selectedPolls || []).map((poll) => (
                <div key={poll.id} className={styles.resultsPoll}>
                  <h3>{poll.question}</h3>
                  <div className={styles.resultsContent}>
                    {poll.poll_type === 'rating' ? (
                      <div className={styles.ratingResults}>
                        <div className={styles.averageRating}>
                          Prosječna ocjena: {poll.average_rating?.toFixed(2) || '0.00'}
                        </div>
                         <div className={styles.ratingBreakdown}>
                           {(poll.options || []).map((option) => (
                            <div key={option.id} className={styles.ratingResult}>
                              <span className={styles.ratingValue}>{option.option_text}</span>
                              <span className={styles.ratingCount}>{option.vote_count} glasova</span>
                              <span className={styles.ratingPercentage}>
                                {poll.total_votes > 0 ? Math.round((option.vote_count / poll.total_votes) * 100) : 0}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                       <div className={styles.choiceResults}>
                         {(poll.options || []).map((option) => {
                          const percentage = poll.total_votes > 0 
                            ? Math.round((option.vote_count / poll.total_votes) * 100) 
                            : 0
                          return (
                            <div key={option.id} className={styles.choiceResult}>
                              <div className={styles.choiceText}>{option.option_text}</div>
                              <div className={styles.choiceStats}>
                                <span className={styles.choiceCount}>{option.vote_count} glasova</span>
                                <span className={styles.choicePercentage}>{percentage}%</span>
                              </div>
                              <div className={styles.choiceBar}>
                                <div 
                                  className={styles.choiceBarFill} 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
