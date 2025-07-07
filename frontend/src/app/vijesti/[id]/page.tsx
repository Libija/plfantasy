"use client"
import { Container, Typography, Box, Card, CardContent, CardMedia, Chip, Avatar, Divider, Button } from "@mui/material"
import { AccessTime, Visibility, Person, ArrowBack, Share } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function NewsDetailPage() {
  const params = useParams()
  const id = params.id

  // Mock data - u stvarnosti bi se dohvatilo iz API-ja
  const article = {
    id: 1,
    title: "Sarajevo pobijedio Željezničar u derbiju",
    content: `
      <p>Spektakularan derbi na Grbavici završen je pobjedom Sarajeva rezultatom 2:1 pred 15.000 gledalaca. Ova pobjeda donosi Sarajevu važne bodove u borbi za vrh tabele.</p>
      
      <p>Utakmica je počela burno, a već u 12. minuti Almedin Ziljkić je doveo domaće u vodstvo prekrasnim golom iz slobodnog udarca. Željezničar je odgovorio u 34. minuti kada je Kenan Pirić izjednačio rezultat.</p>
      
      <p>Drugi poluvrijeme donijelo je još više uzbuđenja. Sarajevo je povelo u 67. minuti golom Mirze Mustafića koji je iskoristio grešku odbrane gostiju. Željezničar je pokušao izjednačiti, ali odlična odbrana Sarajeva uspjela je sačuvati prednost.</p>
      
      <p>"Odigrali smo odličnu utakmicu protiv kvalitetnog protivnika. Igrači su pokazali karakter i borbenost", rekao je trener Sarajeva nakon utakmice.</p>
      
      <p>Ova pobjeda stavlja Sarajevo na treće mjesto tabele sa 37 bodova, dok Željezničar ostaje četvrti sa 32 boda.</p>
    `,
    image: "/placeholder.svg?height=400&width=800",
    category: "Utakmica",
    club: "Sarajevo",
    date: "2024-01-15",
    views: 1250,
    author: "Marko Petrović",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    tags: ["derbi", "Sarajevo", "Željezničar", "Premier Liga"],
  }

  const relatedNews = [
    {
      id: 2,
      title: "Borac Banjaluka doveo novog napadača",
      image: "/placeholder.svg?height=100&width=150",
      date: "2024-01-14",
    },
    {
      id: 3,
      title: "Zrinjski nastavlja pobjednički niz",
      image: "/placeholder.svg?height=100&width=150",
      date: "2024-01-13",
    },
    {
      id: 4,
      title: "Analiza: Najbolji igrači prvog dijela sezone",
      image: "/placeholder.svg?height=100&width=150",
      date: "2024-01-12",
    },
  ]

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.backButton}>
        <Button component={Link} href="/vijesti" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na vijesti
        </Button>
      </Box>

      <Card className={styles.articleCard}>
        <CardMedia
          component="img"
          height="400"
          image={article.image}
          alt={article.title}
          className={styles.articleImage}
        />

        <CardContent className={styles.articleContent}>
          <Box className={styles.articleHeader}>
            <Box className={styles.tags}>
              <Chip label={article.category} color="primary" className={styles.categoryChip} />
              {article.club && <Chip label={article.club} variant="outlined" className={styles.clubChip} />}
            </Box>

            <Button startIcon={<Share />} size="small" className={styles.shareBtn}>
              Podijeli
            </Button>
          </Box>

          <Typography variant="h3" className={styles.articleTitle}>
            {article.title}
          </Typography>

          <Box className={styles.articleMeta}>
            <Box className={styles.authorInfo}>
              <Avatar src={article.authorAvatar} alt={article.author} className={styles.authorAvatar}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="body2" className={styles.authorName}>
                  {article.author}
                </Typography>
                <Box className={styles.metaStats}>
                  <Box className={styles.metaItem}>
                    <AccessTime fontSize="small" />
                    <Typography variant="caption">{new Date(article.date).toLocaleDateString("bs-BA")}</Typography>
                  </Box>
                  <Box className={styles.metaItem}>
                    <Visibility fontSize="small" />
                    <Typography variant="caption">{article.views} pregleda</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider className={styles.divider} />

          <Box className={styles.articleBody} dangerouslySetInnerHTML={{ __html: article.content }} />

          <Box className={styles.articleTags}>
            <Typography variant="body2" className={styles.tagsLabel}>
              Tagovi:
            </Typography>
            <Box className={styles.tagsList}>
              {article.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" className={styles.tag} />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box className={styles.relatedNews}>
        <Typography variant="h5" className={styles.relatedTitle}>
          Povezane vijesti
        </Typography>

        <Box className={styles.relatedGrid}>
          {relatedNews.map((news) => (
            <Card key={news.id} className={`${styles.relatedCard} card-hover`}>
              <CardMedia component="img" height="100" image={news.image} alt={news.title} />
              <CardContent className={styles.relatedContent}>
                <Typography variant="body2" className={styles.relatedNewsTitle}>
                  {news.title}
                </Typography>
                <Typography variant="caption" className={styles.relatedDate}>
                  {new Date(news.date).toLocaleDateString("bs-BA")}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  )
}
