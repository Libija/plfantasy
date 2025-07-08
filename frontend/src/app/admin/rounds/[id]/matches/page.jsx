"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa"
import styles from "../../../../../styles/AdminRoundMatches.module.css"

export default function RoundMatches() {
  const params = useParams()
  const roundId = params.id

  const [round, setRound] = useState({
    id: roundId,
    number: 3,
    season: "2024/25",
    startDate: "2024-08-24",
    endDate: "2024-08-25",
    status: "U toku",
  })

  const [matches, setMatches] = useState([
    {
      id: 1,
      homeTeam: { id: 1, name: "FK Sarajevo", logo: "/placeholder.svg?height=40&width=40" },
      awayTeam: { id: 2, name: "FK Željezničar", logo: "/placeholder.svg?height=40&width=40" },
      date: "2024-08-24",
      time: "20:00",
      stadium: "Koševo",
      status: "Završena",
      homeScore: 2,
      awayScore: 1,
    },
    {
      id: 2,
      homeTeam: { id: 3, name: "FK Zrinjski", logo: "/placeholder.svg?height=40&width=40" },
      awayTeam: { id: 4, name: "FK Borac", logo: "/placeholder.svg?height=40&width=40" },
      date: "2024-08-24",
      time: "18:00",
      stadium: "Pod Bijelim Brijegom",
      status: "Završena",
      homeScore: 3,
      awayScore: 0,
    },
    {
      id: 3,
      homeTeam: { id: 5, name: "FK Velež", logo: "/placeholder.svg?height=40&width=40" },
      awayTeam: { id: 6, name: "FK Široki Brijeg", logo: "/placeholder.svg?height=40&width=40" },
      date: "2024-08-25",
      time: "17:00",
      stadium: "Rođeni",
      status: "U toku",
      homeScore: 1,
      awayScore: 0,
    },
    {
      id: 4,
      homeTeam: { id: 7, name: "FK Tuzla City", logo: "/placeholder.svg?height=40&width=40" },
      awayTeam: { id: 8, name: "FK Sloboda", logo: "/placeholder.svg?height=40&width=40" },
      date: "2024-08-25",
      time: "19:00",
      stadium: "Tušanj",
      status: "Zakazana",
      homeScore: null,
      awayScore: null,
    },
    {
      id: 5,
      homeTeam: { id: 9, name: "NK Posušje", logo: "/placeholder.svg?height=40&width=40" },
      awayTeam: { id: 10, name: "FK Igman", logo: "/placeholder.svg?height=40&width=40" },
      date: "2024-08-25",
      time: "20:00",
      stadium: "Mokri Dolac",
      status: "Zakazana",
      homeScore: null,
      awayScore: null,
    },
  ])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [matchToDelete, setMatchToDelete] = useState(null)

  const handleDeleteClick = (match) => {
    setMatchToDelete(match)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setMatches(matches.filter((match) => match.id !== matchToDelete.id))
    setShowDeleteModal(false)
    setMatchToDelete(null)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Završena":
        return styles.statusCompleted
      case "U toku":
        return styles.statusInProgress
      case "Zakazana":
        return styles.statusScheduled
      default:
        return ""
    }
  }

  const getTeamInitials = (teamName) => {
    return teamName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 3)
      .toUpperCase()
  }

  return (
    <>
      <Head>
        <title>Utakmice {round.number}. kola | Admin</title>
        <meta name="description" content={`Upravljanje utakmicama ${round.number}. kola`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/rounds" className={styles.backButton}>
            <FaArrowLeft />
            <span>Nazad na kola</span>
          </Link>
          <h1 className={styles.title}>
            Utakmice {round.number}. kola
            <span className={`${styles.roundStatus} ${getStatusClass(round.status)}`}>{round.status}</span>
          </h1>
          <Link href={`/admin/rounds/${roundId}/matches/create`} className={styles.createButton}>
            <FaPlus /> Dodaj utakmicu
          </Link>
        </div>

        <div className={styles.roundInfo}>
          <div className={styles.infoItem}>
            <FaCalendarAlt />
            <span>
              {new Date(round.startDate).toLocaleDateString("bs-BA")} -{" "}
              {new Date(round.endDate).toLocaleDateString("bs-BA")}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span>Sezona: {round.season}</span>
          </div>
        </div>

        <div className={styles.matchesList}>
          {matches.length === 0 ? (
            <div className={styles.noMatches}>
              <p>Nema utakmica u ovom kolu.</p>
              <Link href={`/admin/rounds/${roundId}/matches/create`} className={styles.addMatchButton}>
                <FaPlus /> Dodaj prvu utakmicu
              </Link>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className={styles.matchCard}>
                <div className={styles.matchHeader}>
                  <div className={styles.matchDate}>
                    <FaCalendarAlt />
                    <span>{new Date(match.date).toLocaleDateString("bs-BA")}</span>
                  </div>
                  <div className={styles.matchTime}>
                    <FaClock />
                    <span>{match.time}</span>
                  </div>
                  <div className={styles.matchStadium}>
                    <FaMapMarkerAlt />
                    <span>{match.stadium}</span>
                  </div>
                  <div className={`${styles.matchStatus} ${getStatusClass(match.status)}`}>{match.status}</div>
                </div>

                <div className={styles.matchTeams}>
                  <div className={styles.team}>
                    <div className={styles.teamLogo}>
                      {match.homeTeam.logo ? (
                        <img src={match.homeTeam.logo || "/placeholder.svg"} alt={match.homeTeam.name} />
                      ) : (
                        <div className={styles.teamInitials}>{getTeamInitials(match.homeTeam.name)}</div>
                      )}
                    </div>
                    <div className={styles.teamName}>{match.homeTeam.name}</div>
                  </div>

                  <div className={styles.matchScore}>
                    {match.status !== "Zakazana" ? (
                      <>
                        <span className={styles.score}>{match.homeScore}</span>
                        <span className={styles.scoreSeparator}>:</span>
                        <span className={styles.score}>{match.awayScore}</span>
                      </>
                    ) : (
                      <span className={styles.vs}>VS</span>
                    )}
                  </div>

                  <div className={styles.team}>
                    <div className={styles.teamLogo}>
                      {match.awayTeam.logo ? (
                        <img src={match.awayTeam.logo || "/placeholder.svg"} alt={match.awayTeam.name} />
                      ) : (
                        <div className={styles.teamInitials}>{getTeamInitials(match.awayTeam.name)}</div>
                      )}
                    </div>
                    <div className={styles.teamName}>{match.awayTeam.name}</div>
                  </div>
                </div>

                <div className={styles.matchActions}>
                  {match.status === "Zakazana" ? (
                    <>
                      <Link href={`/admin/matches/result/${match.id}`} className={styles.resultButton}>
                        Unesi rezultat
                      </Link>
                      <Link href={`/admin/matches/edit/${match.id}`} className={styles.editButton}>
                        <FaEdit />
                      </Link>
                      <button className={styles.deleteButton} onClick={() => handleDeleteClick(match)}>
                        <FaTrash />
                      </button>
                    </>
                  ) : match.status === "U toku" ? (
                    <>
                      <Link href={`/admin/matches/result/${match.id}`} className={styles.updateButton}>
                        Ažuriraj rezultat
                      </Link>
                      <Link href={`/admin/matches/events/${match.id}`} className={styles.eventsButton}>
                        Događaji
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/admin/matches/events/${match.id}`} className={styles.eventsButton}>
                        Događaji
                      </Link>
                      <Link href={`/admin/matches/edit/${match.id}`} className={styles.editButton}>
                        <FaEdit />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Potvrda brisanja</h2>
              <p className={styles.modalText}>
                Da li ste sigurni da želite obrisati utakmicu {matchToDelete?.homeTeam.name} vs{" "}
                {matchToDelete?.awayTeam.name}?
              </p>
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>
                  Otkaži
                </button>
                <button className={styles.confirmButton} onClick={confirmDelete}>
                  Obriši
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
