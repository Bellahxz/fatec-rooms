import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function CoordenadorReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FILTROS
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [dataReservaFiltro, setDataReservaFiltro] = useState("");
  const [dataSolicitacaoFiltro, setDataSolicitacaoFiltro] = useState("");

  function traduzirStatus(status) {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
        return "Pendente";
      case "APPROVED":
        return "Aceita";
      case "REJECTED":
        return "Recusada";
      case "CANCELLED":
        return "Cancelada";
      default:
        return status;
    }
  }

  useEffect(() => {
    async function loadReservas() {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setReservas(
          data.map((reserva) => {
            const periods = reserva.periods || [];
            const first = periods[0];
            const last = periods[periods.length - 1];

            return {
              id: reserva.id,
              data: reserva.bookingDate?.split("-").reverse().join("/") || "",
              dataSolicitacao: reserva.createdAt?.split("T")[0] || "",
              espaco: reserva.roomName,
              salaNumero: reserva.roomNumber || reserva.roomName || "",
              tipo: reserva.roomType || "Sala",
              professor: reserva.userName || reserva.user?.name || "Professor",
              horaInicio: first?.periodStart?.slice(0, 5) || "--:--",
              horaFim: last?.periodEnd?.slice(0, 5) || "--:--",
              motivo: reserva.subject || reserva.notes || "",
              status: traduzirStatus(reserva.status),
            };
          })
        );
      } catch (err) {
        setError("Erro ao carregar reservas.");
      } finally {
        setLoading(false);
      }
    }

    loadReservas();
  }, []);

  function formatarDataBRparaISO(dataBR) {
    const [dia, mes, ano] = dataBR.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  function getDateTime(reserva) {
    if (!reserva.data) return new Date(9999, 0, 1);

    const [dia, mes, ano] = reserva.data.split("/");
    const [hora = "00", minuto = "00"] =
      (reserva.horaInicio || "00:00").split(":");

    return new Date(ano, mes - 1, dia, hora, minuto);
  }

  const reservasFiltradas = reservas.filter((reserva) => {
    const buscaLower = busca.toLowerCase();

    const matchBusca =
      reserva.espaco.toLowerCase().includes(buscaLower) ||
      reserva.salaNumero.toLowerCase().includes(buscaLower) ||
      reserva.professor.toLowerCase().includes(buscaLower) ||
      reserva.motivo.toLowerCase().includes(buscaLower);

    const matchStatus = statusFiltro
      ? reserva.status === statusFiltro
      : true;

    const matchTipo = tipoFiltro
      ? reserva.tipo === tipoFiltro
      : true;

    const matchDataReserva = dataReservaFiltro
      ? formatarDataBRparaISO(reserva.data) === dataReservaFiltro
      : true;

    const matchDataSolicitacao = dataSolicitacaoFiltro
      ? reserva.dataSolicitacao === dataSolicitacaoFiltro
      : true;

    return (
      matchBusca &&
      matchStatus &&
      matchTipo &&
      matchDataReserva &&
      matchDataSolicitacao
    );
  });

  const reservasOrdenadas = [...reservasFiltradas].sort(
    (a, b) => getDateTime(a) - getDateTime(b)
  );

  return (
    <>
      <Navbar activePage="Coordenação" />

      <PageHero
        title="Solicitações de Reserva"
        tag="Área do Coordenador"
        description="Gerencie e avalie solicitações de reservas."
      />

      <div className="layout-reservas">
        <div className="lado-direito">

          {/* FILTROS */}
          <div className="filtros">

            <input
              type="text"
              placeholder="Buscar por professor, sala ou número..."
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
              <option value="Recusada">Recusada</option>
            </select>

            {/* FILTRO DE TIPO DE SALA */}
            <div className="form-group">
            <label>Tipo de Sala</label>
            <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
            >
                <option value="">Todos os tipos</option>
                <option value="Sala">Sala</option>
                <option value="Laboratório">Laboratório</option>
                <option value="Auditório">Auditório</option>
                <option value="Outro">Outro</option>
            </select>

            {tipoFiltro === "Outro" && (
                <input
                type="text"
                className="input-outro"
                placeholder="Digite o tipo de sala..."
                style={{ marginTop: "10px" }}
                onChange={(e) => setTipoFiltro(e.target.value)}
                />
            )}
            </div>


            <div className="filtro-datas">
              <div className="grupo-data">
                <label>Data da Reserva</label>
                <input
                  type="date"
                  value={dataReservaFiltro}
                  onChange={(e) => setDataReservaFiltro(e.target.value)}
                />
              </div>

              <div className="grupo-data">
                <label>Data da Solicitação</label>
                <input
                  type="date"
                  value={dataSolicitacaoFiltro}
                  onChange={(e) => setDataSolicitacaoFiltro(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* LISTA */}
          <div className="container-reservas">
            {loading && <p>Carregando...</p>}
            {error && <p className="error-message">{error}</p>}

            {reservasOrdenadas.map((reserva) => (
              <div key={reserva.id} className="card-reserva">

                <p><strong>Professor:</strong> {reserva.professor}</p>
                <p><strong>Sala:</strong> {reserva.espaco}</p>
                <p><strong>Tipo:</strong> {reserva.tipo}</p>
                <p><strong>Data:</strong> {reserva.data}</p>
                <p><strong>Horário:</strong> {reserva.horaInicio} - {reserva.horaFim}</p>
                <p><strong>Status:</strong> {reserva.status}</p>

              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}