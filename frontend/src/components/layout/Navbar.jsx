"use client"
import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Menu as MenuIcon, Sports } from "@mui/icons-material"
import Link from "next/link"
import styles from "./Navbar.module.css"

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const menuItems = [
    { label: "Početna", href: "/" },
    { label: "Vijesti", href: "/vijesti" },
    { label: "Utakmice", href: "/utakmice" },
    { label: "Tabela", href: "/tabela" },
    { label: "Klubovi", href: "/klubovi" },
    { label: "Fantasy", href: "/fantasy" },
  ]

  return (
    <AppBar position="fixed" className={styles.navbar}>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.logo}>
          <Sports sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" className={styles.logoText}>
            PLKutak
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={handleMenu}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} className={styles.mobileMenu}>
              {menuItems.map((item) => (
                <MenuItem key={item.href} onClick={handleClose}>
                  <Link href={item.href} className={styles.menuLink}>
                    {item.label}
                  </Link>
                </MenuItem>
              ))}
              <MenuItem onClick={handleClose}>
                <Link href="/prijava" className={styles.menuLink}>
                  Prijava
                </Link>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box className={styles.navItems}>
            {menuItems.map((item) => (
              <Button key={item.href} color="inherit" component={Link} href={item.href} className={styles.navButton}>
                {item.label}
              </Button>
            ))}
            <Button variant="outlined" color="inherit" component={Link} href="/prijava" className={styles.loginButton}>
              Prijava
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
