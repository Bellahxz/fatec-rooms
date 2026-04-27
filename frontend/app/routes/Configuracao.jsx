import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { CalendarCheck,Clock, Users, Bell, ShieldCheck, ChevronRight } from "lucide-react";


export default function Configuracao() {
    const navigate = useNavigate();

    const [prazo, setPrazo] = useState(7);
    const [editando, setEditando] = useState(false);
    const [valorTemp, setValorTemp] = useState(prazo);

    const handleSalvar = () => {
        if (valorTemp < 1) return;
        setPrazo(valorTemp);
        setEditando(false);
    };

    const handleCancelar = () => {
        setValorTemp(prazo);
        setEditando(false);
    };

    return (
        <>
            <Navbar activePage="configuracao" />

            <PageHero
                className="page-hero"
                tag="Área de Configuração"
                title="Configurações do sistema"
                description="Gerencie suas preferências e configurações do sistema."
            />

            <div className="content-config">

                {/* CARD */}
                <h2 className="secao-titulo">Reservas</h2>

                <div className="card">

                    {/* LADO ESQUERDO */}
                    <div className="card-left">
                    
                        <div className="icon-box">
                            <CalendarCheck size={28} />
                        </div>

                        <div className="card-info">
                            <h3>Prazo de antecedência</h3>
                            <p>
                            Defina com quantos dias de antecedência uma sala pode ser reservada
                            </p>
                        </div>

                    </div>

                    {/* LADO DIREITO */}
                    {!editando ? (
                    <div className="card-right">
                        <span className="badge">{prazo} dias</span>

                        <button className="btn-editar" onClick={() => setEditando(true)}>
                        Editar
                        </button>
                    </div>
                    ) : (
                    <div className="card-right">
                        <div className="input-group">
                            <input
                                type="number"
                                value={valorTemp}
                                onChange={(e) => setValorTemp(Number(e.target.value))}
                                min="1"
                            />
                            <span>dias</span>
                        </div>

                        <div className="botoes">
                            <button className="btn-cancelar" onClick={handleCancelar}>
                                Cancelar
                            </button>
                            <button className="btn-salvar" onClick={handleSalvar}>
                                Salvar
                            </button>
                        </div>
                    </div>
                    )}
                </div>

                {/* Outras configuraçoes */}

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




            <Footer />


        </>


    );

}