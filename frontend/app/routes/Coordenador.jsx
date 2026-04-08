import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const stats = [
  {
    highlight: true,
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
    number: 12,
    label: "Salas ativas",
  },
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    number: 37,
    label: "Reservas hoje",
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
    number: 28,
    label: "Professores",
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    number: 3,
    label: "Pendentes",
  },
];

const menuActions = [
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
    title: "Gerenciar Salas",
    desc: "Adicionar, editar ou desativar salas",
    modal: true,
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
    title: "Professores",
    desc: "Cadastrar e gerenciar acesso",
  },
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    title: "Todas as Reservas",
    desc: "Visualize e aprove reservas",
  },
  {
    icon: <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    title: "Relatórios",
    desc: "Uso de salas e estatísticas",
  },
];

const reservas = [
  {
    dot: "dot-green",
    sala: "Sala 102 – Lab. Informática",
    prof: "Prof. Carla Mendes",
    horario: "08:00–10:00",
    status: "Confirmada",
    statusClass: "status-ok",
  },
  {
    dot: "dot-yellow",
    sala: "Sala 205 – Auditório",
    prof: "Prof. Ricardo Alves",
    horario: "10:30–12:00",
    status: "Pendente",
    statusClass: "status-pend",
  },
  {
    dot: "dot-red",
    sala: "Sala 301 – Multimídia",
    prof: "Prof. Ana Beatriz",
    horario: "14:00–16:00",
    status: "Cancelada",
    statusClass: "status-cancel",
  },
];

const modalOptions = [
  {
    icon: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
    label: "Adicionar nova sala",
  },
  {
    icon: <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5l3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    label: "Editar sala existente",
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
    label: "Desativar sala",
  },
];

export default function Coordenador() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Navbar activePage="Área do Coordenador" />

      <PageHero
        variant="coordenador"
        tag="Painel Administrativo"
        title="Área do Coordenador"
        description="Gerencie salas, professores e reservas."
      />

      {/* Estatísticas */}
      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.highlight ? "highlight" : ""}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerta */}
      <div className="alert-card">
        <div className="alert-icon">
          <svg viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="alert-text">
          <h4>3 reservas aguardando aprovação</h4>
          <p>Professores estão aguardando sua confirmação para hoje.</p>
        </div>
      </div>

      {/* Menu de ações */}
      <div className="section-title">Ações rápidas</div>
      <div className="menu-grid">
        {menuActions.map((action) => (
          <a
            key={action.title}
            className="menu-card"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (action.modal) setModalOpen(true);
            }}
          >
            <div className="menu-icon">{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
          </a>
        ))}
      </div>

      {/* Reservas recentes */}
      <div className="section-title">
        Reservas recentes
        <a className="see-all" href="#">Ver todas</a>
      </div>

      <div className="reservas-list">
        {reservas.map((r) => (
          <div key={r.sala} className="reserva-item">
            <div className={`reserva-dot ${r.dot}`} />
            <div className="reserva-info">
              <div className="reserva-sala">{r.sala}</div>
              <div className="reserva-prof">{r.prof}</div>
            </div>
            <div className="reserva-time">
              {r.horario}
              <div className={`reserva-status ${r.statusClass}`}>{r.status}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="spacer" />
      <Footer />

      {/* Modal Gerenciar Salas */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-handle" />
            <h3>Gerenciar Salas</h3>
            {modalOptions.map((opt) => (
              <div key={opt.label} className="modal-option" onClick={() => setModalOpen(false)}>
                <div className="modal-opt-icon">{opt.icon}</div>
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
