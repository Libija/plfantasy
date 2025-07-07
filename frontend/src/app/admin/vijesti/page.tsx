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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function AdminNewsPage() {
  const [news, setNews] = useState([
    {
      id: 1,
      title: "Sarajevo pobijedio Željezničar u derbiju",
      category: "Utakmica",
      club: "Sarajevo",
      author: "Marko Petrović",
      status: "Objavljeno",
      date: "2024-01-15",
      views: 1250,
    },
    {
      id: 2,
      title: "Borac Banjaluka doveo novog napadača",
      category: "Transfer",
      club: "Borac",
      author: "Ana Nikolić",
      status: "Objavljeno",
      date: "2024-01-14",
      views: 890,
    },
    {
      id: 3,
      title: "Analiza prvog dijela sezone",
      category: "Analiza",
      club: null,
      author: "Stefan Jovanović",
      status: "Draft",
      date: "2024-01-13",
      views: 0,
    },
    {
      id: 4,
      title: "Zrinjski sprema pojačanja",
      category: "Transfer",
      club: "Zrinjski",
      author: "Miloš Radić",
      status: "Na čekanju",
      date: "2024-01-12",
      views: 0,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("sve")
  const [deleteDialog, setDeleteDialog] = useState({ open: false, newsId: null })

  const handleDelete = (id: number) => {
    setNews(news.filter((item) => item.id !== id))
    setDeleteDialog({ open: false, newsId: null })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Objavljeno":
        return "success"
      case "Draft":
        return "default"
      case "Na čekanju":
        return "warning"
      default:
        return "default"
    }
  }

  const filteredNews = news.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "sve" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.pageTitle}>
          Upravljanje Vijestima
        </Typography>
        <Button
          component={Link}
          href="/admin/vijesti/nova"
          variant="contained"
          startIcon={<Add />}
          className={styles.addBtn}
        >
          Nova Vijest
        </Button>
      </Box>

      <Card className={styles.filtersCard}>
        <CardContent>
          <Box className={styles.filters}>
            <TextField
              placeholder="Pretraži vijesti..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search className={styles.searchIcon} />,
              }}
              className={styles.searchField}
            />
            <FormControl size="small" className={styles.filterSelect}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="sve">Svi statusi</MenuItem>
                <MenuItem value="Objavljeno">Objavljeno</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Na čekanju">Na čekanju</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card className={styles.tableCard}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.headerCell}>Naslov</TableCell>
                  <TableCell className={styles.headerCell}>Kategorija</TableCell>
                  <TableCell className={styles.headerCell}>Klub</TableCell>
                  <TableCell className={styles.headerCell}>Autor</TableCell>
                  <TableCell className={styles.headerCell}>Status</TableCell>
                  <TableCell className={styles.headerCell}>Datum</TableCell>
                  <TableCell className={styles.headerCell}>Pregledi</TableCell>
                  <TableCell className={styles.headerCell}>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNews.map((item) => (
                  <TableRow key={item.id} className={styles.tableRow}>
                    <TableCell className={styles.titleCell}>
                      <Typography variant="body2" className={styles.newsTitle}>
                        {item.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      {item.club ? (
                        <Chip label={item.club} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="caption" className={styles.noClub}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.author}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.status} size="small" color={getStatusColor(item.status) as any} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(item.date).toLocaleDateString("bs-BA")}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.views}>
                        {item.views.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className={styles.actions}>
                        <IconButton size="small" className={styles.viewBtn}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" className={styles.editBtn}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          className={styles.deleteBtn}
                          onClick={() => setDeleteDialog({ open: true, newsId: item.id })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, newsId: null })}>
        <DialogTitle>Potvrdi Brisanje</DialogTitle>
        <DialogContent>
          <Typography>Da li ste sigurni da želite obrisati ovu vijest? Ova akcija se ne može poništiti.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, newsId: null })}>Otkaži</Button>
          <Button onClick={() => handleDelete(deleteDialog.newsId!)} color="error" variant="contained">
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
