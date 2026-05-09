import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export default function CadastroSalas() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipo: "Sala",
    numero: "",
    andar: "",
    computadores: "",
    carteiras: "",
    ar: false,
    tv: false,
  });

  const [cadastrado, setCadastrado] = useState(null); // guarda o nome da sala cadastrada
  const [toast, setToast] = useState(null);
  const [semNumero, setSemNumero] = useState(false);
  const [loading, setLoading] = useState(false);

  function showToast(tipo, mensagem) {
    setToast({ tipo, mensagem });
    setTimeout(() => setToast(null), 3000);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.andar) {
      showToast("erro", "Selecione o andar da sala.");
      return;
    }
    if (form.computadores < 0 || form.carteiras < 0) {
      showToast("erro", "Os valores não podem ser negativos.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const tipoFinal = form.tipo === "Outro" ? (form.tipoOutro || "Outro") : form.tipo;
    const numeroFinal = semNumero ? "" : form.numero;
    const name = numeroFinal ? `${tipoFinal} ${numeroFinal}` : tipoFinal;
    const location = form.andar;

    const extras = [];
    if (form.computadores) extras.push(`Computadores: ${form.computadores}`);
    if (form.carteiras) extras.push(`Carteiras: ${form.carteiras}`);
    if (form.ar) extras.push("Ar-condicionado");
    if (form.tv) extras.push("Televisão");
    const notes = extras.join(", ");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, location, bookable: 1, notes }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Falha ao cadastrar sala.");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      setCadastrado(name);

      setForm({
        tipo: "Sala",
        numero: "",
        andar: "",
        computadores: "",
        carteiras: "",
        ar: false,
        tv: false,
      });
      setSemNumero(false);
    } catch (err) {
      showToast("erro", err.message || "Erro ao cadastrar sala. Tente novamente.");
    } finally {
      setLoading(false);
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
        <div className="cadastro-sala-card">

          {cadastrado ? (
            /* ── TELA DE SUCESSO ── */
            <div className="success-msg">
              <div className="success-icon">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Sala cadastrada com sucesso!</h3>
              <p><strong>{cadastrado}</strong> foi adicionada ao sistema e já está disponível para reservas.</p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
                <button
                  className="btn-submit-cadastro"
                  onClick={() => setCadastrado(null)}
                >
                  Cadastrar outra sala
                </button>
                <Link className="btn-submit-cadastro" to="/gerenciar-salas" style={{ textAlign: "center" }}>
                  Ver salas cadastradas
                </Link>
              </div>
            </div>
          ) : (
            /* ── FORMULÁRIO ── */
            <>
              <h2 align="center">Nova Sala</h2>

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
                        if (checked) setForm({ ...form, numero: "" });
                      }}
                    />
                    <label htmlFor="semNumero" className="checkbox-content">
                    
                      <div>
                        <strong>Sem número de sala</strong>
                        <p>Utilizar quando não houver identificação</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Andar */}
                <div className="form-group-cadastro">
                  <label>Andar</label>
                  <select name="andar" value={form.andar} onChange={handleChange} required>
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
                    min="0"
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
                    min="0"
                  />

                  <div className="feature-grid">
                    <label className={`feature-card ${form.ar ? "active" : ""}`}>
                      <input type="checkbox" name="ar" checked={form.ar} onChange={handleChange} />
                      
                      <div>
                        <strong>Ar-condicionado</strong>
                        <p>Controle de climatização</p>
                      </div>
                    </label>
                    <label className={`feature-card ${form.tv ? "active" : ""}`}>
                      <input type="checkbox" name="tv" checked={form.tv} onChange={handleChange} />
                      
                      <div>
                        <strong>Televisão</strong>
                        <p>Equipamento multimídia</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button className="btn-submit-cadastro" type="submit" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar Sala"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Toast de erro */}
      {toast && (
        <div className={`toast toast-${toast.tipo}`}>
          {toast.tipo === "sucesso" ? "✅" : "❌"} {toast.mensagem}
        </div>
      )}

      <Footer />
    </>
  );
}