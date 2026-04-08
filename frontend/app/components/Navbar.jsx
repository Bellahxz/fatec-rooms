import { useState } from "react";
import { Link } from "react-router";

const menuLinks = [
  { label: "Início", href: "/" },
  { label: "Reservar Sala", href: "/" },
  { label: "Área do Coordenador", href: "/coordenador" },
  { label: "Contato", href: "/contato" },
];

export default function Navbar({ activePage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      
      {/* botão hambúrguer */}
      <button
        className={`navbar__hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* logo */}
      <Link className="navbar__logo" to="/">
        F<span>R</span>
      </Link>

      {/* ícone perfil */}
      <Link className="navbar__icon" to="/login" aria-label="Perfil">
        <svg viewBox="0 0 24 24" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </Link>

      {/* menu */}
      <div className={`navbar__menu ${menuOpen ? "open" : ""}`}>
        {menuLinks.map(link => (
          <Link
            key={link.label}
            to={link.href}
            className={activePage === link.label ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>

    </nav>
  );
}