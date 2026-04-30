import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

const API_URL = "/api";

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    authlevel: null,
  });

  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchUser();
  }, [navigate, token]);

  async function fetchUser() {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao carregar dados do usuário");

      const data = await response.json();

      setUser({
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        email: data.email || "",
        authlevel: data.authlevel,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick() {
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
    setError(null);
    setSuccess(null);
    setEditando(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const data = await response.json();

      setSuccess("Perfil atualizado com sucesso!");
      setUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        authlevel: data.authlevel,
      });
      setEditando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSolicitarTrocaSenha() {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_URL}/users/password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) throw new Error("Erro ao solicitar troca de senha");

      setSuccess(
        `E-mail de redefinição de senha enviado para ${user.email}. Verifique sua caixa de entrada.`
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const getCargoLabel = (authlevel) => {
    if (authlevel === 1) return "Coordenador";
    if (authlevel === 2) return "Professor";
    return "Usuário";
  };

  if (loading) {
    return (
      <>
        <Navbar activePage="Perfil" />
        <div className="loading-container">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar activePage="Perfil" />

      <PageHero
        title="Seu Perfil"
        tag="Painel do Usuário"
        description="Edite e gerencie suas informações."
      />

      <div className="user-profile">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!editando ? (
          <div className="user-card">
            <div className="user-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>

            <h3>Suas Informações</h3>
            <div className="user-info">
              <p><strong>Nome:</strong> {user.firstname} {user.lastname}</p>
              <p><strong>E-mail:</strong> {user.email}</p>
              <p><strong>Área de Atuação:</strong> {getCargoLabel(user.authlevel)}</p>
            </div>

            <button className="btn-edit" onClick={handleEditClick}>
              Editar Informações
            </button>

            <button
              className="btn-edit"
              style={{
                marginTop: 10,
                background: "transparent",
                border: "1.5px solid #6B6B6B",
                color: "#6B6B6B",
              }}
              onClick={handleSolicitarTrocaSenha}
            >
              Alterar senha por e-mail
            </button>
          </div>
        ) : (
          <form className="user-form" onSubmit={handleSubmit}>
            <h3>Editar Informações</h3>

            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Sobrenome</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setEditando(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-submit"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </>
  );
}