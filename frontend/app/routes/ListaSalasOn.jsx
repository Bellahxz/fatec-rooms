import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const SalasPage = () => {
  const [salas, setSalas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [disponibilidadeFiltro, setDisponibilidadeFiltro] = useState("todos");

  useEffect(() => {
    const dados = [
      {
        id: 1,
        nome: "Laboratório de Informática - 202",
        tipo: "Laboratório",
        andar: 2,
        carteiras: 20,
        computadores: 15,
        arCondicionado: true,
        televisao: false,
        disponivel: true,
      },
      {
        id: 2,
        nome: "Auditório Principal",
        tipo: "Auditório",
        andar: "Térreo",
        carteiras: 100,
        computadores: 0,
        arCondicionado: true,
        televisao: true,
        disponivel: true,
      },
      {
        id: 3,
        nome: "Sala de Aula - 101",
        tipo: "Sala",
        andar: 1,
        carteiras: 40,
        computadores: 2,
        arCondicionado: false,
        televisao: true,
        disponivel: false,
      },
    ];
    setSalas(dados);
  }, []);

    const salasFiltradas = salas.filter((sala) => {
    const matchNome = sala.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFiltro === "todos" || sala.tipo === tipoFiltro;
    const matchDisponibilidade =
      disponibilidadeFiltro === "todos" ||
      (disponibilidadeFiltro === "disponivel" && sala.disponivel) ||
      (disponibilidadeFiltro === "indisponivel" && !sala.disponivel);

    return matchNome && matchTipo && matchDisponibilidade;
  });

  return (
    <>
      <Navbar activePage="Lista de Salas"/>
      <PageHero 
        title="Lista de Salas"
        className="page-hero-cadastro"
        tag="Área de Listagem"
        description="Visualize as salas disponíveis e seus detalhes."
      />
      <div className="container">
        <div className="filtros">
          <input
            type="text"
            placeholder="Pesquisar pelo nome da sala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="Laboratório">Laboratório</option>
            <option value="Auditório">Auditório</option>
            <option value="Sala">Sala de Aula</option>
          </select>
          <select
            value={disponibilidadeFiltro}
            onChange={(e) => setDisponibilidadeFiltro(e.target.value)}
          >
            <option value="todos">Todas as salas</option>
            <option value="disponivel">Disponíveis</option>
            <option value="indisponivel">Não disponíveis</option>
          </select>
        </div>

        <div className="lista-salas">
          {salasFiltradas.map((sala) => (
            <div key={sala.id} className={`linha-sala ${sala.tipo.replace(" ", "-")}`}>
              <span className={`status ${sala.disponivel ? "verde" : "vermelho"}`}></span>
              <div className="info">
                <h3>{sala.nome}</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Carteiras</label>
                    <span className="valor">{sala.carteiras}</span>
                  </div>
                  <div className="info-item">
                    <label>Computadores</label>
                    <span className="valor">{sala.computadores}</span>
                  </div>
                  <div className="info-item">
                    <label>Ar-condicionado</label>
                    <span className="valor">{sala.arCondicionado ? "Sim" : "Não"}</span>
                  </div>
                  <div className="info-item">
                    <label>Televisão</label>
                    <span className="valor">{sala.televisao ? "Sim" : "Não"}</span>
                  </div>
                  <div className="info-item">
                    <label>Andar</label>
                    <span className="valor">{sala.andar}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SalasPage;
