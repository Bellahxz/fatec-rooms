import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function EditarReserva() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [novoMotivo, setNovoMotivo] = useState("");

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
        setError("Faça login para ver suas reservas.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/bookings/my", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Falha ao carregar suas reservas.");
        }
        const data = await response.json();
        setReservas(data.map((reserva) => {
          const periods = reserva.periods || [];
          const first = periods[0];
          const last = periods[periods.length - 1];

          return {
            id: reserva.id,
            data: reserva.bookingDate?.split("-").reverse().join("/") || "",
            espaco: reserva.roomName,
            horaInicio: first?.periodStart?.slice(0, 5) || "--:--",
            horaFim: last?.periodEnd?.slice(0, 5) || "--:--",
            motivo: reserva.subject || reserva.notes || "",
            status: traduzirStatus(reserva.status),
          };
        }));
      } catch (err) {
        setError(err.message || "Erro ao carregar suas reservas.");
      } finally {
        setLoading(false);
      }
    }

    loadReservas();
  }, []);

  // 🔍 FILTROS
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");

  function iniciarEdicao(reserva) {
    setEditandoId(reserva.id);
    setNovoMotivo(reserva.motivo);
  }

  async function salvarEdicao(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Faça login para editar a reserva.");
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${id}/notes`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: novoMotivo }),
      });
      if (!response.ok) {
        throw new Error("Falha ao atualizar o motivo da reserva.");
      }
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, motivo: novoMotivo } : r
        )
      );
      setEditandoId(null);
    } catch (err) {
      setError(err.message || "Erro ao salvar a edição.");
    }
  }

  async function cancelarReserva(id) {
    const confirmar = window.confirm("Deseja realmente cancelar essa reserva?");
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Faça login para cancelar a reserva.");
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Falha ao cancelar a reserva.");
      }
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Cancelada" } : r
        )
      );
    } catch (err) {
      setError(err.message || "Erro ao cancelar a reserva.");
    }
  }

  // 🔄 converter BR → ISO
  function formatarDataBRparaISO(dataBR) {
    const [dia, mes, ano] = dataBR.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  // 🔎 FILTRO COMPLETO
  const reservasFiltradas = reservas.filter((reserva) => {
    const buscaLower = busca.toLowerCase();
    const matchBusca =
      reserva.espaco.toLowerCase().includes(buscaLower) ||
      reserva.motivo.toLowerCase().includes(buscaLower) ||
      reserva.status.toLowerCase().includes(buscaLower);

    const matchStatus = statusFiltro
      ? reserva.status === statusFiltro
      : true;

    const matchData = dataFiltro
      ? formatarDataBRparaISO(reserva.data) === dataFiltro
      : true;

    return matchBusca && matchStatus && matchData;
  });

  return (
    <>
      <Navbar activePage="Minhas Reservas" />

      <PageHero
        title="Minhas Reservas"
        className="page-hero-cadastro"
        tag="Área de Edição de Reservas"
        description="Visualize, filtre e gerencie suas reservas."
      />

      <div className="layout-reservas">

        <div className="lado-direito">

          {/* 🔍 FILTROS */}
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por sala..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Aceita">Aceita</option>
              <option value="Cancelada">Cancelada</option>
            </select>

            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />
          </div>

          {/* 🧾 CARDS */}
          <div className="container-reservas">
            {loading && <p>Carregando reservas...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && reservasFiltradas.length === 0 && (
              <p>Nenhuma reserva encontrada.</p>
            )}
            {reservasFiltradas.map((reserva) => (
              <div
                key={reserva.id}
                className="card-reserva"
                data-status={reserva.status}
              >
                <div className="info-reserva">

                  <div className="item-reserva">
                    <span className="label">Data</span>
                    <span className="valor">{reserva.data}</span>
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
                    <span className="label">Motivo</span>

                    {editandoId === reserva.id ? (
                      <>
                        <input
                          value={novoMotivo}
                          onChange={(e) => setNovoMotivo(e.target.value)}
                        />
                        <button
                          className="btn-salvar"
                          onClick={() => salvarEdicao(reserva.id)}
                        >
                          Salvar
                        </button>
                      </>
                    ) : (
                      <span className="valor">{reserva.motivo}</span>
                    )}
                  </div>

                  <div className="item-reserva">
                    <span className="label">Status</span>
                    <span className="valor">{reserva.status}</span>
                  </div>

                </div>

                {reserva.status !== "Cancelada" && (
                  <div className="acoes">
                    <button onClick={() => iniciarEdicao(reserva)}>
                      Editar
                    </button>

                    <button onClick={() => cancelarReserva(reserva.id)}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}