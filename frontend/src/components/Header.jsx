"use client"
import BaseHeader from "./BaseHeader"
import Link from "next/link"
import { FaUser, FaSignOutAlt } from "react-icons/fa"
import useAuth from "../hooks/use-auth"
import FantasyNavLink from "./FantasyNavLink"

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/vijesti", label: "Vijesti" },
  { href: "/utakmice", label: "Utakmice" },
  { href: "/tabela", label: "Tabela" },
  { href: "/klubovi", label: "Klubovi" },
  { href: "/fantasy", label: "Fantasy", component: <FantasyNavLink>Fantasy</FantasyNavLink> },
]

export default function Header() {
  const { isLoggedIn, logout } = useAuth()

  return (
    <BaseHeader navLinks={navLinks}>
      {isLoggedIn ? (
        <button onClick={logout} style={{ display: "flex", color: "white", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
          <FaSignOutAlt />
          <span>Odjavi se</span>
        </button>
      ) : (
        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <FaUser />
          <span>Prijava</span>
        </Link>
      )}
    </BaseHeader>
  )
}
