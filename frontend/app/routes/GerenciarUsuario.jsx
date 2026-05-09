import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export default function GerenciarUsuario() {

    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [usuarios] = useState([
        {
            id: 1,
            nome: "Carlos Silva",
            email: "carlos@fatec.sp.gov.br",
            tipo: "Professor",
            status: 1
        },
        {
            id: 2,
            nome: "Mariana Souza",
            email: "mariana@fatec.sp.gov.br",
            tipo: "Coordenador",
            status: 1
        },
        {
            id: 3,
            nome: "Fernanda Lima",
            email: "fernanda@fatec.sp.gov.br",
            tipo: "Professor",
            status: 0
        }
    ]);

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
                   <h3> Usuários cadastrados </h3>
                </div>

                <div className="reservas-list">

                    {usuarios.map((usuario) => (

                        <div key={usuario.id} className="reserva-item">

                            <div className="usuario-info">

                                <div className="reserva-sala-user">
                                    {usuario.nome}
                                </div>

                                <div className="usuario-detalhes">

                                    <div className="usuario-box">
                                        <span className="usuario-label">E-mail</span>
                                        <span className="usuario-value">
                                            {usuario.email}
                                        </span>
                                    </div>

                                    <div className="usuario-box">
                                        <span className="usuario-label">Tipo</span>
                                        <span className="usuario-value">
                                            {usuario.tipo}
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div className="room-actions">

                                <div className={`reserva-status ${getStatusClass(usuario.status)}`}>
                                    {getStatusLabel(usuario.status)}
                                </div>

                                <div className="reserva-buttons">

                                    <Link
                                        className="btn-action btn-secondary"
                                        to={`/usuarios-editar?id=${usuario.id}`}
                                    >
                                        Editar
                                    </Link>

                                    <button
                                        className={`btn-action ${
                                            usuario.status === 1
                                                ? "btn-danger"
                                                : "btn-success"
                                        }`}
                                        onClick={() => {
                                            if (usuario.status === 1) {
                                                handleOpenModal(usuario);
                                            } else {
                                                console.log("Usuário ativado");
                                            }
                                        }}
                                    >
                                        {usuario.status === 1 ? "Desativar" : "Ativar"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {showModal && (
                <div className="modal-overlay">

                    <div className="modal-box">

                        <h2>Desativar usuário</h2>

                        <p className="modal-description">
                            Escolha como deseja desativar o usuário{" "}
                            <strong>{selectedUser?.nome}</strong>.
                        </p>

                        <div className="modal-check-group">

                            <label className="modal-check-item">

                                <input
                                    type="radio"
                                    name="tipoDesativacao"
                                    value="temporaria"
                                />

                                <div>
                                    <span className="check-title">
                                        Desativação temporária
                                    </span>

                                    <p>
                                        O usuário ficará desativado por um período definido.
                                        O prazo máximo permitido é de 30 dias.
                                    </p>

                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        placeholder="Quantidade de dias"
                                        className="dias-input"
                                    />
                                </div>

                            </label>

                            <label className="modal-check-item">

                                <input
                                    type="radio"
                                    name="tipoDesativacao"
                                    value="permanente"
                                />

                                <div>
                                    <span className="check-title">
                                        Desativação permanente
                                    </span>

                                    <p>
                                        O usuário será desativado sem prazo definido
                                        para reativação.
                                    </p>
                                </div>

                            </label>

                        </div>

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

            {/*Mensagem de confirmacao*/}

            {showConfirmModal && (

                <div className="modal-overlay">

                    <div className="confirm-modal">

                        <div className="confirm-icon">
                            !
                        </div>

                        <h2>
                            Confirmar desativação
                        </h2>

                        <p>
                            Tem certeza que deseja continuar com esta ação?
                            O usuário poderá perder acesso ao sistema.
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
                                onClick={() => {
                                    console.log("Usuário desativado");

                                    setShowConfirmModal(false);
                                    setShowModal(false);
                                }}
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