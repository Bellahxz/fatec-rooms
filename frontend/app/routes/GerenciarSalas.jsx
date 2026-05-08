import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export default function GerenciarSalas() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authlevel = localStorage.getItem("authlevel");
    if (authlevel !== "1") {
      navigate("/");
      return;
    }

    async function loadRooms() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/rooms/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar as salas.");
        }

        const data = await response.json();
        setRooms(data || []);
      } catch (err) {
        setError(err.message || "Erro ao buscar salas.");
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, [navigate]);

  function getStatusLabel(bookable) {
    return bookable === 1 ? "Ativa" : "Desativada";
  }

  function getStatusClass(bookable) {
    return bookable === 1 ? "status-ok" : "status-cancel";
  }

  return (
    <>
      <Navbar activePage="Gerenciar Salas" />
      <PageHero
        tag="Gerenciamento"
        title="Gerenciamento de Salas"
        description="Veja todas as salas cadastradas e acesse as ações de adicionar, editar ou remover." 
      />

      <div className="content">
        <div className="section-title">
          Salas cadastradas
          <Link className="see-all" to="/cadastro-salas">
            Adicionar sala
          </Link>
        </div>

        {loading && <div className="form-title">Carregando salas...</div>}
        {error && <div className="form-title">Erro: {error}</div>}

        {!loading && !error && rooms.length === 0 && (
          <div className="form-title">Nenhuma sala cadastrada encontrada.</div>
        )}

        <div className="reservas-list">
          {rooms.map((room) => (
            <div key={room.id} className="reserva-item">
              <div>
                <div className="reserva-sala">{room.name}</div>
                <div className="reserva-prof">{room.location || "Local não definido"}</div>
                <div className="reserva-prof">{room.notes || "Sem observações"}</div>
              </div>
              <div className="room-actions">
                <div className={`reserva-status ${getStatusClass(room.bookable)}`}>
                  {getStatusLabel(room.bookable)}
                </div>
                <div className="reserva-buttons">
                  <Link className="btn-action btn-secondary" to={`/salas-editar?id=${room.id}`}>
                    Editar
                  </Link>
                  <Link className="btn-action btn-danger" to={`/salas-remover?id=${room.id}`}>
                    Remover
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
