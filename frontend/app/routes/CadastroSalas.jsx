import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export default function CadastroSalas() {
  const [form, setForm] = useState({
    tipo: "Sala",
    numero: "",
    andar: "",
    computadores: "",
    carteiras: "",
    ar: false,
    tv: false,
  });

  const [salas, setSalas] = useState([]);
  const [notificacao, setNotificacao] = useState(null);
  const [semNumero, setSemNumero] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // VALIDAÇÕES
    if (!form.nome) {
      setNotificacao({
        tipo: "erro",
        mensagem: "O nome da sala é obrigatório.",
      });
      return;
    }

    if (!form.andar) {
      setNotificacao({
        tipo: "erro",
        mensagem: "Selecione o andar da sala.",
      });
      return;
    }

    if (form.computadores < 0 || form.carteiras < 0) {
      setNotificacao({
        tipo: "erro",
        mensagem: "Os valores não podem ser negativos.",
      });
      return;
    }

    try {
      setSalas([...salas, form]);

      setForm({
        nome: "",
        tipo: "Sala",
        andar: "",
        computadores: "",
        carteiras: "",
        ar: false,
        tv: false,
      });

      setNotificacao({
        tipo: "sucesso",
        mensagem: "Sala cadastrada com sucesso!",
      });
    } catch (error) {
      setNotificacao({
        tipo: "erro",
        mensagem: "Erro ao cadastrar sala. Tente novamente.",
      });
    }
  }

  return (
    <>
      <Navbar activePage="CadastroSalas" />

      <PageHero
        className="page-hero-cadastro-salas"
        tag="Área de Gerenciamento"
        title="Área de Cadastro de Salas"
        description="Crie e gerencie os ambientes do sistema."
      />

      <div className="content">

        {/* CARD */}
        <div className="cadastro-sala-card">

          <h2 align="center">Nova Sala</h2>

          {/* NOTIFICAÇÃO */}
          {notificacao && (
            <div
              style={{
                margin: "10px 0 20px",
                padding: "10px",
                borderRadius: "8px",
                textAlign: "center",
                color: "#fff",
                backgroundColor:
                  notificacao.tipo === "sucesso" ? "#2ecc71" : "#e74c3c",
              }}
            >
              {notificacao.mensagem}
            </div>
          )}

          <form onSubmit={handleSubmit} className="cadastro-sala-form">

            {/* Tipo */}
            <div className="form-group-cadastro">
              <label>Tipo de Sala</label>

              <div className={`tipo-wrapper tipo-${form.tipo}`}>
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  <option value="Sala">Sala</option>
                  <option value="Laboratório">Laboratório</option>
                  <option value="Auditório">Auditório</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Campo extra se for "Outro" */}
              {form.tipo === "Outro" && (
                <input
                  type="text"
                  name="tipoOutro"
                  placeholder="Digite o tipo da sala"
                  value={form.tipoOutro || ""}
                  onChange={handleChange}
                  style={{ marginTop: "10px" }}
                  required
                />
              )}
            </div>

            {/* Número da Sala */}
            <div className="form-group-cadastro">
              <label>Número da Sala</label>

              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                placeholder="Ex: 101"
                disabled={semNumero}
                required={!semNumero}
              />

              <div className={`checkbox-card ${semNumero ? "active" : ""}`}>
                <input
                  type="checkbox"
                  id="semNumero"
                  checked={semNumero}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSemNumero(checked);

                    if (checked) {
                      setForm({ ...form, numero: "" });
                    }
                  }}
                />

                <label htmlFor="semNumero" className="checkbox-content">
                  <div className="checkbox-icon">🚫</div>
                  <div>
                    <strong>Sem número de sala</strong>
                    <p>Utilizar quando não houver identificação</p>
                  </div>
                </label>
            </div>
            </div>

            {/* Unidade */}
            <div className="form-group-cadastro">
              <label>Unidade</label>
              <select
                name="unidade"
                value={form.unidade}
                onChange={handleChange}
                required
              >
                <option value="">Selecione a Unidade</option>
                <option value="Fatec">Fatec</option>
                <option value="Etec">Etec</option>  
              </select>
            </div>

            {/* Andar */}
            <div className="form-group-cadastro">
              <label>Andar</label>
              <select
                name="andar"
                value={form.andar}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o andar</option>
                <option value="Térreo">Térreo</option>
                <option value="1º Andar">1º Andar</option>
                <option value="2º Andar">2º Andar</option>
              </select>
            </div>

            {/* Computadores */}
            <div className="form-group-cadastro">
              <label>Nº de Computadores</label>
              <input
                type="number"
                name="computadores"
                value={form.computadores}
                onChange={handleChange}
              />
            </div>

            {/* Carteiras */}
            <div className="form-group-cadastro">
              <label>Nº de Carteiras</label>
              <input
                type="number"
                name="carteiras"
                value={form.carteiras}
                onChange={handleChange}
              />

              {/* FEATURES */}
              <div className="feature-grid">

                {/* AR */}
                <label className={`feature-card ${form.ar ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    name="ar"
                    checked={form.ar}
                    onChange={handleChange}
                  />
                  <div className="feature-icon">❄️</div>
                  <div>
                    <strong>Ar-condicionado</strong>
                    <p>Controle de climatização</p>
                  </div>
                </label>

                {/* TV */}
                <label className={`feature-card ${form.tv ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    name="tv"
                    checked={form.tv}
                    onChange={handleChange}
                  />
                  <div className="feature-icon">📺</div>
                  <div>
                    <strong>Televisão</strong>
                    <p>Equipamento multimídia</p>
                  </div>
                </label>

              </div>
            </div>

            <button className="btn-submit-cadastro">
              Cadastrar Sala
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}