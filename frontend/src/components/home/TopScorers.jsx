"use client"
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
  Button,
} from "@mui/material"
import { Sports } from "@mui/icons-material"
import Link from "next/link"
import styles from "./TopScorers.module.css"

const TopScorers = () => {
  const scorers = [
    {
      id: 1,
      name: "Marko Petković",
      team: "Borac Banjaluka",
      goals: 18,
      matches: 16,
      avatar: "/placeholder.svg?height=40&width=40",
      teamColor: "#dc143c",
    },
    {
      id: 2,
      name: "Nemanja Bilbija",
      team: "Zrinjski Mostar",
      goals: 15,
      matches: 17,
      avatar: "/placeholder.svg?height=40&width=40",
      teamColor: "#8b0000",
    },
    {
      id: 3,
      name: "Almedin Ziljkić",
      team: "Sarajevo",
      goals: 12,
      matches: 18,
      avatar: "/placeholder.svg?height=40&width=40",
      teamColor: "#8b0000",
    },
    {
      id: 4,
      name: "Kenan Pirić",
      team: "Željezničar",
      goals: 11,
      matches: 15,
      avatar: "/placeholder.svg?height=40&width=40",
      teamColor: "#0000ff",
    },
    {
      id: 5,
      name: "Stefan Savić",
      team: "Velež Mostar",
      goals: 9,
      matches: 18,
      avatar: "/placeholder.svg?height=40&width=40",
      teamColor: "#ff0000",
    },
  ]

  return (
    <Card className={styles.scorersCard}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" className={styles.cardTitle}>
          Najbolji Strijelci
        </Typography>

        <List className={styles.scorersList}>
          {scorers.map((scorer, index) => (
            <ListItem key={scorer.id} className={styles.scorerItem}>
              <Box className={styles.positionBadge}>{index + 1}</Box>

              <ListItemAvatar>
                <Avatar src={scorer.avatar} alt={scorer.name} className={styles.playerAvatar}>
                  <Sports />
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Typography variant="body2" className={styles.playerName}>
                    {scorer.name}
                  </Typography>
                }
                secondary={
                  <Box className={styles.playerInfo}>
                    <Typography variant="caption" className={styles.teamName}>
                      {scorer.team}
                    </Typography>
                    <Typography variant="caption" className={styles.matchInfo}>
                      {scorer.matches} utakmica
                    </Typography>
                  </Box>
                }
              />

              <Box className={styles.goalsContainer}>
                <Chip
                  label={scorer.goals}
                  size="small"
                  className={styles.goalsChip}
                  icon={<Sports fontSize="small" />}
                />
              </Box>
            </ListItem>
          ))}
        </List>

        <Box className={styles.cardFooter}>
          <Button component={Link} href="/tabela" size="small" className={styles.viewMoreBtn}>
            Svi strijelci
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TopScorers
