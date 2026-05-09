import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export default function GerenciarUsuario() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const authlevel = localStorage.getItem("authlevel");
        if (authlevel !== "1") {
            navigate("/");
            return;
        }

        async function loadUsers() {
            const token = localStorage.getItem("token");

            try {
                const meResponse = await fetch("/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    setCurrentUserId(meData.id);
                }

                const response = await fetch("/api/admin/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    const data = await response.json().catch(() => null);
                    throw new Error(data?.message || "Falha ao carregar usuários.");
                }

                const users = await response.json();
                setUsuarios(
                    users.map((user) => ({
                        id: user.id,
                        nome: `${user.firstname} ${user.lastname}`,
                        email: user.email,
                        authlevel: user.authlevel,
                        tipo:
                            user.authlevel === 1
                                ? "Coordenador"
                                : user.authlevel === 2
                                ? "Professor"
                                : "Pendente",
                        status: user.enabled === 1 ? 1 : 0,
                    }))
                );
            } catch (err) {
                setError(err.message || "Erro desconhecido ao buscar usuários.");
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, [navigate]);

    function getStatusLabel(status) {
        return status === 1 ? "Ativo" : "Desativado";
    }

    function getStatusClass(status) {
        return status === 1 ? "status-ok" : "status-cancel";
    }

    function handleOpenModal(usuario) {
        setSelectedUser(usuario);
        setShowModal(true);
    }

    function openEditModal(usuario) {
        setEditingUser(usuario);
        setSuccessMessage(null);
        setShowEditModal(true);
    }

    async function saveUserEdit() {
        if (!editingUser) return;
        setSavingEdit(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/users/${editingUser.id}/authlevel`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ authlevel: editingUser.authlevel }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || "Não foi possível salvar o usuário.");
            }

            const updated = await response.json();
            setUsuarios((prev) =>
                prev.map((user) =>
                    user.id === updated.id
                        ? {
                              ...user,
                              authlevel: updated.authlevel,
                              tipo: updated.authlevel === 1 ? "Coordenador" : "Professor",
                          }
                        : user
                )
            );
            setSuccessMessage("Alteração salva.");
        } catch (err) {
            setError(err.message || "Erro ao salvar usuário.");
        } finally {
            setSavingEdit(false);
        }
    }

    async function disableUser(userId) {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/users/${userId}/disable`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const data = await response.text().catch(() => null);
            throw new Error(data || "Não foi possível desativar o usuário.");
        }

        return await response.text();
    }

    async function handleConfirmDisable() {
        if (!selectedUser) return;

        try {
            await disableUser(selectedUser.id);
            setUsuarios((prev) =>
                prev.map((user) =>
                    user.id === selectedUser.id ? { ...user, status: 0 } : user
                )
            );
            setShowConfirmModal(false);
            setShowModal(false);
            setSelectedUser(null);
        } catch (err) {
            alert(err.message || "Erro ao desativar usuário.");
        }
    }

    if (loading) {
        return (
            <>
                <Navbar activePage="gerenciar-usuarios" />
                <PageHero
                    tag="Gerenciamento"
                    title="Gerenciamento de Usuários"
                    description="Veja todos os usuários cadastrados e acesse as ações de editar ou desativar."
                />
                <div className="content">
                    <p>Carregando usuários...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar activePage="gerenciar-usuarios" />

            <PageHero
                tag="Gerenciamento"
                title="Gerenciamento de Usuários"
                description="Veja todos os usuários cadastrados e acesse as ações de editar ou desativar."
            />

            <div className="content">
                <div className="title-user">
                    <h3>Usuários cadastrados</h3>
                </div>

                {error ? (
                    <div className="error-message">Erro: {error}</div>
                ) : usuarios.length === 0 ? (
                    <div className="empty-state">Nenhum usuário encontrado.</div>
                ) : (
                    <div className="reservas-list">
                        {usuarios
                            .filter((usuario) => currentUserId !== usuario.id)
                            .map((usuario) => (
                            <div key={usuario.id} className="reserva-item">
                                <div className="usuario-info">
                                    <div className="reserva-sala-user">{usuario.nome}</div>
                                    <div className="usuario-detalhes">
                                        <div className="usuario-box">
                                            <span className="usuario-label">E-mail</span>
                                            <span className="usuario-value">{usuario.email}</span>
                                        </div>
                                        <div className="usuario-box">
                                            <span className="usuario-label">Tipo</span>
                                            <span className="usuario-value">{usuario.tipo}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="room-actions">
                                    <div className={`reserva-status ${getStatusClass(usuario.status)}`}>
                                        {getStatusLabel(usuario.status)}
                                    </div>
                                    <div className="reserva-buttons">
                                        <button
                                            className="btn-action btn-secondary"
                                            onClick={() => openEditModal(usuario)}
                                        >
                                            Editar
                                        </button>
                                        {usuario.status === 1 ? (
                                            <button
                                                className="btn-action btn-danger"
                                                onClick={() => handleOpenModal(usuario)}
                                            >
                                                Desativar
                                            </button>
                                        ) : (
                                            <button className="btn-action btn-secondary" disabled>
                                                Desativado
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Desativar usuário</h2>
                        <p className="modal-description">
                            Você está prestes a desativar o usuário <strong>{selectedUser?.nome}</strong>.
                        </p>
                        <div className="modal-footer">
                            <button
                                className="btn-action btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-action btn-danger"
                                onClick={() => setShowConfirmModal(true)}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingUser && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Editar usuário</h2>
                        <form
                            className="modal-form"
                            onSubmit={(event) => {
                                event.preventDefault();
                                saveUserEdit();
                            }}
                        >
                            <div className="field-group">
                                <label>Nome</label>
                                <input type="text" value={editingUser.nome} readOnly />
                            </div>

                            <div className="field-group">
                                <label>E-mail</label>
                                <input type="email" value={editingUser.email} readOnly />
                            </div>

                            <div className="field-group">
                                <label>Nível de acesso</label>
                                <select
                                    value={editingUser.authlevel}
                                    onChange={(event) =>
                                        setEditingUser((prev) => ({
                                            ...prev,
                                            authlevel: Number(event.target.value),
                                        }))
                                    }
                                >
                                    <option value={1}>Coordenador</option>
                                    <option value={2}>Professor</option>
                                </select>
                            </div>

                            {successMessage && (
                                <div className="success-message">{successMessage}</div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-action btn-cancel"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-action btn-save"
                                    disabled={savingEdit}
                                >
                                    {savingEdit ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-icon">!</div>
                        <h2>Confirmar desativação</h2>
                        <p>
                            Tem certeza que deseja desativar este usuário?
                            O usuário perderá acesso ao sistema até que seja reabilitado pela equipe.
                        </p>
                        <div className="confirm-buttons">
                            <button
                                className="btn-action btn-secondary"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Voltar
                            </button>
                            <button
                                className="btn-action btn-danger"
                                onClick={handleConfirmDisable}
                            >
                                Sim, desativar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}