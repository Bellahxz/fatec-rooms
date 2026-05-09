import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const menuActions = [
  {
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
    title: "Reservar Sala",
    desc: "Solicite novo horário em minutos.",
    to: "/solicitar-reserva",
  },
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
    title: "Minhas Solicitações",
    desc: "Acompanhe o status das reservas.",
    to: "/minhas-reservas",
  },
  {
    icon: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
    title: "Ajuda Rápida",
    desc: "Ver regras de reserva e horários.",
    to: "/contato",
  },
];

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const statusLabels = {
  APPROVED: "Confirmada",
  PENDING: "Pendente",
  CANCELLED: "Cancelada",
  REJECTED: "Rejeitada",
};
const statusClasses = {
  APPROVED: "status-ok",
  PENDING: "status-pend",
  CANCELLED: "status-cancel",
  REJECTED: "status-red",
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

export default function Professor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      const authlevel = localStorage.getItem("authlevel");

      if (!token) { navigate("/"); return; }
      if (authlevel !== "2") { navigate(authlevel === "1" ? "/coordenador" : "/"); return; }

      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      try {
        const [userResponse, bookingsResponse, roomsResponse, periodsResponse, holidaysResponse] = await Promise.all([
          fetch("/api/users/me", { headers }),
          fetch("/api/bookings/my", { headers }),
          fetch("/api/rooms", { headers }),
          fetch("/api/periods", { headers }),
          fetch("/api/holidays", { headers }),
        ]);

        if (!userResponse.ok) throw new Error("Falha ao obter dados do usuário.");
        if (!bookingsResponse.ok) throw new Error("Falha ao obter suas reservas.");
        if (!roomsResponse.ok) throw new Error("Falha ao obter salas.");
        if (!periodsResponse.ok) throw new Error("Falha ao obter horários.");

        const userData = await userResponse.json();
        const bookingsData = await bookingsResponse.json();
        const roomsData = await roomsResponse.json();
        const periodsData = await periodsResponse.json();
        const holidaysData = holidaysResponse.ok ? await holidaysResponse.json() : [];

        bookingsData.sort((a, b) => {
          const dateA = new Date(a.bookingDate).getTime();
          const dateB = new Date(b.bookingDate).getTime();
          if (dateA !== dateB) return dateA - dateB;
          return (a.periodStart || "").localeCompare(b.periodStart || "");
        });

        setUser(userData);
        setBookings(bookingsData);
        setRooms(roomsData);
        setPeriods(periodsData);
        setHolidays(Array.isArray(holidaysData) ? holidaysData : []);
      } catch (err) {
        setError(err.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const summary = useMemo(() => {
    const totalReservations = bookings.length;
    const pendingReservations = bookings.filter((item) => item.status === "PENDING").length;
    const uniqueRooms = new Set(bookings.map((item) => item.roomId)).size;
    const latestBooking = bookings[bookings.length - 1] || null;
    return { totalReservations, pendingReservations, uniqueRooms, totalRooms: rooms.length, latestBooking };
  }, [bookings, rooms.length]);

  // Set de datas de feriado (YYYY-MM-DD)
  const holidayDates = useMemo(() => {
    return new Set(holidays.map((h) => h.holidayDate));
  }, [holidays]);

  // Map de feriado por data para tooltip
  const holidayByDate = useMemo(() => {
    const map = {};
    holidays.forEach((h) => { map[h.holidayDate] = h; });
    return map;
  }, [holidays]);

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    setHoveredDay(null);
    setTooltipData(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setHoveredDay(null);
    setTooltipData(null);
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayBookings = {};
    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      if (bookingDate.getMonth() !== month || bookingDate.getFullYear() !== year) return;
      const day = bookingDate.getDate();
      if (!dayBookings[day]) dayBookings[day] = [];
      dayBookings[day].push({ ...booking, date: bookingDate });
    });

    Object.keys(dayBookings).forEach(day => {
      dayBookings[day].sort((a, b) => {
        const aStart = a.periods?.[0]?.periodStart || "";
        const bStart = b.periods?.[0]?.periodStart || "";
        return aStart.localeCompare(bStart);
      });
    });

    const cells = Array.from({ length: startOffset }, () => ({ date: "", status: "empty", bookings: [], isHoliday: false, holiday: null }))
      .concat(
        Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayBookingsList = dayBookings[day] || [];

          // Verificar se é feriado
          const mm = String(month + 1).padStart(2, "0");
          const dd = String(day).padStart(2, "0");
          const isoDate = `${year}-${mm}-${dd}`;
          const isHoliday = holidayDates.has(isoDate);
          const holiday = holidayByDate[isoDate] || null;

          let status = "none";
          if (isHoliday) {
            status = "holiday";
          } else if (dayBookingsList.length > 0) {
            const hasApproved = dayBookingsList.some(b => b.status === "APPROVED");
            const hasPending = dayBookingsList.some(b => b.status === "PENDING");
            if (hasApproved) status = "confirmed";
            else if (hasPending) status = "pending";
            else status = "cancelled";
          }

          return { date: day, status, bookings: dayBookingsList, isHoliday, holiday };
        })
      );

    return { monthName, cells, year, month };
  }, [bookings, currentDate, holidayDates, holidayByDate]);

  const handleMouseEnter = (event, cell) => {
    if (!cell.date) return;
    if (cell.bookings.length === 0 && !cell.isHoliday) return;
    setHoveredDay(cell.date);
    setTooltipData({ bookings: cell.bookings, holiday: cell.holiday });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
    setTooltipData(null);
  };

  const handleMouseMove = (event) => {
    if (tooltipData) setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  if (loading) return (
    <>
      <Navbar activePage="Área do Professor" />
      <div className="content">Carregando dados do professor...</div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Navbar activePage="Área do Professor" />
      <div className="content">Erro: {error}</div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar activePage="Área do Professor" />

      <PageHero
        tag="Painel do Professor"
        title={user ? `Bem-vindo, ${user.firstname}` : "Área do Professor"}
        description="Acompanhe suas reservas, solicite novas salas e controle seu calendário."
      />

      <main className="content dashboard-page">
        <div className="dashboard-top-grid">
          <div>
            <div className="stats-row">
              {[
                { highlight: true, icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>, number: summary.totalReservations, label: "Minhas reservas" },
                { icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>, number: summary.uniqueRooms, label: "Salas usadas" },
                { icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, number: summary.pendingReservations, label: "Pendentes" },
              ].map((s) => (
                <div key={s.label} className={`stat-card ${s.highlight ? "highlight" : ""}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-number">{s.number}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {summary.pendingReservations > 0 && (
              <div className="alert-card">
                <div className="alert-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="alert-text">
                  <h4>{summary.pendingReservations} reservas aguardando ação</h4>
                  <p>Você pode cancelar ou revisar o status de reservas pendentes.</p>
                </div>
              </div>
            )}

            <div className="section-title">Ações rápidas</div>
            <div className="menu-grid">
              {menuActions.map((action) => (
                <Link key={action.title} className="menu-card" to={action.to}>
                  <div className="menu-icon">{action.icon}</div>
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>
                </Link>
              ))}
            </div>

            <div className="section-title section-title--top-space">
              Minhas reservas recentes
              <Link className="see-all" to="/minhas-reservas">Ver todas</Link>
            </div>

            <div className="reservas-list">
              {bookings.length === 0 ? (
                <div className="reserva-item">
                  <div className="reserva-info">
                    <div className="reserva-sala">Nenhuma reserva encontrada.</div>
                    <div className="reserva-prof">Crie sua primeira solicitação.</div>
                  </div>
                </div>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="reserva-item">
                    <div className={`reserva-dot ${statusClasses[booking.status] || "dot-green"}`} />
                    <div className="reserva-info">
                      <div className="reserva-sala">{booking.roomName} — {booking.roomLocation}</div>
                      <div className="reserva-prof">{booking.subject || "Sem assunto"}</div>
                    </div>
                    <div className="reserva-time">
                      {formatDate(booking.bookingDate)}<br />
                      {booking.periods && booking.periods.length > 0 ? (
                        <>{formatTime(booking.periods[0].periodStart)}–{formatTime(booking.periods[booking.periods.length - 1].periodEnd)}</>
                      ) : "--:-- – --:--"}
                      <div className={`reserva-status ${statusClasses[booking.status] || "status-ok"}`}>
                        {statusLabels[booking.status] || booking.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="dashboard-sidebar">
            <div className="dashboard-panel summary-card">
              <h3>Resumo rápido</h3>
              <div className="summary-grid">
                <div><span>Salas disponíveis</span><strong>{rooms.length}</strong></div>
                <div><span>Reservas pendentes</span><strong>{summary.pendingReservations}</strong></div>
                <div><span>Última reserva</span><strong>{summary.latestBooking ? summary.latestBooking.roomName : "Nenhuma"}</strong></div>
              </div>
            </div>

            <div className="dashboard-panel calendar-card">
              <div className="calendar-header">
                <div>
                  <button className="calendar-nav" onClick={() => changeMonth(-1)}>←</button>
                  <span className="calendar-month">{calendarData.monthName}</span>
                  <button className="calendar-nav" onClick={() => changeMonth(1)}>→</button>
                </div>
                <button className="calendar-action" onClick={goToToday}>Hoje</button>
              </div>

              <div className="calendar-grid">
                {weekDays.map((day) => (
                  <div key={day} className="calendar-day-name">{day}</div>
                ))}
                {calendarData.cells.map((cell, index) => (
                  <div
                    key={`${cell.date}-${index}`}
                    className={`calendar-cell ${cell.status !== "none" ? `calendar-${cell.status}` : ""}`}
                    onMouseEnter={(e) => handleMouseEnter(e, cell)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    title={cell.isHoliday ? cell.holiday?.name : undefined}
                  >
                    {cell.date || ""}
                  </div>
                ))}
              </div>

              <div className="calendar-legend">
                <div className="legend-item"><span className="legend-badge legend-confirmed" /> Confirmadas</div>
                <div className="legend-item"><span className="legend-badge legend-pending" /> Pendentes</div>
                <div className="legend-item"><span className="legend-badge legend-cancelled" /> Canceladas</div>
                <div className="legend-item"><span className="legend-badge legend-holiday" /> Feriados</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Tooltip */}
      {tooltipData && hoveredDay && (
        <div
          className="calendar-tooltip"
          style={{ position: "fixed", left: tooltipPosition.x + 15, top: tooltipPosition.y - 10, zIndex: 1000 }}
        >
          {tooltipData.holiday && (
            <div style={{ marginBottom: tooltipData.bookings.length > 0 ? "8px" : 0, padding: "4px 0", borderBottom: tooltipData.bookings.length > 0 ? "1px solid #eee" : "none" }}>
              <div style={{ fontWeight: 700, color: "#c2410c", fontSize: "0.85rem" }}>🎉 Feriado</div>
              <div style={{ fontSize: "0.9rem" }}>{tooltipData.holiday.name}</div>
              {tooltipData.holiday.description && (
                <div style={{ fontSize: "0.8rem", color: "#888" }}>{tooltipData.holiday.description}</div>
              )}
            </div>
          )}
          {tooltipData.bookings.length > 0 && (
            <>
              <div className="tooltip-header">
                <strong>Dia {hoveredDay}</strong>
                <span>{tooltipData.bookings.length} reserva(s)</span>
              </div>
              <div className="tooltip-list">
                {tooltipData.bookings.map((booking, idx) => (
                  <div key={idx} className="tooltip-item">
                    <div className="tooltip-time">
                      {booking.periods && booking.periods.length > 0
                        ? `${formatTime(booking.periods[0].periodStart)} - ${formatTime(booking.periods[booking.periods.length - 1].periodEnd)}`
                        : "Horário não definido"}
                    </div>
                    <div className="tooltip-room">{booking.roomName}</div>
                    <div className="tooltip-subject">{booking.subject || "Sem assunto"}</div>
                    <div className={`tooltip-status ${statusClasses[booking.status] || "status-ok"}`}>
                      {statusLabels[booking.status] || booking.status}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Footer />
    </>
  );
}