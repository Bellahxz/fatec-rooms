import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function CoordenadorSolicitacoes() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal para rejeitar
  const [rejeitandoId, setRejeitandoId] = useState(null);
  const [notaRejeicao, setNotaRejeicao] = useState("");

  // FILTROS
  const [busca, setBusca] = useState("");

  function traduzirStatus(status) {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
      case "PENDENTE":
        return "Pendente";
      case "APPROVED":
      case "ACEITA":
        return "Aceita";
      case "REJECTED":
      case "RECUSADA":
        return "Recusada";
      case "CANCELLED":
      case "CANCELADA":
        return "Cancelada";
      default:
        return status;
    }
  }

  useEffect(() => {
    async function loadReservas() {
      const token = localStorage.getItem("token");

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
          throw new Error("Falha ao carregar as solicitações.");
        }

        const data = await response.json();

        // Filtra apenas as solicitações PENDENTES
        setReservas(
          data
            .filter((reserva) => traduzirStatus(reserva.status) === "Pendente")
            .map((reserva) => {
              const periods = reserva.periods || [];
              const first = periods[0];
              const last = periods[periods.length - 1];
              const createdAt = reserva.createdAt?.split("T")[0] || "";

              return {
                id: reserva.id,
                data: reserva.bookingDate?.split("-").reverse().join("/") || "",
                dataSolicitacao: createdAt ? createdAt.split("-").reverse().join("/") : "",
                espaco: reserva.roomName,
                professor: reserva.userDisplayName || reserva.username || "Desconhecido",
                horaInicio: first?.periodStart?.slice(0, 5) || "--:--",
                horaFim: last?.periodEnd?.slice(0, 5) || "--:--",
                motivo: reserva.subject || reserva.notes || "",
                status: "Pendente",
              };
            })
        );
      } catch (err) {
        setError(err.message || "Erro ao carregar solicitações.");
      } finally {
        setLoading(false);
      }
    }

    loadReservas();
  }, []);

  async function aprovarReserva(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Faça login para aprovar a solicitação.");
      return;
    }

    try {
      const response = await fetch(`/api/bookings/admin/${id}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: true }),
      });
      if (!response.ok) {
        throw new Error("Falha ao aprovar a solicitação.");
      }
      // Remove a reserva da lista
      setReservas((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Erro ao aprovar a solicitação.");
    }
  }

  async function rejeitarReserva(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Faça login para rejeitar a solicitação.");
      return;
    }

    try {
      const response = await fetch(`/api/bookings/admin/${id}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: false, rejectReason: notaRejeicao }),
      });
      if (!response.ok) {
        throw new Error("Falha ao rejeitar a solicitação.");
      }
      // Remove a reserva da lista
      setReservas((prev) => prev.filter((r) => r.id !== id));
      setRejeitandoId(null);
      setNotaRejeicao("");
    } catch (err) {
      setError(err.message || "Erro ao rejeitar a solicitação.");
    }
  }

  const reservasFiltradas = reservas.filter((reserva) => {
    const buscaLower = busca.toLowerCase();

    return (
      reserva.espaco.toLowerCase().includes(buscaLower) ||
      reserva.professor.toLowerCase().includes(buscaLower) ||
      reserva.motivo.toLowerCase().includes(buscaLower)
    );
  });

  return (
    <>
      <Navbar activePage="Coordenação" />

      <PageHero
        title="Solicitações de Reserva"
        tag="Área do Coordenador"
        description="Aprove ou rejeite as solicitações de reservas pendentes."
      />

      <div className="layout-reservas">
        <div className="lado-direito">

          {/* BUSCA */}
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por professor, sala ou motivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-busca"
            />
          </div>

          {/* LISTA DE SOLICITAÇÕES */}
          <div className="container-reservas">
            {loading && <p>Carregando solicitações...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && reservasFiltradas.length === 0 && (
              <p>Nenhuma solicitação pendente.</p>
            )}
            {reservasFiltradas.map((reserva) => (
              <div
                key={reserva.id}
                className="card-reserva pendente"
                id={`reserva-${reserva.id}`}
              >
                <div className="info-reserva completa">

                  <div className="item-reserva">
                    <span className="label">Professor</span>
                    <span className="valor">{reserva.professor}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Espaço</span>
                    <span className="valor">{reserva.espaco}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Data da Reserva</span>
                    <span className="valor">{reserva.data}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Horário</span>
                    <span className="valor">
                      {reserva.horaInicio} - {reserva.horaFim}
                    </span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Data da Solicitação</span>
                    <span className="valor">{reserva.dataSolicitacao}</span>
                  </div>

                  <div className="item-reserva">
                    <span className="label">Motivo</span>
                    <span className="valor">{reserva.motivo}</span>
                  </div>

                </div>

                <div className="acoes">
                  <button
                    className="btn-aprovar"
                    onClick={() => aprovarReserva(reserva.id)}
                  >
                    Aprovar
                  </button>

                  <button
                    className="btn-rejeitar"
                    onClick={() => setRejeitandoId(reserva.id)}
                  >
                    Rejeitar
                  </button>
                </div>

                {rejeitandoId === reserva.id && (
                  <div className="modal-rejeicao">
                    <textarea
                      placeholder="Digite uma observação para a rejeição..."
                      value={notaRejeicao}
                      onChange={(e) => setNotaRejeicao(e.target.value)}
                      className="input-nota"
                    />
                    <div className="botoes-modal">
                      <button
                        className="btn-confirmar"
                        onClick={() => rejeitarReserva(reserva.id)}
                      >
                        Confirmar Rejeição
                      </button>
                      <button
                        className="btn-cancelar"
                        onClick={() => {
                          setRejeitandoId(null);
                          setNotaRejeicao("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
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