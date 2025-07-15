"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaPlay, FaStop, FaEye } from "react-icons/fa"
import styles from "../../../styles/AdminTransferWindows.module.css"

export default function AdminTransferWindows() {
  const [transferWindows, setTransferWindows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    season: "2024/25"
  })
  const [autoUpdateStatus, setAutoUpdateStatus] = useState(null)

  useEffect(() => {
    fetchTransferWindows()
  }, [])

  const fetchTransferWindows = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/transfer-windows?season=2024/25`)
      if (response.ok) {
        const data = await response.json()
        setTransferWindows(data.transfer_windows || [])
      }
    } catch (error) {
      console.error("Greška pri učitavanju transfer window-a:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/transfer-windows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          season: createForm.season
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setShowCreateModal(false)
        setCreateForm({
          season: "2024/25"
        })
        fetchTransferWindows()
      } else {
        const error = await response.json()
        alert(`Greška: ${error.detail}`)
      }
    } catch (error) {
      alert("Greška pri kreiranju transfer window-a")
    }
  }

  const handleOpenWindow = async (windowId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/transfer-windows/${windowId}/open`, {
        method: "PUT",
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchTransferWindows()
      } else {
        alert("Greška pri otvaranju transfer window-a")
      }
    } catch (error) {
      alert("Greška pri otvaranju transfer window-a")
    }
  }

  const handleCloseWindow = async (windowId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/transfer-windows/${windowId}/close`, {
        method: "PUT",
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchTransferWindows()
      } else {
        alert("Greška pri zatvaranju transfer window-a")
      }
    } catch (error) {
      alert("Greška pri zatvaranju transfer window-a")
    }
  }

  const handleAutoUpdate = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/transfer-windows/auto-update?season=2024/25`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setAutoUpdateStatus(data)
        alert(data.message)
        fetchTransferWindows()
      } else {
        alert("Greška pri automatskom ažuriranju")
      }
    } catch (error) {
      alert("Greška pri automatskom ažuriranju")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <span className={styles.openBadge}>OTVOREN</span>
      case "closed":
        return <span className={styles.closedBadge}>ZATVOREN</span>
      default:
        return <span className={styles.unknownBadge}>NEPOZNATO</span>
    }
  }

  if (loading) {
    return <div className={styles.loading}>Učitavanje...</div>
  }

  return (
    <>
      <Head>
        <title>Transfer Windows | Admin Panel</title>
        <meta name="description" content="Upravljanje transfer window-ima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na admin panel
          </Link>
          <h1 className={styles.title}>Globalni Transfer Window</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.autoUpdateButton}
              onClick={handleAutoUpdate}
            >
              <FaPlay /> Automatsko Ažuriranje
            </button>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Kreiraj Transfer Window
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {autoUpdateStatus && (
            <div className={styles.autoUpdateStatus}>
              <h3>Automatsko Ažuriranje</h3>
              <p><strong>Akcija:</strong> {autoUpdateStatus.action}</p>
              <p><strong>Poruka:</strong> {autoUpdateStatus.message}</p>
              {autoUpdateStatus.gameweek_in_progress && (
                <p><strong>Kolo u toku:</strong> {autoUpdateStatus.gameweek_in_progress}</p>
              )}
              {autoUpdateStatus.next_gameweek && (
                <p><strong>Sljedeće kolo:</strong> {autoUpdateStatus.next_gameweek}</p>
              )}
            </div>
          )}
          
          <div className={styles.windowsList}>
            <h2>Transfer Window Status</h2>
            
            {transferWindows.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nema kreiranog transfer window-a</p>
                <button
                  className={styles.createButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  Kreiraj transfer window
                </button>
              </div>
            ) : (
              <div className={styles.windowsGrid}>
                {transferWindows.map((window) => (
                  <div key={window.id} className={styles.windowCard}>
                    <div className={styles.windowHeader}>
                      <h3>Sezona {window.season}</h3>
                      {getStatusBadge(window.status)}
                    </div>
                    
                    <div className={styles.windowDetails}>
                      <p><strong>Sezona:</strong> {window.season}</p>
                      <p><strong>Status:</strong> {window.status}</p>
                    </div>
                    
                    <div className={styles.windowActions}>
                      {window.status === "closed" ? (
                        <button
                          className={styles.openButton}
                          onClick={() => handleOpenWindow(window.id)}
                        >
                          <FaPlay /> Otvori
                        </button>
                      ) : (
                        <button
                          className={styles.closeButton}
                          onClick={() => handleCloseWindow(window.id)}
                        >
                          <FaStop /> Zatvori
                        </button>
                      )}
                      
                      <Link
                        href={`/admin/transfer-windows/${window.id}`}
                        className={styles.viewButton}
                      >
                        <FaEye /> Detalji
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Kreiraj Globalni Transfer Window</h3>
                <button
                  className={styles.closeModalBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="season">Sezona:</label>
                  <input
                    type="text"
                    id="season"
                    value={createForm.season}
                    onChange={(e) => setCreateForm({...createForm, season: e.target.value})}
                    required
                    placeholder="2024/25"
                  />
                </div>
                
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Kreiraj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 