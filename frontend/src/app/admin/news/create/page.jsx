"use client"

import { useState, useEffect, useRef } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaEye, FaUpload } from "react-icons/fa"
import styles from "../../../../styles/AdminNewsForm.module.css"
import { useRouter } from "next/navigation"

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

export default function CreateNews() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    club_id: "",
    content: "",
    image_url: "",
  })
  const [hasPolls, setHasPolls] = useState(false)
  const [polls, setPolls] = useState([])
  const [error, setError] = useState("")
  const [clubs, setClubs] = useState([])
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = [
    { value: "transfer", label: "Transferi" },
    { value: "injury", label: "Povrede" },
    { value: "preview", label: "Najave" },
    { value: "result", label: "Rezultati" },
    { value: "general", label: "Ostalo" },
  ]

  useEffect(() => {
    const fetchClubs = async () => {
      setLoadingClubs(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setClubs(data)
      } catch {
        setError("Greška pri dohvatu klubova!")
      } finally {
        setLoadingClubs(false)
      }
    }
    fetchClubs()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setFormData((prev) => ({ ...prev, image_url: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addPoll = () => {
    const newPoll = {
      id: Date.now(), // Temporary ID
      question: "",
      poll_type: "choice",
      options: ["", ""]
    }
    setPolls([...polls, newPoll])
  }

  const updatePoll = (pollId, field, value) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, [field]: value }
        : poll
    ))
  }

  const addPollOption = (pollId) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, options: [...poll.options, ""] }
        : poll
    ))
  }

  const updatePollOption = (pollId, optionIndex, value) => {
    setPolls(polls.map(poll => 
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

  const removePollOption = (pollId, optionIndex) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { 
            ...poll, 
            options: poll.options.filter((_, idx) => idx !== optionIndex)
          }
        : poll
    ))
  }

  const removePoll = (pollId) => {
    setPolls(polls.filter(poll => poll.id !== pollId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    try {
      // Prvo kreiraj vijest
      const newsPayload = {
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || null,
        category: formData.category,
        club_id: formData.club_id ? Number(formData.club_id) : null,
        date_posted: new Date().toISOString(),
      }
      
      const newsRes = await fetch(`${apiUrl}/admin/news/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsPayload),
      })
      
      if (!newsRes.ok) throw new Error("Greška pri kreiranju vijesti")
      
      const newsData = await newsRes.json()
      
      // Zatim kreiraj ankete ako postoje
      if (hasPolls && polls.length > 0) {
        for (const poll of polls) {
          if (poll.question.trim()) {
            if (poll.poll_type === "rating") {
              // Rating poll
              const pollPayload = {
                question: poll.question,
                news_id: newsData.id
              }
              
              await fetch(`${apiUrl}/admin/polls/rating`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pollPayload),
              })
            } else {
              // Choice poll
              const pollPayload = {
                question: poll.question,
                news_id: newsData.id,
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
      }
      
      router.push("/admin/news")
    } catch (err) {
      setError("Greška pri kreiranju vijesti!")
    }
  }

  return (
    <>
      <Head>
        <title>Nova vijest | Admin</title>
        <meta name="description" content="Kreiranje nove vijesti" />
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/news" className={styles.backButton}>
            <FaArrowLeft /> Nazad na vijesti
          </Link>
        </div>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Nova vijest</h1>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Naslov vijesti *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Unesite naslov vijesti"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="category">Kategorija *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="club_id">Klub (opcionalno)</label>
                {loadingClubs ? (
                  <div>Učitavanje klubova...</div>
                ) : (
                  <select id="club_id" name="club_id" value={formData.club_id} onChange={handleChange}>
                    <option value="">Bez kluba</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="image">Slika vijesti</label>
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.imageInput}
                />
                <label htmlFor="image" className={styles.imageUploadLabel}>
                  <FaUpload />
                  <span>Odaberite sliku</span>
                </label>
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="content">Sadržaj vijesti *</label>
              <QuillEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Unesite pun sadržaj vijesti"
              />
            </div>

            {/* Polls Section */}
            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="hasPolls"
                  checked={hasPolls}
                  onChange={(e) => setHasPolls(e.target.checked)}
                />
                <label htmlFor="hasPolls">Dodaj ankete u vijest</label>
              </div>
            </div>

            {hasPolls && (
              <div className={styles.pollsSection}>
                <h3>Ankete</h3>
                {polls.map((poll, pollIndex) => (
                  <div key={poll.id} className={styles.pollCard}>
                    <div className={styles.pollHeader}>
                      <h4>Anketa {pollIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePoll(poll.id)}
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
                        onChange={(e) => updatePoll(poll.id, 'question', e.target.value)}
                        placeholder="Unesite pitanje ankete"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tip ankete</label>
                      <select
                        value={poll.poll_type}
                        onChange={(e) => updatePoll(poll.id, 'poll_type', e.target.value)}
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
                              onChange={(e) => updatePollOption(poll.id, optionIndex, e.target.value)}
                              placeholder={`Opcija ${optionIndex + 1}`}
                              required
                            />
                            {poll.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removePollOption(poll.id, optionIndex)}
                                className={styles.removeOptionButton}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPollOption(poll.id)}
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
                  onClick={addPoll}
                  className={styles.addPollButton}
                >
                  + Dodaj anketu
                </button>
              </div>
            )}
            <div className={styles.formGroup}>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Sačuvaj vijest
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
