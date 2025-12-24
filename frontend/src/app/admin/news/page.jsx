"use client"

import { useState, useEffect, useRef } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../styles/AdminNews.module.css"

// Custom QuillJS wrapper
const QuillEditor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) return;

    const loadQuill = async () => {
      const Quill = (await import('quill')).default;
      await import('quill/dist/quill.snow.css');

      if (editorRef.current) {
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: placeholder,
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              ['link'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['clean']
            ]
          }
        });

        // Set initial content
        if (value) {
          quillRef.current.root.innerHTML = value;
        }

        // Listen for changes
        quillRef.current.on('text-change', () => {
          const html = quillRef.current.root.innerHTML;
          onChange(html);
        });
      }
    };

    loadQuill();
  }, []);

  // Update content when value prop changes (for edit mode)
  useEffect(() => {
    if (quillRef.current && value) {
      const currentContent = quillRef.current.root.innerHTML;
      if (value !== currentContent) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <div style={{ height: '200px', marginBottom: '50px' }}>
      <div ref={editorRef} style={{ height: '100%' }} />
    </div>
  );
};

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [clubs, setClubs] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editHasPolls, setEditHasPolls] = useState(false)
  const [editPolls, setEditPolls] = useState([])
  const [existingPolls, setExistingPolls] = useState([])

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

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setClubs(data)
      } catch {
        // ignore
      }
    }
    fetchClubs()
  }, [])

  const getClubName = (club_id) => {
    if (!club_id) return "-"
    const club = clubs.find((c) => c.id === club_id)
    return club ? club.name : "-"
  }

  const categories = ["Utakmice", "Transferi", "Klubovi", "Liga", "Infrastruktura", "Ostalo"]

  const CATEGORY_LABELS = {
    transfer: "Transferi",
    injury: "Povrede",
    preview: "Najave",
    result: "Rezultati",
    general: "Ostalo",
  };

  const handleDelete = (newsItem) => {
    setSelectedNews(newsItem)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    try {
      const res = await fetch(`${apiUrl}/admin/news/${selectedNews.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setNews(news.filter((item) => item.id !== selectedNews.id))
      setShowDeleteModal(false)
      setSelectedNews(null)
    } catch {
      alert("Greška pri brisanju vijesti!")
    }
  }

  const handleEdit = async (newsItem) => {
    setSelectedNews(newsItem)
    setEditFormData({ ...newsItem })
    setImagePreview(newsItem.image_url)
    
    // Učitaj postojeće ankete za ovu vijest
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/polls/news/${newsItem.id}`)
      if (res.ok) {
        const polls = await res.json()
        setExistingPolls(polls)
        setEditHasPolls(polls.length > 0)
        setEditPolls(polls.map(poll => ({
          id: poll.id,
          question: poll.question,
          poll_type: poll.poll_type,
          options: poll.options ? poll.options.map(opt => opt.option_text) : []
        })))
      } else {
        setExistingPolls([])
        setEditHasPolls(false)
        setEditPolls([])
      }
    } catch {
      setExistingPolls([])
      setEditHasPolls(false)
      setEditPolls([])
    }
    
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClubChange = (e) => {
    const { value, checked } = e.target
    setEditFormData((prev) => ({
      ...prev,
      relatedClubs: checked ? [...prev.relatedClubs, value] : prev.relatedClubs.filter((club) => club !== value),
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setEditFormData((prev) => ({ ...prev, image_url: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Polls functions for edit mode
  const addEditPoll = () => {
    const newPoll = {
      id: Date.now(), // Temporary ID
      question: "",
      poll_type: "choice",
      options: ["", ""]
    }
    setEditPolls([...editPolls, newPoll])
  }

  const updateEditPoll = (pollId, field, value) => {
    setEditPolls(editPolls.map(poll => 
      poll.id === pollId 
        ? { ...poll, [field]: value }
        : poll
    ))
  }

  const addEditPollOption = (pollId) => {
    setEditPolls(editPolls.map(poll => 
      poll.id === pollId 
        ? { ...poll, options: [...poll.options, ""] }
        : poll
    ))
  }

  const updateEditPollOption = (pollId, optionIndex, value) => {
    setEditPolls(editPolls.map(poll => 
      poll.id === pollId 
        ? { 
            ...poll, 
            options: poll.options.map((opt, idx) => 
              idx === optionIndex ? value : opt
            )
          }
        : poll
    ))
  }

  const removeEditPollOption = (pollId, optionIndex) => {
    setEditPolls(editPolls.map(poll => 
      poll.id === pollId 
        ? { 
            ...poll, 
            options: poll.options.filter((_, idx) => idx !== optionIndex)
          }
        : poll
    ))
  }

  const removeEditPoll = (pollId) => {
    setEditPolls(editPolls.filter(poll => poll.id !== pollId))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const payload = {
      title: editFormData.title,
      content: editFormData.content,
      image_url: editFormData.image_url || null,
      category: editFormData.category,
      club_id: editFormData.club_id ? Number(editFormData.club_id) : null,
      date_posted: editFormData.date_posted,
    }
    try {
      // Ažuriraj vijest
      const res = await fetch(`${apiUrl}/admin/news/${selectedNews.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      
      // Ažuriraj ankete
      if (editHasPolls && editPolls.length > 0) {
        // Prvo obriši postojeće ankete
        for (const existingPoll of existingPolls) {
          await fetch(`${apiUrl}/admin/polls/${existingPoll.id}`, {
            method: "DELETE"
          })
        }
        
        // Zatim kreiraj nove
        for (const poll of editPolls) {
          if (poll.question.trim()) {
            if (poll.poll_type === "rating") {
              const pollPayload = {
                question: poll.question,
                news_id: selectedNews.id
              }
              
              await fetch(`${apiUrl}/admin/polls/rating`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pollPayload),
              })
            } else {
              const pollPayload = {
                question: poll.question,
                news_id: selectedNews.id,
                options: poll.options
                  .filter(opt => opt.trim())
                  .map(opt => opt.trim())
              }
              
              await fetch(`${apiUrl}/admin/polls/choice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pollPayload),
              })
            }
          }
        }
      } else {
        // Ako nema anketa, obriši postojeće
        for (const existingPoll of existingPolls) {
          await fetch(`${apiUrl}/admin/polls/${existingPoll.id}`, {
            method: "DELETE"
          })
        }
      }
      
      setNews((prev) => prev.map((item) => (item.id === selectedNews.id ? updated : item)))
      setShowEditModal(false)
      setSelectedNews(null)
      setEditFormData({})
      setImagePreview(null)
      setEditHasPolls(false)
      setEditPolls([])
      setExistingPolls([])
    } catch {
      alert("Greška pri ažuriranju vijesti!")
    }
  }

  return (
    <>
      <Head>
        <title>Upravljanje vijestima | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje vijestima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Upravljanje vijestima</h1>
            <Link href="/admin/news/create" className={styles.createButton}>
              <FaPlus /> Nova vijest
            </Link>
          </div>
        </div>

        <div className={styles.newsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Naslov</div>
            <div className={styles.headerCell}>Kategorija</div>
            <div className={styles.headerCell}>Klub</div>
            <div className={styles.headerCell}>Datum</div>
            <div className={styles.headerCell}>Akcije</div>
          </div>

          {loading ? (
            <p>Učitavanje vijesti...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : news.length === 0 ? (
            <p>Nema vijesti za prikaz.</p>
          ) : (
            news.map((item) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.newsTitle}>{item.title}</div>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.category}>{CATEGORY_LABELS[item.category] || item.category}</span>
                </div>
                <div className={styles.tableCell}>{getClubName(item.club_id)}</div>
                <div className={styles.tableCell}>{item.date_posted ? new Date(item.date_posted).toLocaleDateString() : "-"}</div>
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <Link href={`/vijesti/${item.id}`} className={styles.actionButton}>
                      <FaEye />
                    </Link>
                    <button className={styles.actionButton} onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(item)}
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
                <h3>Uredi vijest</h3>
                <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-title">Naslov vijesti *</label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editFormData.title || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-category">Kategorija *</label>
                    <select
                      id="edit-category"
                      name="category"
                      value={editFormData.category || ""}
                      onChange={handleEditChange}
                      required
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-club">Klub (opcionalno)</label>
                    <select
                      id="edit-club"
                      name="club_id"
                      value={editFormData.club_id || ""}
                      onChange={handleEditChange}
                    >
                      <option value="">Bez kluba</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-image">Slika vijesti</label>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      id="edit-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.imageInput}
                    />
                    <label htmlFor="edit-image" className={styles.imageUploadLabel}>
                      <FaUpload />
                      <span>Promijeni sliku</span>
                    </label>
                    {imagePreview && (
                      <div className={styles.imagePreview}>
                        <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-content">Sadržaj vijesti *</label>
                  <QuillEditor
                    value={editFormData.content || ""}
                    onChange={(value) => setEditFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Unesite pun sadržaj vijesti"
                  />
                </div>

                {/* Polls Section for Edit */}
                <div className={styles.formGroup}>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="editHasPolls"
                      checked={editHasPolls}
                      onChange={(e) => setEditHasPolls(e.target.checked)}
                    />
                    <label htmlFor="editHasPolls">Dodaj ankete u vijest</label>
                  </div>
                </div>

                {editHasPolls && (
                  <div className={styles.pollsSection}>
                    <h3>Ankete</h3>
                    {editPolls.map((poll, pollIndex) => (
                      <div key={poll.id} className={styles.pollCard}>
                        <div className={styles.pollHeader}>
                          <h4>Anketa {pollIndex + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeEditPoll(poll.id)}
                            className={styles.removeButton}
                          >
                            Ukloni
                          </button>
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label>Pitanje ankete *</label>
                          <input
                            type="text"
                            value={poll.question}
                            onChange={(e) => updateEditPoll(poll.id, 'question', e.target.value)}
                            placeholder="Unesite pitanje ankete"
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Tip ankete</label>
                          <select
                            value={poll.poll_type}
                            onChange={(e) => updateEditPoll(poll.id, 'poll_type', e.target.value)}
                          >
                            <option value="choice">Izbor između opcija</option>
                            <option value="rating">Ocjena 1-5</option>
                          </select>
                        </div>

                        {poll.poll_type === "choice" && (
                          <div className={styles.formGroup}>
                            <label>Opcije za izbor *</label>
                            {poll.options.map((option, optionIndex) => (
                              <div key={optionIndex} className={styles.optionRow}>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateEditPollOption(poll.id, optionIndex, e.target.value)}
                                  placeholder={`Opcija ${optionIndex + 1}`}
                                  required
                                />
                                {poll.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEditPollOption(poll.id, optionIndex)}
                                    className={styles.removeOptionButton}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addEditPollOption(poll.id)}
                              className={styles.addOptionButton}
                            >
                              + Dodaj opciju
                            </button>
                          </div>
                        )}

                        {poll.poll_type === "rating" && (
                          <div className={styles.ratingInfo}>
                            <p>Anketa za ocjenu će automatski imati opcije 1, 2, 3, 4, 5</p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addEditPoll}
                      className={styles.addPollButton}
                    >
                      + Dodaj anketu
                    </button>
                  </div>
                )}
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
                <p>Da li ste sigurni da želite obrisati vijest "{selectedNews?.title}"?</p>
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
