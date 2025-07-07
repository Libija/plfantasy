"use client"
import { useState } from "react"
import type React from "react"

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from "@mui/material"
import { Save, ArrowBack, Publish } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function NewNewsPage() {
  const [article, setArticle] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    club: "",
    tags: [],
    status: "draft",
    featuredImage: "",
  })

  const [newTag, setNewTag] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  const categories = ["Utakmica", "Transfer", "Analiza", "Intervju", "Ostalo"]
  const clubs = ["Borac", "Zrinjski", "Sarajevo", "Željezničar", "Velež", "Široki Brijeg", "Tuzla City", "Sloboda"]

  const handleAddTag = () => {
    if (newTag && !article.tags.includes(newTag)) {
      setArticle({ ...article, tags: [...article.tags, newTag] })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setArticle({ ...article, tags: article.tags.filter((tag) => tag !== tagToRemove) })
  }

  const handleSave = (status: string) => {
    const updatedArticle = { ...article, status }
    console.log("Saving article:", updatedArticle)
    // Logic to save article
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        setArticle({ ...article, featuredImage: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Button component={Link} href="/admin/vijesti" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na vijesti
        </Button>
        <Typography variant="h4" className={styles.pageTitle}>
          Nova Vijest
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card className={styles.contentCard}>
            <CardContent>
              <Box className={styles.formFields}>
                <TextField
                  label="Naslov vijesti"
                  fullWidth
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  className={styles.titleField}
                />

                <TextField
                  label="Kratki opis"
                  fullWidth
                  multiline
                  rows={3}
                  value={article.excerpt}
                  onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                />

                <TextField
                  label="Sadržaj vijesti"
                  fullWidth
                  multiline
                  rows={15}
                  value={article.content}
                  onChange={(e) => setArticle({ ...article, content: e.target.value })}
                  placeholder="Unesite sadržaj vijesti..."
                />

                <Box className={styles.imageUploadSection}>
                  <Typography variant="body2" className={styles.uploadLabel}>
                    Glavna slika
                  </Typography>
                  <Box className={styles.imageUpload}>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outlined" component="span" className={styles.uploadBtn}>
                        Izaberi Sliku
                      </Button>
                    </label>
                    {imagePreview && (
                      <Box className={styles.imagePreview}>
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Image preview"
                          className={styles.previewImage}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card className={styles.metaCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Metadata
              </Typography>

              <Box className={styles.metaFields}>
                <FormControl fullWidth>
                  <InputLabel>Kategorija</InputLabel>
                  <Select
                    value={article.category}
                    label="Kategorija"
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Klub (opcionalno)</InputLabel>
                  <Select
                    value={article.club}
                    label="Klub"
                    onChange={(e) => setArticle({ ...article, club: e.target.value })}
                  >
                    <MenuItem value="">Bez kluba</MenuItem>
                    {clubs.map((club) => (
                      <MenuItem key={club} value={club}>
                        {club}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box className={styles.tagsSection}>
                  <Typography variant="body2" className={styles.tagsLabel}>
                    Tagovi
                  </Typography>
                  <Box className={styles.tagsInput}>
                    <TextField
                      size="small"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Dodaj tag"
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} size="small">
                      Dodaj
                    </Button>
                  </Box>
                  <Box className={styles.tagsList}>
                    {article.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                        className={styles.tag}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card className={styles.actionsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Akcije
              </Typography>
              <Box className={styles.actionButtons}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Save />}
                  onClick={() => handleSave("draft")}
                  className={styles.actionBtn}
                >
                  Sačuvaj kao Draft
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Publish />}
                  onClick={() => handleSave("published")}
                  className={styles.actionBtn}
                  disabled={!article.title || !article.content || !article.category}
                >
                  Objavi Vijest
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
