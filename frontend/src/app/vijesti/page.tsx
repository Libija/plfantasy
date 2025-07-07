"use client"
import { useState } from "react"
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material"
import { Search } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("sve")
  const [clubFilter, setClubFilter] = useState("sve")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const allNews = [
    {
      id: 1,
      title: "Sarajevo pobijedio Željezničar u derbiju",
      excerpt:
        "Spektakularan derbi na Grbavici završen je pobjedom Sarajeva rezultatom 2:1. Golove za domaće su postigli Almedin Ziljkić i Mirza Mustafić...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Utakmica",
      club: "Sarajevo",
      date: "2024-01-15",
      views: 1250,
      author: "Marko Petrović",
    },
    {
      id: 2,
      title: "Borac Banjaluka doveo novog napadača",
      excerpt:
        "Crveno-plavi su pojačali napad dolaskom iskusnog štrajkera iz Srbije. Transfer je vrijedan 200.000 eura...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Transfer",
      club: "Borac",
      date: "2024-01-14",
      views: 890,
      author: "Ana Nikolić",
    },
    {
      id: 3,
      title: "Zrinjski nastavlja pobjednički niz",
      excerpt: "Mostarci su ostvarili petu uzastopnu pobjedu u ligi pobjedom protiv Tuzla Cityja rezultatom 3:0...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Utakmica",
      club: "Zrinjski",
      date: "2024-01-13",
      views: 675,
      author: "Stefan Jovanović",
    },
    {
      id: 4,
      title: "Analiza: Najbolji igrači prvog dijela sezone",
      excerpt: "Pregled najimpresivnijih performansi u prvom dijelu Premier Lige BiH. Ko su bili ključni igrači...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Analiza",
      club: null,
      date: "2024-01-12",
      views: 1100,
      author: "Miloš Radić",
    },
    {
      id: 5,
      title: "Željezničar mijenja trenera",
      excerpt:
        "Plavi su se odlučili za promjenu na klupi nakon serije loših rezultata. Novi trener stiže iz Crne Gore...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Transfer",
      club: "Željezničar",
      date: "2024-01-11",
      views: 980,
      author: "Marko Petrović",
    },
    {
      id: 6,
      title: "Velež pobijedio Slobodu u Tuzli",
      excerpt: "Mostarci su ostvarili važnu pobjedu na gostovanju rezultatom 2:1. Golove su postigli Savić i Hadžić...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Utakmica",
      club: "Velež",
      date: "2024-01-10",
      views: 540,
      author: "Ana Nikolić",
    },
    {
      id: 7,
      title: "Široki Brijeg doveo dva nova igrača",
      excerpt: "Klub iz Širokog Brijega pojačao se sa dva nova igrača uoči nastavka sezone...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Transfer",
      club: "Široki Brijeg",
      date: "2024-01-09",
      views: 420,
      author: "Stefan Jovanović",
    },
    {
      id: 8,
      title: "Intervju: Marko Petković o golovima i ambicijama",
      excerpt: "Najbolji strijelac lige govori o svojoj formi i ciljevima za ostatak sezone...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Intervju",
      club: "Borac",
      date: "2024-01-08",
      views: 750,
      author: "Miloš Radić",
    },
    {
      id: 9,
      title: "Posavina izborila opstanak u ligi",
      excerpt: "Klub iz Brčkog ostvario je važnu pobjedu koja im osigurava opstanak u Premier Ligi...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Utakmica",
      club: "Posavina",
      date: "2024-01-07",
      views: 380,
      author: "Marko Petrović",
    },
  ]

  const clubs = [
    "Borac",
    "Zrinjski",
    "Sarajevo",
    "Željezničar",
    "Velež",
    "Široki Brijeg",
    "Posavina",
    "Sloboda",
    "Tuzla City",
    "Radnik",
  ]
  const categories = ["Utakmica", "Transfer", "Analiza", "Intervju", "Ostalo"]

  const filteredNews = allNews.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "sve" || article.category === categoryFilter
    const matchesClub = clubFilter === "sve" || article.club === clubFilter

    return matchesSearch && matchesCategory && matchesClub
  })

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Utakmica":
        return "primary"
      case "Transfer":
        return "secondary"
      case "Analiza":
        return "warning"
      case "Intervju":
        return "info"
      default:
        return "default"
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h3" className={styles.pageTitle}>
          Vijesti
        </Typography>
        <Typography variant="h6" className={styles.pageSubtitle}>
          Sve najnovije vijesti iz Premier Lige BiH
        </Typography>
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
              <InputLabel>Kategorija</InputLabel>
              <Select value={categoryFilter} label="Kategorija" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="sve">Sve kategorije</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" className={styles.filterSelect}>
              <InputLabel>Klub</InputLabel>
              <Select value={clubFilter} label="Klub" onChange={(e) => setClubFilter(e.target.value)}>
                <MenuItem value="sve">Svi klubovi</MenuItem>
                {clubs.map((club) => (
                  <MenuItem key={club} value={club}>
                    {club}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Box className={styles.resultsInfo}>
        <Typography variant="body1">Pronađeno {filteredNews.length} vijesti</Typography>
      </Box>

      <Grid container spacing={3} className={styles.newsGrid}>
        {paginatedNews.map((article) => (
          <Grid item xs={12} sm={6} lg={4} key={article.id}>
            <Card className={`${styles.newsCard} card-hover`}>
              <CardMedia component="img" height="200" image={article.image} alt={article.title} />
              <CardContent className={styles.cardContent}>
                <Box className={styles.cardHeader}>
                  <Chip label={article.category} size="small" color={getCategoryColor(article.category) as any} />
                  {article.club && <Chip label={article.club} size="small" variant="outlined" />}
                </Box>

                <Typography variant="h6" className={styles.newsTitle}>
                  {article.title}
                </Typography>

                <Typography variant="body2" className={styles.newsExcerpt}>
                  {article.excerpt}
                </Typography>

                <Box className={styles.cardFooter}>
                  <Box className={styles.newsInfo}>
                    <Typography variant="caption" className={styles.author}>
                      {article.author}
                    </Typography>
                    <Typography variant="caption" className={styles.date}>
                      {new Date(article.date).toLocaleDateString("bs-BA")}
                    </Typography>
                  </Box>

                  <Button component={Link} href={`/vijesti/${article.id}`} size="small" className={styles.readMoreBtn}>
                    Pročitaj
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box className={styles.pagination}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  )
}
