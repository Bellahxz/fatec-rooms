import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import {
  CalendarCheck,
  Clock,
  Users,
  Bell,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  X,
} from "lucide-react";

const API_URL = "/api";

// Template para uma nova semana de prova
const EMPTY_EXAM_WEEK = {
  examType: "P1",
  startDate: "",
  endDate: "",
  description: "",
};

export default function Configuracao() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authlevel = localStorage.getItem("authlevel");

  // Estado geral
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Prazo de reserva
  const [prazo, setPrazo] = useState(7);
  const [editandoPrazo, setEditandoPrazo] = useState(false);
  const [valorTempPrazo, setValorTempPrazo] = useState(7);
  const [savingPrazo, setSavingPrazo] = useState(false);

  // Semestres
  const [semestres, setSemestres] = useState([]);
  const [semesterSelecionado, setSemesterSelecionado] = useState("");

  // Semanas de avaliação
  const [examWeeks, setExamWeeks] = useState([]);
  const [loadingExamWeeks, setLoadingExamWeeks] = useState(false);
  const [savingExamWeek, setSavingExamWeek] = useState(false);
  const [showExamWeekForm, setShowExamWeekForm] = useState(false);
  const [currentExamWeek, setCurrentExamWeek] = useState(EMPTY_EXAM_WEEK);
  const [editingExamWeekId, setEditingExamWeekId] = useState(null);

  // ============================================================
  //  Carregar dados iniciais (prazo + semestres)
  // ============================================================
  useEffect(() => {
    if (authlevel !== "1") {
      navigate("/");
      return;
    }
    carregarConfiguracaoESemestres();
  }, []);

  // Quando o semestre selecionado mudar, carregar as semanas de prova
  useEffect(() => {
    if (semesterSelecionado && semesterSelecionado > 0) {
      carregarExamWeeks(semesterSelecionado);
    } else {
      setExamWeeks([]);
    }
  }, [semesterSelecionado]);

  async function carregarConfiguracaoESemestres() {
    try {
      setLoading(true);
      setError(null);

      // Requisições paralelas
      const [configResp, semResp] = await Promise.all([
        fetch(`${API_URL}/config/booking/min-advance-days`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/semesters`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!configResp.ok) throw new Error("Erro ao carregar prazo mínimo");
      if (!semResp.ok) throw new Error("Erro ao carregar semestres");

      const configData = await configResp.json();
      const semData = await semResp.json();

      setPrazo(configData.days || 7);
      setValorTempPrazo(configData.days || 7);

      const lista = Array.isArray(semData) ? semData : semData.content || [];
      setSemestres(lista);

      // Seleciona o primeiro semestre ativo (active === 1) ou o primeiro da lista
      if (lista.length > 0) {
        const ativo = lista.find((s) => s.active === 1);
        const primeiro = ativo || lista[0];
        if (primeiro && primeiro.id) {
          setSemesterSelecionado(primeiro.id);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  //  Gerenciar Prazo de Reserva
  // ============================================================
  async function salvarPrazo() {
    if (valorTempPrazo < 1) {
      setError("O prazo deve ser maior que 0.");
      return;
    }
    setSavingPrazo(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch(`${API_URL}/config/booking/min-advance-days`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days: valorTempPrazo }),
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Erro ao salvar prazo");
      }
      const data = await resp.json();
      setPrazo(data.days);
      setEditandoPrazo(false);
      setSuccess("Prazo de antecedência atualizado com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPrazo(false);
    }
  }

  // ============================================================
  //  Gerenciar Semanas de Avaliação
  // ============================================================
  async function carregarExamWeeks(semesterId) {
    if (!semesterId) return;
    setLoadingExamWeeks(true);
    setError(null);
    try {
      const resp = await fetch(`${API_URL}/semesters/${semesterId}/exam-weeks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Erro ao carregar semanas de prova");
      const data = await resp.json();
      setExamWeeks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setExamWeeks([]);
    } finally {
      setLoadingExamWeeks(false);
    }
  }

  function handleOpenExamWeekForm(examWeek = null) {
    if (examWeek) {
      // Edição
      setEditingExamWeekId(examWeek.id);
      setCurrentExamWeek({
        examType: examWeek.examType,
        startDate: examWeek.startDate,
        endDate: examWeek.endDate,
        description: examWeek.description || "",
      });
    } else {
      // Criação
      setEditingExamWeekId(null);
      setCurrentExamWeek(EMPTY_EXAM_WEEK);
    }
    setShowExamWeekForm(true);
  }

  function handleCloseExamWeekForm() {
    setShowExamWeekForm(false);
    setCurrentExamWeek(EMPTY_EXAM_WEEK);
    setEditingExamWeekId(null);
    setError(null);
  }

  async function salvarExamWeek(e) {
    e.preventDefault();
    const { examType, startDate, endDate, description } = currentExamWeek;

    if (!examType || !startDate || !endDate) {
      setError("Preencha tipo, data início e data fim.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("A data de início não pode ser posterior à data de fim.");
      return;
    }

    setSavingExamWeek(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingExamWeekId
        ? `${API_URL}/semesters/${semesterSelecionado}/exam-weeks/${editingExamWeekId}`
        : `${API_URL}/semesters/${semesterSelecionado}/exam-weeks`;

      const method = editingExamWeekId ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examType, startDate, endDate, description }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || "Erro ao salvar semana de prova");
      }

      setSuccess(
        editingExamWeekId
          ? "Semana de avaliação atualizada com sucesso!"
          : "Semana de avaliação criada com sucesso!"
      );
      handleCloseExamWeekForm();
      await carregarExamWeeks(semesterSelecionado);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingExamWeek(false);
    }
  }

  async function deletarExamWeek(id, examType) {
    if (!window.confirm(`Remover a semana de ${examType}?`)) return;
    setError(null);
    try {
      const resp = await fetch(
        `${API_URL}/semesters/${semesterSelecionado}/exam-weeks/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || "Erro ao remover semana de prova");
      }
      setSuccess(`Semana de ${examType} removida com sucesso.`);
      await carregarExamWeeks(semesterSelecionado);
    } catch (err) {
      setError(err.message);
    }
  }

  // ============================================================
  //  Render
  // ============================================================
  if (loading) {
    return (
      <>
        <Navbar activePage="configuracao" />
        <div className="content">Carregando configurações...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar activePage="configuracao" />
      <PageHero
        tag="Área de Configuração"
        title="Configurações do sistema"
        description="Gerencie suas preferências e configurações do sistema."
      />

      <div className="content-config">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* ========== SEÇÃO: PRAZO DE RESERVA ========== */}
        <h2 className="secao-titulo">Reservas</h2>
        <div className="card">
          <div className="card-left">
            <div className="icon-box">
              <CalendarCheck size={28} />
            </div>
            <div className="card-info">
              <h3>Prazo de antecedência</h3>
              <p>
                Defina com quantos dias de antecedência uma sala pode ser
                reservada.
              </p>
            </div>
          </div>

          {!editandoPrazo ? (
            <div className="card-right">
              <span className="badge">{prazo} dias</span>
              <button className="btn-editar" onClick={() => setEditandoPrazo(true)}>
                Editar
              </button>
            </div>
          ) : (
            <div className="card-right">
              <div className="input-group">
                <input
                  type="number"
                  value={valorTempPrazo}
                  onChange={(e) => setValorTempPrazo(Number(e.target.value))}
                  min="1"
                />
                <span>dias</span>
              </div>
              <div className="botoes">
                <button
                  className="btn-cancelar"
                  onClick={() => {
                    setEditandoPrazo(false);
                    setValorTempPrazo(prazo);
                  }}
                  disabled={savingPrazo}
                >
                  Cancelar
                </button>
                <button
                  className="btn-salvar"
                  onClick={salvarPrazo}
                  disabled={savingPrazo}
                >
                  {savingPrazo ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========== SEÇÃO: SEMANAS DE AVALIAÇÃO ========== */}
        <h2 className="secao-titulo">Semanas de Avaliação (P1, P2, P3)</h2>

        {/* Seletor de semestre */}
        {semestres.length === 0 ? (
          <div className="card">
            <p>Nenhum semestre cadastrado.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div className="card-left">
                <div className="card-info">
                  <h3>Semestre ativo</h3>
                  <p>Selecione o semestre para gerenciar as semanas de prova.</p>
                </div>
              </div>
              <div className="card-right">
                <select
                  value={semesterSelecionado}
                  onChange={(e) => setSemesterSelecionado(Number(e.target.value))}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-200)",
                  }}
                >
                  {semestres.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name} {sem.active === 1 ? "(Ativo)" : "(Inativo)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de semanas de avaliação */}
            <div className="card" style={{ flexDirection: "column", alignItems: "stretch" }}>
              {loadingExamWeeks ? (
                <p>Carregando semanas de avaliação...</p>
              ) : examWeeks.length === 0 ? (
                <p style={{ color: "var(--gray-500)" }}>
                  Nenhuma semana de avaliação cadastrada para este semestre.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {examWeeks.map((ew) => (
                    <div
                      key={ew.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: "var(--gray-50)",
                        borderRadius: "12px",
                        border: "1px solid var(--gray-200)",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "1rem", marginRight: "12px" }}>
                          {ew.examType}
                        </strong>
                        <span style={{ color: "var(--gray-700)" }}>
                          {ew.startDate.split("-").reverse().join("/")} a{" "}
                          {ew.endDate.split("-").reverse().join("/")}
                        </span>
                        {ew.description && (
                          <span
                            style={{
                              marginLeft: "12px",
                              fontSize: "0.85rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            – {ew.description}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenExamWeekForm(ew)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#2196F3",
                          }}
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deletarExamWeek(ew.id, ew.examType)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--red)",
                          }}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão para adicionar nova semana */}
              <button
                onClick={() => handleOpenExamWeekForm()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "20px",
                  background: "none",
                  border: "1px dashed var(--gray-400)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  width: "fit-content",
                  color: "var(--gray-700)",
                }}
              >
                <Plus size={18} /> Adicionar semana de avaliação
              </button>
            </div>
          </>
        )}

        {/* ========== OUTRAS CONFIGURAÇÕES (placeholders) ========== */}
        <h2 className="secao-titulo">Outras configurações</h2>
        <div className="outras-config">
          <div className="config-grid">
            <div className="config-item">
              <div className="config-left">
                <div className="icon-box">
                  <Clock size={22} />
                </div>
                <div>
                  <h4>Horários de funcionamento</h4>
                  <p>Defina os horários e dias disponíveis para reservas.</p>
                </div>
              </div>
              <ChevronRight />
            </div>
            <div className="config-item">
              <div className="config-left">
                <div className="icon-box">
                  <Users size={22} />
                </div>
                <div>
                  <h4>Restrições de reservas</h4>
                  <p>Configure limites e regras de utilização.</p>
                </div>
              </div>
              <ChevronRight />
            </div>
            <div className="config-item">
              <div className="config-left">
                <div className="icon-box">
                  <Bell size={22} />
                </div>
                <div>
                  <h4>Notificações</h4>
                  <p>Gerencie avisos e comunicações do sistema.</p>
                </div>
              </div>
              <ChevronRight />
            </div>
            <div className="config-item">
              <div className="config-left">
                <div className="icon-box">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4>Permissões</h4>
                  <p>Configure quem pode reservar e aprovar.</p>
                </div>
              </div>
              <ChevronRight />
            </div>
          </div>
        </div>
      </div>

      {/* ========== MODAL PARA CRIAR/EDITAR SEMANA DE AVALIAÇÃO ========== */}
      {showExamWeekForm && (
        <div className="modal-overlay" onClick={handleCloseExamWeekForm}>
          <div className="modal-espacos" onClick={(e) => e.stopPropagation()}>
            <div className="modal-topo">
              <h2>{editingExamWeekId ? "Editar" : "Nova"} semana de avaliação</h2>
              <button className="btn-close-modal" onClick={handleCloseExamWeekForm}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={salvarExamWeek}>
              <div className="form-group-reserva">
                <label>Tipo de prova *</label>
                <select
                  value={currentExamWeek.examType}
                  onChange={(e) =>
                    setCurrentExamWeek({ ...currentExamWeek, examType: e.target.value })
                  }
                  required
                >
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
              </div>

              <div className="form-group-reserva">
                <label>Data início *</label>
                <input
                  type="date"
                  value={currentExamWeek.startDate}
                  onChange={(e) =>
                    setCurrentExamWeek({ ...currentExamWeek, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group-reserva">
                <label>Data fim *</label>
                <input
                  type="date"
                  value={currentExamWeek.endDate}
                  onChange={(e) =>
                    setCurrentExamWeek({ ...currentExamWeek, endDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group-reserva">
                <label>Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex.: Prova escrita, Trabalho..."
                  value={currentExamWeek.description}
                  onChange={(e) =>
                    setCurrentExamWeek({ ...currentExamWeek, description: e.target.value })
                  }
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-submit-reserva"
                  disabled={savingExamWeek}
                >
                  {savingExamWeek
                    ? "Salvando..."
                    : editingExamWeekId
                    ? "Atualizar"
                    : "Criar"}
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={handleCloseExamWeekForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}