"use client"

import BaseHeader from "./BaseHeader"
import { FaSignOutAlt } from "react-icons/fa"
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

export default function LoggedInHeader() {
  const { logout } = useAuth()
  return (
    <BaseHeader navLinks={navLinks}>
      <button onClick={logout} style={{ display: "flex", color: "white", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
        <FaSignOutAlt />
        <span>Odjavi se</span>
      </button>
    </BaseHeader>
  )
}
