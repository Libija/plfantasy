"use client"
import { Container, Typography, Box, Card, CardContent, Grid, Avatar, Chip, Button } from "@mui/material"
import { Stadium, EmojiEvents, Group, LocationOn } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function ClubsPage() {
  const clubs = [
    {
      id: 1,
      name: "FK Borac Banjaluka",
      shortName: "Borac",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Gradski stadion",
      capacity: 9730,
      founded: 1926,
      city: "Banjaluka",
      position: 1,
      points: 45,
      titles: 1,
      colors: ["#dc143c", "#ffffff"],
      description: "Najstariji klub u Republici Srpskoj, osnovan 1926. godine.",
    },
    {
      id: 2,
      name: "HŠK Zrinjski Mostar",
      shortName: "Zrinjski",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion pod Bijelim Brijegom",
      capacity: 9000,
      founded: 1905,
      city: "Mostar",
      position: 2,
      points: 41,
      titles: 5,
      colors: ["#8b0000", "#ffffff"],
      description: "Najstariji klub u BiH, osnovan 1905. godine u Mostaru.",
    },
    {
      id: 3,
      name: "FK Sarajevo",
      shortName: "Sarajevo",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Grbavica",
      capacity: 13146,
      founded: 1946,
      city: "Sarajevo",
      position: 3,
      points: 37,
      titles: 6,
      colors: ["#8b0000", "#ffffff"],
      description: "Najuspješniji klub u historiji bosanskohercegovačkog fudbala.",
    },
    {
      id: 4,
      name: "FK Željezničar Sarajevo",
      shortName: "Željezničar",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Grbavica",
      capacity: 13146,
      founded: 1921,
      city: "Sarajevo",
      position: 4,
      points: 32,
      titles: 1,
      colors: ["#0000ff", "#ffffff"],
      description: "Plavi iz Sarajeva, osnovan 1921. godine.",
    },
    {
      id: 5,
      name: "FK Velež Mostar",
      shortName: "Velež",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Rođeni",
      capacity: 7000,
      founded: 1922,
      city: "Mostar",
      position: 5,
      points: 27,
      titles: 1,
      colors: ["#ff0000", "#ffffff"],
      description: "Crveni iz Mostara sa bogatom tradicijom.",
    },
    {
      id: 6,
      name: "NK Široki Brijeg",
      shortName: "Široki Brijeg",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Pecara",
      capacity: 8000,
      founded: 1948,
      city: "Široki Brijeg",
      position: 6,
      points: 25,
      titles: 0,
      colors: ["#ffffff", "#0000ff"],
      description: "Klub iz Širokog Brijega osnovan 1948. godine.",
    },
    {
      id: 7,
      name: "FK Tuzla City",
      shortName: "Tuzla City",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Tušanj",
      capacity: 8500,
      founded: 1955,
      city: "Tuzla",
      position: 7,
      points: 23,
      titles: 0,
      colors: ["#ffff00", "#0000ff"],
      description: "Mladi klub iz Tuzle sa velikim ambicijama.",
    },
    {
      id: 8,
      name: "FK Sloboda Tuzla",
      shortName: "Sloboda",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Tušanj",
      capacity: 8500,
      founded: 1919,
      city: "Tuzla",
      position: 8,
      points: 19,
      titles: 2,
      colors: ["#0000ff", "#ffffff"],
      description: "Tradicionalni klub iz Tuzle osnovan 1919. godine.",
    },
    {
      id: 9,
      name: "NK Posavina Brčko",
      shortName: "Posavina",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Gradski stadion Brčko",
      capacity: 4000,
      founded: 1947,
      city: "Brčko",
      position: 9,
      points: 15,
      titles: 0,
      colors: ["#008000", "#ffffff"],
      description: "Klub iz Brčko Distrikta osnovan 1947. godine.",
    },
    {
      id: 10,
      name: "FK Radnik Bijeljina",
      shortName: "Radnik",
      logo: "/placeholder.svg?height=80&width=80",
      stadium: "Stadion Radnik",
      capacity: 5000,
      founded: 1945,
      city: "Bijeljina",
      position: 10,
      points: 10,
      titles: 0,
      colors: ["#ff0000", "#ffffff"],
      description: "Klub iz Bijeljine sa dugom tradicijom.",
    },
  ]

  const getPositionColor = (position: number) => {
    if (position <= 2) return "success"
    if (position <= 4) return "warning"
    if (position >= 9) return "error"
    return "default"
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h3" className={styles.pageTitle}>
          Klubovi Premier Lige BiH
        </Typography>
        <Typography variant="h6" className={styles.pageSubtitle}>
          Svih 10 klubova koji se takmiče u Premier Ligi
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {clubs.map((club) => (
          <Grid item xs={12} sm={6} lg={4} key={club.id}>
            <Card className={`${styles.clubCard} card-hover`}>
              <CardContent className={styles.cardContent}>
                <Box className={styles.clubHeader}>
                  <Avatar src={club.logo} alt={club.name} className={styles.clubLogo}>
                    <Stadium />
                  </Avatar>
                  <Box className={styles.clubInfo}>
                    <Typography variant="h6" className={styles.clubName}>
                      {club.shortName}
                    </Typography>
                    <Typography variant="body2" className={styles.clubFullName}>
                      {club.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={`#${club.position}`}
                    color={getPositionColor(club.position) as any}
                    className={styles.positionChip}
                  />
                </Box>

                <Box className={styles.clubStats}>
                  <Box className={styles.statItem}>
                    <LocationOn className={styles.statIcon} />
                    <Typography variant="body2">{club.city}</Typography>
                  </Box>
                  <Box className={styles.statItem}>
                    <Stadium className={styles.statIcon} />
                    <Typography variant="body2">{club.stadium}</Typography>
                  </Box>
                  <Box className={styles.statItem}>
                    <Group className={styles.statIcon} />
                    <Typography variant="body2">{club.capacity.toLocaleString()} mjesta</Typography>
                  </Box>
                  <Box className={styles.statItem}>
                    <EmojiEvents className={styles.statIcon} />
                    <Typography variant="body2">{club.titles} titula</Typography>
                  </Box>
                </Box>

                <Typography variant="body2" className={styles.clubDescription}>
                  {club.description}
                </Typography>

                <Box className={styles.clubColors}>
                  <Typography variant="caption" className={styles.colorsLabel}>
                    Boje:
                  </Typography>
                  <Box className={styles.colorPalette}>
                    {club.colors.map((color, index) => (
                      <Box key={index} className={styles.colorSwatch} style={{ backgroundColor: color }} />
                    ))}
                  </Box>
                </Box>

                <Box className={styles.cardFooter}>
                  <Typography variant="caption" className={styles.foundedYear}>
                    Osnovan {club.founded}
                  </Typography>
                  <Button component={Link} href={`/klubovi/${club.id}`} size="small" className={styles.detailsBtn}>
                    Detalji
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
