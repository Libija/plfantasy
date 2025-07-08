"use client"

import BaseHeader from "./BaseHeader"
import Link from "next/link"
import { FaUser, FaSignOutAlt } from "react-icons/fa"
import useAuth from "../hooks/use-auth"

export default function AdminHeader() {
  const { logout } = useAuth()

  // Navigacija kao kod usera, ali 'F' umjesto 'Fantasy'
  const extraNav = (
    <li style={{ listStyle: "none" }}>
      <Link href="/admin/f">F</Link>
    </li>
  )

  return (
    <BaseHeader extraNav={extraNav}>
      <button onClick={logout} style={{ display: "flex",color:"white", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
        <FaSignOutAlt />
        <span>Odjavi se</span>
      </button>
    </BaseHeader>
  )
}
