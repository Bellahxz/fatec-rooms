import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function TodasReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function traduzirStatus(status) {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
      case "PENDENTE":
        return "Pendente";
      case "APPROVED":
      case "ACEITA":
      case "ACEITO":
        return "Aceita";
      case "REJECTED":
      case "RECUSADA":
        return "Recusada";
      case "CANCELLED":
      case "CANCELADA":
        return "Cancelada";
      default:
        return status || "Pendente";
    }
  }

  useEffect(() => {
    async function loadReservas() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Faça login para ver as reservas.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/bookings/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Falha ao carregar as reservas.");
        }
        const data = await response.json();
        setReservas(data.map((reserva) => {
          const periods = reserva.periods || [];
          const first = periods[0];
          const last = periods[periods.length - 1];
          const bookingDate = reserva.bookingDate?.split("T")[0] || reserva.bookingDate || "";
          const createdAt = reserva.createdAt?.split("T")[0] || "";

          return {
            id: reserva.id,
            bookingDate,
            createdAt,
            data: bookingDate ? bookingDate.split("-").reverse().join("/") : "",
            dataSolicitacao: createdAt ? createdAt.split("-").reverse().join("/") : "",
            tipoReserva: reserva.reservationType || "Comum",
            espaco: reserva.roomName,
            horaInicio: first?.periodStart?.slice(0, 5) || "--:--",
            horaFim: last?.periodEnd?.slice(0, 5) || "--:--",
            motivo: reserva.subject || reserva.notes || "",
            status: traduzirStatus(reserva.status),
            professor: reserva.userDisplayName || reserva.username || "Desconhecido",
          };
        }));
      } catch (err) {
        setError(err.message || "Erro ao carregar as reservas.");
      } finally {
        setLoading(false);
      }
    }

    loadReservas();
  }, []);

  // 🔍 FILTROS
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataReservaFiltro, setDataReservaFiltro] = useState("");
  const [dataSolicitacaoFiltro, setDataSolicitacaoFiltro] = useState("");
  const [tipoReservaFiltro, setTipoReservaFiltro] = useState("");

  const limparFiltros = () => {
    setBusca("");
    setStatusFiltro("");
    setDataReservaFiltro("");
    setDataSolicitacaoFiltro("");
    setTipoReservaFiltro("");
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    const buscaLower = busca.toLowerCase();
    const matchBusca =
      reserva.espaco.toLowerCase().includes(buscaLower) ||
      reserva.motivo.toLowerCase().includes(buscaLower) ||
      reserva.professor.toLowerCase().includes(buscaLower) ||
      reserva.status.toLowerCase().includes(buscaLower);

    const matchStatus = statusFiltro
      ? reserva.status === statusFiltro
      : true;

    const matchDataReserva = dataReservaFiltro
      ? reserva.bookingDate === dataReservaFiltro
      : true;

    const matchDataSolicitacao = dataSolicitacaoFiltro
      ? reserva.createdAt === dataSolicitacaoFiltro
      : true;

    const matchTipoReserva = tipoReservaFiltro
      ? reserva.tipoReserva === tipoReservaFiltro
      : true;

    return matchBusca && matchStatus && matchDataReserva && matchDataSolicitacao && matchTipoReserva;
  });

  // Ordenar apenas quando "Todos os status" estiver selecionado
  const reservasOrdenadas = statusFiltro ? reservasFiltradas : [...reservasFiltradas].sort((a, b) => {
    const order = { Pendente: 1, Aceita: 2, Recusada: 3, Cancelada: 4 };
    return (order[a.status] || 5) - (order[b.status] || 5);
  });

  return (
    <>
      <Navbar activePage="Todas as Reservas" />

      <PageHero
        title="Gerenciar Reservas"
        className="page-hero-reservas"
        tag="Área do Coordenador"
        description="Visualize, filtre e gerencie todas as reservas do sistema."
      />

      <div className="layout-reservas">

        <div className="lado-direito">

          {/* 🔍 FILTROS */}
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por sala, motivo ou professor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-busca"
            />

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="select-status"
            >
              <option value="">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Aceita">Aceita</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Recusada">Recusada</option>
            </select>

            <select
              value={tipoReservaFiltro}
              onChange={(e) => setTipoReservaFiltro(e.target.value)}
              className="select-tipo"
            >
              <option value="">Todos os tipos</option>
              <option value="Comum">Comum</option>
              <option value="Recorrente">Recorrente</option>
              <option value="Especial">Especial</option>
            </select>

            <div className="filtro-data-wrapper">
              <div className="grupo-data">
                <label>Dia da Reserva</label>
                <input
                  type="date"
                  value={dataReservaFiltro}
                  onChange={(e) => setDataReservaFiltro(e.target.value)}
                  className="input-data"
                  title="Filtrar por dia da reserva"
                />
              </div>
              <div className="grupo-data">
                <label>Dia da Solicitação</label>
                <input
                  type="date"
                  value={dataSolicitacaoFiltro}
                  onChange={(e) => setDataSolicitacaoFiltro(e.target.value)}
                  className="input-data"
                  title="Filtrar por dia da solicitação"
                />
              </div>
            </div>

            <button type="button" className="btn-red" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>

          {/* 🧾 CARDS */}
          <div className="container-reservas">
            {loading && <p>Carregando reservas...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && reservasFiltradas.length === 0 && (
              <p>Nenhuma reserva encontrada.</p>
            )}
            {reservasOrdenadas.map((reserva) => (
              <div
                key={reserva.id}
                className={`card-reserva ${reserva.status.toLowerCase()}`}
                data-status={reserva.status}
                id={`reserva-${reserva.id}-${Math.random().toString(36).substr(2, 9)}`}
              >
                <div className="info-reserva completa">

                  <div className="item-reserva">
                    <span className="label">Data da Reserva</span>
                    <span className="valor">{reserva.data}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Data da Solicitação</span>
                    <span className="valor">{reserva.dataSolicitacao}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Tipo</span>
                    <span className="valor">{reserva.tipoReserva}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Espaço</span>
                    <span className="valor">{reserva.espaco}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Horário</span>
                    <span className="valor">
                      {reserva.horaInicio} - {reserva.horaFim}
                    </span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Professor</span>
                    <span className="valor">{reserva.professor}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Motivo</span>
                    <span className="valor">{reserva.motivo}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Status</span>
                    <span className={`valor ${reserva.status.toLowerCase()}`}>{reserva.status}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}