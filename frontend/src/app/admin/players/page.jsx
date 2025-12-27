"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../styles/AdminPlayers.module.css"

export default function AdminPlayers() {
  const [players, setPlayers] = useState([])
  const [clubs, setClubs] = useState([])
  const [filters, setFilters] = useState({ club: "", position: "", search: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      try {
        const [playersRes, clubsRes] = await Promise.all([
          fetch(`${apiUrl}/admin/players`),
          fetch(`${apiUrl}/admin/clubs`),
        ])
        const playersData = await playersRes.json()
        const clubsData = await clubsRes.json()
        setPlayers(playersData)
        setClubs(clubsData)
      } catch {
        setError("Greška pri dohvatu podataka.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const nationalities = {
    BIH: { label: "Bosna i Hercegovina", flag: "🇧🇦" },
    HRV: { label: "Hrvatska", flag: "🇭🇷" },
    SLO: { label: "Slovenija", flag: "🇸🇮" },
    SRB: { label: "Srbija", flag: "🇷🇸" },
    MNE: { label: "Crna Gora", flag: "🇲🇪" },
    MKD: { label: "Makedonija", flag: "🇲🇰" },
    OTHER: { label: "Rest of the World", flag: "🌍" },
  }

  const mapPlayerToFormData = (player) => {
    // Ako backend šalje samo 'name', pokušaj splitati na first/last
    let firstName = player.firstName || "";
    let lastName = player.lastName || "";
    if (!firstName && !lastName && player.name) {
      const parts = player.name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }
    return {
      firstName,
      lastName,
      club_id: player.club_id || "",
      position: player.position || "",
      shirt_number: player.shirt_number || "",
      nationality: player.nationality || "",
      fantasyPrice: player.price || "",
    };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // FILTER LOGIC
  const filteredPlayers = players.filter((player) => {
    return (
      (filters.club === "" || player.club_id === Number(filters.club)) &&
      (filters.position === "" || player.position === filters.position) &&
      (filters.search === "" ||
        player.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const handleDelete = (player) => {
    setSelectedPlayer(player)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/admin/players/${selectedPlayer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Greška pri brisanju igrača");
      setPlayers(players.filter((player) => player.id !== selectedPlayer.id));
      setShowDeleteModal(false);
      setSelectedPlayer(null);
    } catch (err) {
      alert("Greška pri brisanju igrača!");
    }
  };

  const handleEdit = (player) => {
    setSelectedPlayer(player)
    setEditFormData(mapPlayerToFormData(player))
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const payload = {
      name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
      club_id: editFormData.club_id,
      position: editFormData.position,
      price: Number(editFormData.fantasyPrice),
      shirt_number: editFormData.shirt_number ? Number(editFormData.shirt_number) : null,
      nationality: editFormData.nationality,
    };
    try {
      const res = await fetch(`${apiUrl}/admin/players/${selectedPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Greška pri ažuriranju igrača");
      const updated = await res.json();
      setPlayers((prev) => prev.map((player) => (player.id === selectedPlayer.id ? updated : player)));
      setShowEditModal(false);
      setSelectedPlayer(null);
      setEditFormData({});
    } catch (err) {
      alert("Greška pri ažuriranju igrača!");
    }
  };

  return (
    <>
      <Head>
        <title>Upravljanje igračima | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje igračima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Upravljanje igračima</h1>
            <Link href="/admin/players/create" className={styles.createButton}>
              <FaPlus /> Novi igrač
            </Link>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <input
              type="text"
              name="search"
              placeholder="Pretraži igrače..."
              value={filters.search}
              onChange={handleFilterChange}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <select name="club" value={filters.club} onChange={handleFilterChange} className={styles.filterSelect}>
              <option value="">Svi klubovi</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <select
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">Sve pozicije</option>
              <option value="GK">Golman</option>
              <option value="DEF">Odbrana</option>
              <option value="MID">Veznjak</option>
              <option value="FWD">Napadač</option>
            </select>
          </div>
        </div>

        <div className={styles.playersTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Ime</div>
            <div className={styles.headerCell}>Klub</div>
            <div className={styles.headerCell}>Pozicija</div>
            <div className={styles.headerCell}>Fantasy cijena</div>
            <div className={styles.headerCell}>Broj dresa</div>
            <div className={styles.headerCell}>Nacionalnost</div>
            <div className={styles.headerCell}>Akcije</div>
          </div>

          {loading ? (
            <p>Učitavanje igrača...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : filteredPlayers.length === 0 ? (
            <p>Nema igrača koji odgovaraju filtrom.</p>
          ) : (
            filteredPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={
                  styles.tableRow +
                  " " +
                  (idx % 2 === 0 ? styles.zebraRow : "")
                }
              >
                <div className={styles.tableCell}>{player.name}</div>
                <div className={styles.tableCell}>{clubs.find((club) => club.id === player.club_id)?.name || "N/A"}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.position} ${styles[player.position.toLowerCase()]}`}>
                    {player.position === "GK"
                      ? "Golman"
                      : player.position === "DEF"
                      ? "Odbrana"
                      : player.position === "MID"
                      ? "Veznjak"
                      : player.position === "FWD"
                      ? "Napadač"
                      : player.position}
                  </span>
                </div>
                <div className={styles.tableCell}>{Number(player.price).toFixed(2)}M</div>
                <div className={styles.tableCell}>{player.shirt_number ? player.shirt_number : "-"}</div>
                <div className={styles.tableCell}>
                  {nationalities[player.nationality]?.flag} {nationalities[player.nationality]?.label}
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button className={styles.actionButton} title="Uredi" onClick={() => handleEdit(player)}>
                      <FaEdit />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Obriši"
                      onClick={() => handleDelete(player)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.editModal}>
              <div className={styles.modalHeader}>
                <h3>Uredi igrača</h3>
                <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.editForm}>
                <div className={styles.formSection}>
                  <h4>Osnovne informacije</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-firstName">Ime *</label>
                      <input
                        type="text"
                        id="edit-firstName"
                        name="firstName"
                        value={editFormData.firstName || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-lastName">Prezime *</label>
                      <input
                        type="text"
                        id="edit-lastName"
                        name="lastName"
                        value={editFormData.lastName || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-club">Klub *</label>
                      <select
                        id="edit-club"
                        name="club"
                        value={editFormData.club_id || ""}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Odaberite klub</option>
                        {clubs.map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-position">Pozicija *</label>
                      <select
                        id="edit-position"
                        name="position"
                        value={editFormData.position || ""}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Odaberite poziciju</option>
                        <option value="GK">Golman</option>
                        <option value="DEF">Odbrana</option>
                        <option value="MID">Veznjak</option>
                        <option value="FWD">Napadač</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-number">Broj dresa</label>
                      <input
                        type="number"
                        id="edit-number"
                        name="shirt_number"
                        value={editFormData.shirt_number || ""}
                        onChange={handleEditChange}
                        min="1"
                        max="99"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-nationality">Nacionalnost *</label>
                      <select
                        id="edit-nationality"
                        name="nationality"
                        value={editFormData.nationality || ""}
                        onChange={handleEditChange}
                        required
                      >
                        {Object.entries(nationalities).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.flag} {value.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit-fantasyPrice">Fantasy cijena (M) *</label>
                    <input
                      type="number"
                      id="edit-fantasyPrice"
                      name="fantasyPrice"
                      value={editFormData.fantasyPrice || ""}
                      onChange={handleEditChange}
                      required
                      min="4"
                      max="15"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowEditModal(false)}>
                    Otkaži
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <FaSave /> Sačuvaj promjene
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Potvrdi brisanje</h3>
              </div>
              <div className={styles.modalContent}>
                <p>
                  Da li ste sigurni da želite obrisati igrača "{selectedPlayer?.firstName} {selectedPlayer?.lastName}"?
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
          </div>
        )}
      </div>
    </>
  )
}
