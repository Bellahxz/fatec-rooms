import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";

export default function RelatorioReservas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [andarFiltro, setAndarFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [usoFiltro, setUsoFiltro] = useState("");

  useEffect(() => {
    async function loadRelatório() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        // Carregar salas e reservas
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch("/api/rooms/all", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/bookings/admin/all", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
        
        if (!roomsRes.ok || !bookingsRes.ok) {
          throw new Error("Falha ao carregar dados para o relatório.");
        }
        
        const rooms = await roomsRes.json();
        const bookings = await bookingsRes.json();
        
        // Processar dados para exibição
        const salasProcessadas = rooms.map(room => ({
          id: room.id,
          name: room.name,
          location: room.location,
          notes: room.notes,
          bookable: room.bookable,
          bookings: bookings.filter(b => b.roomId === room.id),
          totalReservas: bookings.filter(b => b.roomId === room.id).length,
          reservasAprovadas: bookings.filter(b => b.roomId === room.id && b.status === 'APPROVED').length,
          reservasPendentes: bookings.filter(b => b.roomId === room.id && b.status === 'PENDING').length,
          reservasRecusadas: bookings.filter(b => b.roomId === room.id && b.status === 'REJECTED').length,
        }));
        
        setSalas(salasProcessadas);
      } catch (err) {
        setError(err.message || "Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }
    loadRelatório();
  }, []);

  // Aplicar filtros
  const salasFiltradas = salas.filter((sala) => {
    const matchAndar = andarFiltro ? sala.floor === andarFiltro : true;
    const matchTipo = tipoFiltro ? sala.type === tipoFiltro : true;
    const matchData = dataFiltro ? sala.date === dataFiltro : true;
    const matchUso = usoFiltro ? sala.used === (usoFiltro === "utilizada") : true;
    return matchAndar && matchTipo && matchData && matchUso;
  });

  // Dados para gráficos
  const usadas = salasFiltradas.filter((s) => s.used).length;
  const naoUsadas = salasFiltradas.filter((s) => !s.used).length;
  const pieData = [
    { name: "Utilizadas", value: usadas },
    { name: "Não Utilizadas", value: naoUsadas },
  ];
  const COLORS = ["#22C55E", "#EF4444"];

  const barData = salasFiltradas.map((s) => ({
    name: s.name,
    solicitacoes: s.requestsCount,
  }));

  const lineData = salasFiltradas.map((s) => ({
    date: s.date,
    solicitacoes: s.requestsCount,
  }));

  // Função para exportar CSV
  function exportarCSV() {
    const headers = ["Sala", "Data", "Solicitações", "Utilizada"];
    const rows = salasFiltradas.map((s) => [
      s.name,
      s.date,
      s.requestsCount,
      s.used ? "Sim" : "Não",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_salas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <Navbar activePage="Relatórios" />

      <PageHero
        title="Relatórios de Uso"
        className="page-hero-relatorios"
        tag="Análise de Reservas"
        description="Visualize estatísticas de utilização das salas."
      />

      <div className="layout-relatorios">

        {/* Estatísticas rápidas */}
        <div className="stats-row">
          <div className="stat-card highlight">
            <div className="stat-number">{usadas}</div>
            <div className="stat-label">Salas Utilizadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{naoUsadas}</div>
            <div className="stat-label">Salas Não Utilizadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{salasFiltradas.length}</div>
            <div className="stat-label">Total de Salas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {barData.reduce((a, b) => a + b.solicitacoes, 0)}
            </div>
            <div className="stat-label">Solicitações</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grafico-card">
          <h2>Filtros de Relatório</h2>
          <div className="filtros">
            <select value={andarFiltro} onChange={(e) => setAndarFiltro(e.target.value)}>
              <option value="">Todos os andares</option>
              <option value="1">1º Andar</option>
              <option value="2">2º Andar</option>
              <option value="3">3º Andar</option>
            </select>

            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="laboratorio">Laboratório</option>
              <option value="auditorio">Auditório</option>
              <option value="sala">Sala de Aula</option>
              <option value="outro">Outro</option>
            </select>

            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />

            <select value={usoFiltro} onChange={(e) => setUsoFiltro(e.target.value)}>
              <option value="">Todas</option>
              <option value="utilizada">Utilizadas</option>
              <option value="nao">Não Utilizadas</option>
            </select>

            <button
              className="btn-red"
              onClick={() => {
                setAndarFiltro("");
                setTipoFiltro("");
                setDataFiltro("");
                setUsoFiltro("");
              }}
            >
              Limpar filtros
            </button>

            <button
              className="btn-blue"
              onClick={exportarCSV}
            >
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="graficos-grid">
          <div className="grafico-card">
            <h2>Taxa de Utilização</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="grafico-card">
            <h2>Solicitações por Sala</h2>
            <BarChart width={500} height={300} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="solicitacoes" fill="#F59E0B" />
            </BarChart>
          </div>
        </div>

        {/* Gráfico de linha temporal mais largo */}
        <div className="grafico-card grafico-largo">
          <h2>Evolução das Solicitações</h2>
          <LineChart width={900} height={350} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="solicitacoes" stroke="#0088FE" />
          </LineChart>
        </div>

      </div>

      <Footer />
    </>
  );
}
