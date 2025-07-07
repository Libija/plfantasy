"use client"
import { useState } from "react"
import type React from "react"

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
} from "@mui/material"
import { Add, Edit, Delete, Group } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState([
    {
      id: 1,
      name: "FK Borac Banjaluka",
      shortName: "Borac",
      city: "Banjaluka",
      stadium: "Gradski stadion",
      capacity: 9730,
      founded: 1926,
      logo: "/placeholder.svg?height=40&width=40",
      players: 25,
    },
    {
      id: 2,
      name: "HŠK Zrinjski Mostar",
      shortName: "Zrinjski",
      city: "Mostar",
      stadium: "Stadion pod Bijelim Brijegom",
      capacity: 9000,
      founded: 1905,
      logo: "/placeholder.svg?height=40&width=40",
      players: 23,
    },
    {
      id: 3,
      name: "FK Sarajevo",
      shortName: "Sarajevo",
      city: "Sarajevo",
      stadium: "Stadion Grbavica",
      capacity: 13146,
      founded: 1946,
      logo: "/placeholder.svg?height=40&width=40",
      players: 24,
    },
  ])

  const [deleteDialog, setDeleteDialog] = useState({ open: false, clubId: null })
  const [editDialog, setEditDialog] = useState({ open: false, club: null })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")

  const handleDelete = (id: number) => {
    setClubs(clubs.filter((club) => club.id !== id))
    setDeleteDialog({ open: false, clubId: null })
  }

  const handleEdit = (club: any) => {
    setEditDialog({ open: true, club: { ...club } })
  }

  const handleSave = () => {
    if (editDialog.club.id) {
      setClubs(clubs.map((club) => (club.id === editDialog.club.id ? editDialog.club : club)))
    } else {
      const newClub = { ...editDialog.club, id: Date.now(), players: 0 }
      setClubs([...clubs, newClub])
    }
    setEditDialog({ open: false, club: null })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.pageTitle}>
          Upravljanje Klubovima
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setEditDialog({ open: true, club: {} })}
          className={styles.addBtn}
        >
          Novi Klub
        </Button>
      </Box>

      <Card className={styles.tableCard}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>Logo</TableCell>
                  <TableCell className={styles.headerCell}>Naziv</TableCell>
                  <TableCell className={styles.headerCell}>Kratko</TableCell>
                  <TableCell className={styles.headerCell}>Grad</TableCell>
                  <TableCell className={styles.headerCell}>Stadion</TableCell>
                  <TableCell className={styles.headerCell}>Kapacitet</TableCell>
                  <TableCell className={styles.headerCell}>Osnovan</TableCell>
                  <TableCell className={styles.headerCell}>Igrači</TableCell>
                  <TableCell className={styles.headerCell}>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clubs.map((club) => (
                  <TableRow key={club.id} className={styles.tableRow}>
                    <TableCell>
                      <Avatar src={club.logo} alt={club.name} className={styles.clubLogo} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.clubName}>
                        {club.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{club.shortName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{club.city}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{club.stadium}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{club.capacity?.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{club.founded}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        href={`/admin/klubovi/${club.id}/igraci`}
                        size="small"
                        startIcon={<Group />}
                        className={styles.playersBtn}
                      >
                        {club.players}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box className={styles.actions}>
                        <IconButton size="small" onClick={() => handleEdit(club)} className={styles.editBtn}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, clubId: club.id })}
                          className={styles.deleteBtn}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, club: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{editDialog.club?.id ? "Uredi Klub" : "Novi Klub"}</DialogTitle>
        <DialogContent>
          <Box className={styles.formFields}>
            <TextField
              label="Puni naziv"
              fullWidth
              value={editDialog.club?.name || ""}
              onChange={(e) => setEditDialog({ ...editDialog, club: { ...editDialog.club, name: e.target.value } })}
            />
            <TextField
              label="Kratko ime"
              fullWidth
              value={editDialog.club?.shortName || ""}
              onChange={(e) =>
                setEditDialog({ ...editDialog, club: { ...editDialog.club, shortName: e.target.value } })
              }
            />
            <TextField
              label="Grad"
              fullWidth
              value={editDialog.club?.city || ""}
              onChange={(e) => setEditDialog({ ...editDialog, club: { ...editDialog.club, city: e.target.value } })}
            />
            <TextField
              label="Stadion"
              fullWidth
              value={editDialog.club?.stadium || ""}
              onChange={(e) => setEditDialog({ ...editDialog, club: { ...editDialog.club, stadium: e.target.value } })}
            />
            <TextField
              label="Kapacitet"
              type="number"
              fullWidth
              value={editDialog.club?.capacity || ""}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  club: { ...editDialog.club, capacity: Number.parseInt(e.target.value) },
                })
              }
            />
            <TextField
              label="Godina osnivanja"
              type="number"
              fullWidth
              value={editDialog.club?.founded || ""}
              onChange={(e) =>
                setEditDialog({ ...editDialog, club: { ...editDialog.club, founded: Number.parseInt(e.target.value) } })
              }
            />
          </Box>
          <Box className={styles.logoUploadSection}>
            <Typography variant="body2" className={styles.uploadLabel}>
              Logo kluba
            </Typography>
            <Box className={styles.logoUpload}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="logo-upload"
                type="file"
                onChange={handleLogoUpload}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span" className={styles.uploadBtn}>
                  Izaberi Logo
                </Button>
              </label>
              {logoPreview && (
                <Box className={styles.logoPreview}>
                  <img src={logoPreview || "/placeholder.svg"} alt="Logo preview" className={styles.previewImage} />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, club: null })}>Otkaži</Button>
          <Button onClick={handleSave} variant="contained">
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, clubId: null })}>
        <DialogTitle>Potvrdi Brisanje</DialogTitle>
        <DialogContent>
          <Typography>Da li ste sigurni da želite obrisati ovaj klub? Ova akcija se ne može poništiti.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, clubId: null })}>Otkaži</Button>
          <Button onClick={() => handleDelete(deleteDialog.clubId!)} color="error" variant="contained">
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
