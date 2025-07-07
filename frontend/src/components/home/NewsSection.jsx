"use client"
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from "@mui/material"
import { AccessTime, Visibility } from "@mui/icons-material"
import Link from "next/link"
import styles from "./NewsSection.module.css"

const NewsSection = () => {
  const news = [
    {
      id: 1,
      title: "Sarajevo pobijedio Željezničar u derbiju",
      excerpt: "Spektakularan derbi na Grbavici završen je pobjedom Sarajeva rezultatom 2:1...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Utakmica",
      club: "Sarajevo",
      date: "2024-01-15",
      views: 1250,
    },
    {
      id: 2,
      title: "Borac Banjaluka doveo novog napadača",
      excerpt: "Crveno-plavi su pojačali napad dolaskom iskusnog štrajkera...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Transfer",
      club: "Borac",
      date: "2024-01-14",
      views: 890,
    },
    {
      id: 3,
      title: "Zrinjski nastavlja pobjednički niz",
      excerpt: "Mostarci su ostvarili petu uzastopnu pobjedu u ligi...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Utakmica",
      club: "Zrinjski",
      date: "2024-01-13",
      views: 675,
    },
    {
      id: 4,
      title: "Analiza: Najbolji igrači prvog dijela sezone",
      excerpt: "Pregled najimpresivnijih performansi u prvom dijelu Premier Lige BiH...",
      image: "/placeholder.svg?height=200&width=300",
      category: "Analiza",
      club: null,
      date: "2024-01-12",
      views: 1100,
    },
  ]

  const getCategoryColor = (category) => {
    switch (category) {
      case "Utakmica":
        return "primary"
      case "Transfer":
        return "secondary"
      case "Analiza":
        return "warning"
      default:
        return "default"
    }
  }

  return (
    <Box className={styles.newsSection}>
      <Typography variant="h4" className={styles.sectionTitle}>
        Najnovije Vijesti
      </Typography>

      <Box className={styles.newsGrid}>
        {news.map((article, index) => (
          <Card key={article.id} className={`${styles.newsCard} ${index === 0 ? styles.featuredCard : ""} card-hover`}>
            <CardMedia
              component="img"
              height={index === 0 ? "250" : "180"}
              image={article.image}
              alt={article.title}
              className={styles.newsImage}
            />
            <CardContent className={styles.newsContent}>
              <Box className={styles.newsHeader}>
                <Chip
                  label={article.category}
                  size="small"
                  color={getCategoryColor(article.category)}
                  className={styles.categoryChip}
                />
                {article.club && (
                  <Chip label={article.club} size="small" variant="outlined" className={styles.clubChip} />
                )}
              </Box>

              <Typography variant={index === 0 ? "h5" : "h6"} className={styles.newsTitle}>
                {article.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" className={styles.newsExcerpt}>
                {article.excerpt}
              </Typography>

              <Box className={styles.newsFooter}>
                <Box className={styles.newsStats}>
                  <Box className={styles.statItem}>
                    <AccessTime fontSize="small" />
                    <Typography variant="caption">{new Date(article.date).toLocaleDateString("bs-BA")}</Typography>
                  </Box>
                  <Box className={styles.statItem}>
                    <Visibility fontSize="small" />
                    <Typography variant="caption">{article.views}</Typography>
                  </Box>
                </Box>

                <Button component={Link} href={`/vijesti/${article.id}`} size="small" className={styles.readMoreBtn}>
                  Pročitaj više
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box className={styles.viewAllNews}>
        <Button component={Link} href="/vijesti" variant="contained" size="large" className={styles.viewAllBtn}>
          Sve Vijesti
        </Button>
      </Box>
    </Box>
  )
}

export default NewsSection
