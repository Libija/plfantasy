"use client"
import { useState, useEffect } from 'react'
import useAuth from '../hooks/use-auth'
import { Snackbar, Alert } from '@mui/material'
import styles from '../styles/MatchPredictions.module.css'

export default function MatchPredictions() {
  const { isLoggedIn, token, loading: authLoading } = useAuth()
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState({})
  const [votedMatches, setVotedMatches] = useState(new Set())
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    if (!authLoading) {
      fetchPredictions()
    }
  }, [isLoggedIn, token, authLoading])

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      setError(null) // Reset error
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const headers = {}
      if (isLoggedIn && token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const res = await fetch(`${apiUrl}/predictions/current`, { headers })
      if (res.ok) {
        const data = await res.json()
        setPredictions(data)
      } else {
        setError('Greška pri dohvatu predviđanja')
      }
    } catch (err) {
      console.error('Error fetching predictions:', err)
      setError('Greška pri dohvatu predviđanja')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const submitPrediction = async (matchId, prediction) => {
    if (!isLoggedIn || !token) {
      setSnackbar({ open: true, message: "Morate biti prijavljeni da biste glasali!", severity: "error" })
      return
    }

    try {
      setSubmitting(prev => ({ ...prev, [matchId]: true }))
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/predictions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          match_id: matchId,
          prediction: prediction
        })
      })

      if (res.ok) {
        // Add match to voted matches
        setVotedMatches(prev => new Set([...prev, matchId]))
        // Refresh predictions to get updated stats
        await fetchPredictions()
        setSnackbar({ open: true, message: "Uspješno ste glasali!", severity: "success" })
      } else {
        const errorData = await res.json()
        setSnackbar({ open: true, message: errorData.detail || 'Greška pri slanju predviđanja', severity: "error" })
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Greška pri slanju predviđanja', severity: "error" })
    } finally {
      setSubmitting(prev => ({ ...prev, [matchId]: false }))
    }
  }

  const getStatusText = () => {
    if (!predictions) return ''
    
    switch (predictions.gameweek_status) {
      case 'scheduled':
        return 'Možete glasati na predviđanjima'
      case 'in_progress':
        return 'Utakmice su u toku - samo rezultati'
      case 'completed':
        return 'Kolo je završeno'
      default:
        return ''
    }
  }

  const getStatusClass = () => {
    if (!predictions) return ''
    
    switch (predictions.gameweek_status) {
      case 'scheduled':
        return styles.statusScheduled
      case 'in_progress':
        return styles.statusInProgress
      case 'completed':
        return styles.statusCompleted
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Učitavanje predviđanja...</div>
      </div>
    )
  }

  if (error || !predictions) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || 'Nema dostupnih predviđanja'}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Predviđanja - Kolo {predictions.gameweek_number}</h2>
        <div className={`${styles.status} ${getStatusClass()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className={styles.matchesGrid}>
        <div className={styles.topMatches}>
          {predictions.matches.slice(0, 3).map((match) => (
            <MatchCard
              key={match.match_id}
              match={match}
              canVote={predictions.can_vote}
              gameweekStatus={predictions.gameweek_status}
              onSubmitPrediction={submitPrediction}
              isSubmitting={submitting[match.match_id] || false}
              isLoggedIn={isLoggedIn}
              hasVoted={votedMatches.has(match.match_id) || match.user_voted}
            />
          ))}
        </div>
        {predictions.matches.length > 3 && (
          <div className={styles.bottomMatches}>
            {predictions.matches.slice(3).map((match) => (
              <MatchCard
                key={match.match_id}
                match={match}
                canVote={predictions.can_vote}
                gameweekStatus={predictions.gameweek_status}
                onSubmitPrediction={submitPrediction}
                isSubmitting={submitting[match.match_id] || false}
                isLoggedIn={isLoggedIn}
                hasVoted={votedMatches.has(match.match_id) || match.user_voted}
              />
            ))}
          </div>
        )}
      </div>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

function MatchCard({ match, canVote, gameweekStatus, onSubmitPrediction, isSubmitting, isLoggedIn, hasVoted }) {
  const [selectedPrediction, setSelectedPrediction] = useState(match.user_prediction)

  const handlePredictionClick = (prediction) => {
    if (!canVote || isSubmitting) return
    
    setSelectedPrediction(prediction)
    onSubmitPrediction(match.match_id, prediction)
  }

  const getPredictionClass = (prediction) => {
    let baseClass = styles.predictionOption
    if (selectedPrediction === prediction) {
      baseClass += ` ${styles.selected}`
    }
    if (!canVote) {
      baseClass += ` ${styles.disabled}`
    }
    return baseClass
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <div className={styles.matchDate}>
          {formatDate(match.match_date)}
        </div>
        <div className={styles.stadium}>
          {match.stadium}
        </div>
      </div>

      <div className={styles.matchContent}>
        {/* Home Team */}
        <div 
          className={`${styles.team} ${canVote && !isSubmitting ? styles.clickable : ''}`}
          onClick={() => canVote && !isSubmitting && handlePredictionClick('home_win')}
        >
          <div className={`${styles.teamLogo} ${selectedPrediction === 'home_win' ? styles.selected : ''}`}>
            {match.home_club_logo ? (
              <img src={match.home_club_logo} alt={match.home_club_name} />
            ) : (
              <div className={styles.logoPlaceholder}>🏆</div>
            )}
          </div>
          <div className={styles.teamName}>{match.home_club_name}</div>
          {(hasVoted || gameweekStatus === 'in_progress') && (
            <div className={styles.percentage}>
              {match.prediction_stats.home_win}%
            </div>
          )}
        </div>

        {/* Draw Option */}
        <div className={styles.drawSection}>
          <button
            className={getPredictionClass('draw')}
            onClick={() => handlePredictionClick('draw')}
            disabled={!canVote || isSubmitting}
          >
            <div className={styles.drawText}>X</div>
            <div className={styles.drawLabel}>Neriješeno</div>
            {(hasVoted || gameweekStatus === 'in_progress') && (
              <div className={styles.percentage}>
                {match.prediction_stats.draw}%
              </div>
            )}
          </button>
        </div>

        {/* Away Team */}
        <div 
          className={`${styles.team} ${canVote && !isSubmitting ? styles.clickable : ''}`}
          onClick={() => canVote && !isSubmitting && handlePredictionClick('away_win')}
        >
          <div className={`${styles.teamLogo} ${selectedPrediction === 'away_win' ? styles.selected : ''}`}>
            {match.away_club_logo ? (
              <img src={match.away_club_logo} alt={match.away_club_name} />
            ) : (
              <div className={styles.logoPlaceholder}>🏆</div>
            )}
          </div>
          <div className={styles.teamName}>{match.away_club_name}</div>
          {(hasVoted || gameweekStatus === 'in_progress') && (
            <div className={styles.percentage}>
              {match.prediction_stats.away_win}%
            </div>
          )}
        </div>
      </div>


      {/* Match Result (if available) */}
      {(match.home_score !== null && match.away_score !== null) && (
        <div className={styles.matchResult}>
          <div className={styles.score}>
            {match.home_score} - {match.away_score}
          </div>
        </div>
      )}

      {/* Login Required Message */}
      {!isLoggedIn && canVote && (
        <div className={styles.loginRequired}>
          <a href="/login" className={styles.loginLink}>
            Prijavite se da biste glasali
          </a>
        </div>
      )}
    </div>
  )
}
