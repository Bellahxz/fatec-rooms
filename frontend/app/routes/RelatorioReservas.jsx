import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#22C55E", "#F59E0B", "#6B7280", "#EF4444"];

export default function RelatorioReservas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await fetch("/api/reports/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Falha ao carregar relatórios.");
        const data = await response.json();
        setSalas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const salasFiltradas = salas.filter((sala) =>
    sala.name.toLowerCase().includes(busca.toLowerCase()) ||
    (sala.location || "").toLowerCase().includes(busca.toLowerCase())
  );

  // Totais para os cards de estatística
  const totalReservas   = salasFiltradas.reduce((a, s) => a + s.totalBookings, 0);
  const totalAprovadas  = salasFiltradas.reduce((a, s) => a + s.approvedBookings, 0);
  const totalPendentes  = salasFiltradas.reduce((a, s) => a + s.pendingBookings, 0);
  const totalCanceladas = salasFiltradas.reduce((a, s) => a + s.cancelledBookings + s.rejectedBookings, 0);

  // Dados para o gráfico de pizza (distribuição de status)
  const pieData = [
    { name: "Aprovadas",  value: totalAprovadas },
    { name: "Pendentes",  value: totalPendentes },
    { name: "Canceladas", value: totalCanceladas },
  ].filter((d) => d.value > 0);

  // Dados para o gráfico de barras (total de reservas por sala)
  const barData = salasFiltradas
    .filter((s) => s.totalBookings > 0)
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .slice(0, 10) // máximo 10 salas para não poluir o gráfico
    .map((s) => ({
      name: s.name,
      Aprovadas: s.approvedBookings,
      Pendentes: s.pendingBookings,
      Canceladas: s.cancelledBookings + s.rejectedBookings,
    }));

  function exportarCSV() {
    const headers = ["Sala", "Localização", "Total", "Aprovadas", "Pendentes", "Canceladas", "Rejeitadas"];
    const rows = salasFiltradas.map((s) => [
      s.name,
      s.location || "",
      s.totalBookings,
      s.approvedBookings,
      s.pendingBookings,
      s.cancelledBookings,
      s.rejectedBookings,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "relatorio_salas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <>
        <Navbar activePage="Relatórios" />
        <div className="content">Carregando relatórios...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar activePage="Relatórios" />
        <div className="content">Erro: {error}</div>
        <Footer />
      </>
    );
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
            <div className="stat-number">{totalReservas}</div>
            <div className="stat-label">Total de Reservas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalAprovadas}</div>
            <div className="stat-label">Aprovadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalPendentes}</div>
            <div className="stat-label">Pendentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalCanceladas}</div>
            <div className="stat-label">Canceladas / Rejeitadas</div>
          </div>
        </div>

        {/* Filtro */}
        <div className="grafico-card">
          <h2>Filtros</h2>
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por sala ou localização..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn-red" onClick={() => setBusca("")}>
              Limpar
            </button>
            <button className="btn-blue" onClick={exportarCSV}>
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="graficos-grid">
          <div className="grafico-card">
            <h2>Distribuição por Status</h2>
            {pieData.length === 0 ? (
              <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
                Nenhuma reserva encontrada.
              </p>
            ) : (
              <PieChart width={380} height={280}>
                <Pie
                  data={pieData}
                  cx={190}
                  cy={130}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </div>

          <div className="grafico-card">
            <h2>Reservas por Sala (top 10)</h2>
            {barData.length === 0 ? (
              <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
                Nenhuma reserva encontrada.
              </p>
            ) : (
              <BarChart width={420} height={280} data={barData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Aprovadas"  stackId="a" fill="#22C55E" />
                <Bar dataKey="Pendentes"  stackId="a" fill="#F59E0B" />
                <Bar dataKey="Canceladas" stackId="a" fill="#EF4444" />
              </BarChart>
            )}
          </div>
        </div>

        {/* Tabela detalhada */}
        <div className="grafico-card">
          <h2>Detalhamento por Sala</h2>
          {salasFiltradas.length === 0 ? (
            <p style={{ color: "var(--gray-500)", fontSize: 14 }}>Nenhuma sala encontrada.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: "var(--font-main)", fontWeight: 700 }}>Sala</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: "var(--font-main)", fontWeight: 700 }}>Localização</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", fontFamily: "var(--font-main)", fontWeight: 700 }}>Total</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", color: "#22C55E", fontFamily: "var(--font-main)", fontWeight: 700 }}>Aprovadas</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", color: "#F59E0B", fontFamily: "var(--font-main)", fontWeight: 700 }}>Pendentes</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", color: "#EF4444", fontFamily: "var(--font-main)", fontWeight: 700 }}>Canceladas</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", color: "#EF4444", fontFamily: "var(--font-main)", fontWeight: 700 }}>Rejeitadas</th>
                  </tr>
                </thead>
                <tbody>
                  {salasFiltradas.map((sala, i) => (
                    <tr
                      key={sala.roomId}
                      style={{
                        borderBottom: "1px solid var(--gray-200)",
                        background: i % 2 === 0 ? "transparent" : "var(--gray-50)",
                      }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{sala.name}</td>
                      <td style={{ padding: "10px 12px", color: "var(--gray-500)" }}>{sala.location || "—"}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{sala.totalBookings}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#22C55E" }}>{sala.approvedBookings}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#F59E0B" }}>{sala.pendingBookings}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#EF4444" }}>{sala.cancelledBookings}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#EF4444" }}>{sala.rejectedBookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </>
  );
}
