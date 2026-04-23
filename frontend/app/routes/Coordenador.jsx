import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const menuActions = [
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
    title: "Gerenciar Salas",
    desc: "Adicionar, editar ou desativar salas",
    to: "/gerenciar-salas",
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
    title: "Professores",
    desc: "Cadastrar e gerenciar acesso",
    to: "/confirmar",
  },
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    title: "Todas as Reservas",
    desc: "Visualize e aprove reservas",
    to: "/todas-reservas",
    
  },
  {
    icon: <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    title: "Relatórios",
    desc: "Uso de salas e estatísticas",
    to: "/relatorios",
  },
];

const statusLabels = {
  APPROVED: "Confirmada",
  PENDING: "Pendente",
  CANCELLED: "Cancelada",
  REJECTED: "Recusada",
};

const statusClasses = {
  APPROVED: "status-ok",
  PENDING: "status-pend",
  CANCELLED: "status-cancel",
  REJECTED: "status-cancel",
};


function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.length > 5 ? timeStr.slice(0, 5) : timeStr;
}

export default function Coordenador() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authlevel = localStorage.getItem('authlevel');
    if (authlevel !== '1') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const today = new Date().toISOString().slice(0, 10);

      try {
        const [roomsResp, usersResp, todayResp, pendingResp, recentResp] = await Promise.all([
          fetch('/api/rooms', { headers }),
          fetch('/api/admin/users', { headers }),
          fetch(`/api/bookings/admin/by-date?date=${today}`, { headers }),
          fetch('/api/bookings/admin/pending', { headers }),
          fetch('/api/bookings/admin/all', { headers }),
        ]);

        if (!roomsResp.ok) throw new Error('Falha ao buscar salas');
        if (!usersResp.ok) throw new Error('Falha ao buscar professores');
        if (!todayResp.ok) throw new Error('Falha ao buscar reservas de hoje');
        if (!pendingResp.ok) throw new Error('Falha ao buscar reservas pendentes');
        if (!recentResp.ok) throw new Error('Falha ao buscar reservas recentes');

        const roomsData = await roomsResp.json();
        const usersData = await usersResp.json();
        const todayData = await todayResp.json();
        const pendingData = await pendingResp.json();
        const recentData = await recentResp.json();

        setRooms(roomsData || []);
        setProfessors((usersData || []).filter((user) => user.authlevel === 2));
        setTodayBookings(todayData || []);
        setPendingBookings(pendingData || []);

        const sortedRecent = (recentData || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentBookings(sortedRecent);
      } catch (err) {
        setError(err.message || 'Erro ao carregar painel do coordenador.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => [
    {
      highlight: true,
      icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
      number: rooms.length,
      label: "Salas ativas",
    },
    {
      icon: <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
      number: todayBookings.length,
      label: "Reservas hoje",
    },
    {
      icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
      number: professors.length,
      label: "Professores",
    },
    {
      icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      number: pendingBookings.length,
      label: "Pendentes",
    },
  ], [rooms.length, todayBookings.length, professors.length, pendingBookings.length]);

  if (loading) {
    return (
      <>
        <Navbar activePage="Área do Coordenador" />
        <div className="content">Carregando painel do coordenador...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar activePage="Área do Coordenador" />
        <div className="content">Erro: {error}</div>
        <Footer />
      </>
    );
  }

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
          <h4>{pendingBookings.length} reservas aguardando aprovação</h4>
          <p>Professores estão aguardando sua confirmação para hoje.</p>
        </div>
      </div>

      {/* Menu de ações */}
      <div className="section-title">Ações rápidas</div>
      <div className="menu-grid">
        {menuActions.map((action) => (
          <Link
            key={action.title}
            className="menu-card"
            to={action.to}
          >
            <div className="menu-icon">{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Reservas recentes */}
      <div className="section-title">
        Reservas recentes
        <Link className="see-all" to="/confirmar">Ver todas</Link>
      </div>

      <div className="reservas-list">
        {recentBookings.length === 0 ? (
          <div className="reserva-item">
            <div className="reserva-info">
              <div className="reserva-sala">Nenhuma reserva recente encontrada.</div>
            </div>
          </div>
        ) : (
          recentBookings.map((booking) => (
            <div key={booking.id} className="reserva-item">
              <div className={`reserva-dot ${statusClasses[booking.status] || "dot-green"}`} />
              <div className="reserva-info">
                <div className="reserva-sala">{booking.roomName} — {booking.roomLocation}</div>
                <div className="reserva-prof">{booking.userDisplayName || booking.username}</div>
              </div>
              <div className="reserva-time">
                {formatDate(booking.bookingDate)}<br />
                {formatTime(booking.periodStart)}–{formatTime(booking.periodEnd)}
                <div className={`reserva-status ${statusClasses[booking.status] || "status-ok"}`}>
                  {statusLabels[booking.status] || booking.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="spacer" />
      <Footer />

    </>
  );
}