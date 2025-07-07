"use client"
import { useState } from "react"
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material"
import { Add, Edit, Delete, ArrowBack } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function ClubPlayersPage() {
  const params = useParams()
  const clubId = params.id

  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "Marko Petković",
      position: "Napadač",
      age: 26,
      nationality: "SRB",
      number: 9,
      fantasyPrice: 9.5,
      goals: 18,
      assists: 3,
      yellowCards: 2,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Stojan Vranješ",
      position: "Vezni",
      age: 29,
      nationality: "SRB",
      number: 10,
      fantasyPrice: 8.2,
      goals: 4,
      assists: 12,
      yellowCards: 3,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Siniša Saničanin",
      position: "Odbrana",
      age: 32,
      nationality: "SRB",
      number: 4,
      fantasyPrice: 5.8,
      goals: 2,
      assists: 1,
      yellowCards: 5,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const [editDialog, setEditDialog] = useState({ open: false, player: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, playerId: null })

  const positions = ["Golman", "Odbrana", "Vezni", "Napadač"]
  const nationalities = ["BiH", "SRB", "CRO", "MNE", "SLO", "MKD", "ALB"]

  const handleEdit = (player: any) => {
    setEditDialog({ open: true, player: { ...player } })
  }

  const handleSave = () => {
    if (editDialog.player.id) {
      setPlayers(players.map((player) => (player.id === editDialog.player.id ? editDialog.player : player)))
    } else {
      const newPlayer = { ...editDialog.player, id: Date.now(), goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
      setPlayers([...players, newPlayer])
    }
    setEditDialog({ open: false, player: null })
  }

  const handleDelete = (id: number) => {
    setPlayers(players.filter((player) => player.id !== id))
    setDeleteDialog({ open: false, playerId: null })
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Golman":
        return "#ff9800"
      case "Odbrana":
        return "#4caf50"
      case "Vezni":
        return "#2196f3"
      case "Napadač":
        return "#f44336"
      default:
        return "#757575"
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Box className={styles.titleSection}>
          <Button component={Link} href="/admin/klubovi" startIcon={<ArrowBack />} className={styles.backBtn}>
            Nazad na klubove
          </Button>
          <Typography variant="h4" className={styles.pageTitle}>
            Igrači - Borac Banjaluka
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setEditDialog({ open: true, player: {} })}
          className={styles.addBtn}
        >
          Novi Igrač
        </Button>
      </Box>

      <Card className={styles.tableCard}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>#</TableCell>
                  <TableCell className={styles.headerCell}>Igrač</TableCell>
                  <TableCell className={styles.headerCell}>Pozicija</TableCell>
                  <TableCell className={styles.headerCell}>Godine</TableCell>
                  <TableCell className={styles.headerCell}>Nac.</TableCell>
                  <TableCell className={styles.headerCell}>Fantasy €</TableCell>
                  <TableCell className={styles.headerCell}>G</TableCell>
                  <TableCell className={styles.headerCell}>A</TableCell>
                  <TableCell className={styles.headerCell}>ŽK</TableCell>
                  <TableCell className={styles.headerCell}>CK</TableCell>
                  <TableCell className={styles.headerCell}>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className={styles.tableRow}>
                    <TableCell className={styles.numberCell}>{player.number}</TableCell>
                    <TableCell>
                      <Box className={styles.playerInfo}>
                        <Avatar src={player.avatar} alt={player.name} className={styles.playerAvatar} />
                        <Typography variant="body2" className={styles.playerName}>
                          {player.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={player.position}
                        size="small"
                        style={{
                          backgroundColor: getPositionColor(player.position),
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{player.age}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{player.nationality}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.fantasyPrice}>
                        €{player.fantasyPrice}m
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.goals}>
                        {player.goals}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.assists}>
                        {player.assists}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.yellowCards}>
                        {player.yellowCards}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.redCards}>
                        {player.redCards}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className={styles.actions}>
                        <IconButton size="small" onClick={() => handleEdit(player)} className={styles.editBtn}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, playerId: player.id })}
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
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, player: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editDialog.player?.id ? "Uredi Igrača" : "Novi Igrač"}</DialogTitle>
        <DialogContent>
          <Box className={styles.formFields}>
            <TextField
              label="Ime i prezime"
              fullWidth
              value={editDialog.player?.name || ""}
              onChange={(e) => setEditDialog({ ...editDialog, player: { ...editDialog.player, name: e.target.value } })}
            />
            <Box className={styles.formRow}>
              <TextField
                label="Broj dresa"
                type="number"
                value={editDialog.player?.number || ""}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    player: { ...editDialog.player, number: Number.parseInt(e.target.value) },
                  })
                }
              />
              <TextField
                label="Godine"
                type="number"
                value={editDialog.player?.age || ""}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    player: { ...editDialog.player, age: Number.parseInt(e.target.value) },
                  })
                }
              />
            </Box>
            <Box className={styles.formRow}>
              <FormControl fullWidth>
                <InputLabel>Pozicija</InputLabel>
                <Select
                  value={editDialog.player?.position || ""}
                  label="Pozicija"
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, player: { ...editDialog.player, position: e.target.value } })
                  }
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Nacionalnost</InputLabel>
                <Select
                  value={editDialog.player?.nationality || ""}
                  label="Nacionalnost"
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, player: { ...editDialog.player, nationality: e.target.value } })
                  }
                >
                  {nationalities.map((nat) => (
                    <MenuItem key={nat} value={nat}>
                      {nat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Fantasy cijena (€m)"
              type="number"
              step="0.1"
              fullWidth
              value={editDialog.player?.fantasyPrice || ""}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  player: { ...editDialog.player, fantasyPrice: Number.parseFloat(e.target.value) },
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, player: null })}>Otkaži</Button>
          <Button onClick={handleSave} variant="contained">
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, playerId: null })}>
        <DialogTitle>Potvrdi Brisanje</DialogTitle>
        <DialogContent>
          <Typography>Da li ste sigurni da želite obrisati ovog igrača? Ova akcija se ne može poništiti.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, playerId: null })}>Otkaži</Button>
          <Button onClick={() => handleDelete(deleteDialog.playerId!)} color="error" variant="contained">
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
