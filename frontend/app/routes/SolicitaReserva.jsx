import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";
import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

export default function SolicitaReserva() {
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [salas, setSalas] = useState([]);
    const [date, setDate] = useState(new Date());

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        data: "",
        espaco: "",
        hora: "",
        hora2: "",
        motivo: "",
        curso: "",
        disciplina: "",
        naoSeAplica: false,
    });
    const reservas = {
        "2026-04-04": "aceita",
        "2026-04-09": "pendente",
        "2026-03-24": "selecionado",
        "2026-04-27": "cancelada",
    };

    function buscarSalasDisponiveis(data) {
        // simulação
        return [
            "Sala 101",
            "Sala 102",
            "Laboratório 201",
            "Laboratório 204"
        ];
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));


    }

    async function handleSubmit(e) { }

    return (
        <>
            <Navbar activePage="SolicitaReserva" />

            <PageHero
                variant="SolicitaReserva"
                tag="Painel Operacional"
                title="Solicitação de Reserva "
                description="Gerencie as reservas de salas e visualize o histórico de solicitações."
            />

            <div className="content">

                <div className="div-calendario">
                    <div className="title-calendario">
                        <h3>Minhas Reservas:</h3>
                        <p>Selecione uma data para iniciar uma reserva.</p>
                    </div>
                    
                    
                    {/* calendario */}
                    <Calendar
                    
                        onChange={(value) => {
                            setDate(value);

                            const dataISO = value.toISOString().split("T")[0];

                            setForm((prev) => ({
                                ...prev,
                                data: value.toLocaleDateString("pt-BR"),
                            }));

                            const listaSalas = buscarSalasDisponiveis(dataISO);
                            setSalas(listaSalas);
                            setModalOpen(true);
                        }}

                        value={date}

                        tileClassName={({ date }) => {
                            const dataISO = date.toISOString().split("T")[0];
                            const status = reservas[dataISO];

                            if (status === "aceita") return "dia-aceita";
                            if (status === "pendente") return "dia-pendente";
                            if (status === "cancelada") return "dia-cancelada";

                            return null;
                        }}
                    />
                    <div className="legenda">
                        <div><span className="box verde"></span> Aceita</div>
                        <div><span className="box amarelo"></span> Pendente</div>
                        <div><span className="box vermelho"></span> Cancelada</div>
                        <div><span className="box cinza"></span> Selecionado</div>
                    </div>

                </div>

                {modalOpen && (
                    <div className="modal-overlay">
                        <div className="modal">

                            <h2>Salas disponíveis</h2>

                            <div className="lista-salas">
                                {salas.map((sala, index) => (
                                    <button
                                        key={index}
                                        className="btn-sala"
                                        onClick={() => {
                                            setForm((prev) => ({
                                                ...prev,
                                                espaco: sala,
                                            }));
                                            setModalOpen(false);
                                        }}
                                    >
                                        {sala}
                                    </button>
                                ))}
                            </div>

                            <button className="btn-fechar" onClick={() => setModalOpen(false)}>
                                Fechar
                            </button>

                        </div>
                    </div>
                )}

                <div className="div-forms-reserva">

                    <forms onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group-reserva">
                            <label>Data e espaço selecionado:</label>

                            <div className="horario">

                                <input
                                    type="text"
                                    name="data"
                                    placeholder="DD/MM/AAAA"
                                    value={form.data}
                                    readOnly
                                    style={{ backgroundColor: "#cfcccc89" }}
                                    required
                                />
                                <input
                                    type="text"
                                    name="espaco"
                                    placeholder="Sala 101"
                                    value={form.espaco}
                                    readOnly
                                    style={{ backgroundColor: "#cfcccc89" }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group-reserva">
                            <label>Horários diponivéis:</label>
                            <div className="horario">

                                <input
                                    type="time"
                                    name="hora"
                                    placeholder="HH:MM"
                                    value={form.hora}
                                    onChange={handleChange}
                                    required
                                />
                                <h4>Até</h4>
                                <input
                                    type="time"
                                    name="hora2"
                                    placeholder="HH:MM"
                                    value={form.hora2}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group-reserva">
                            <label>Motivo:</label>
                            <input
                                type="text"
                                name="motivo"
                                placeholder="Descreva o motivo da reserva"
                                value={form.motivo}
                                onChange={handleChange}
                                required
                            />
                        </div>


                        <div className="form-group-reserva">
                            <label>Curso:</label>
                            <select
                                name="curso"
                                value={form.curso}
                                onChange={handleChange}
                                required
                                disabled={form.naoSeAplica}
                                style={{ backgroundColor: form.naoSeAplica ? "#cfcccc89" : "white" }}
                            >
                                <option value="">Selecione um curso</option>
                                <option value="dsm">Desenvolvimento de software e multiplataforma</option>
                                <option value="admin">Administração</option>
                                <option value="rh">Recursos Humano</option>
                                <option value="ads">Analise de desenvolvimento de sistemas</option>
                                <option value="comex">Comércio Exterior</option>
                            </select>
                        </div>
                        <div className="form-group-reserva">
                            <label>Disciplina:</label>
                            <select
                                name="disciplina"
                                value={form.disciplina}
                                onChange={handleChange}
                                required
                                disabled={form.naoSeAplica}
                                style={{ backgroundColor: form.naoSeAplica ? "#cfcccc89" : "white" }}
                            >
                                <option value="">Selecione uma disciplina</option>
                                <option value="bd1">Banco de Dados I</option>
                                <option value="web2">Desenvolvimento Web II</option>
                                <option value="es1">Engenharia de Software I</option>
                                <option value="todas">Todas disciplinas do curso</option>
                            </select>
                        </div>

                        <div className="form-group-reserva-check">
                            <p>Caso a reserva não se aplicar a um curso/disciplina, selecione a opção "Não se aplica"</p>
                            <input
                                type="checkbox"
                                name="naoSeAplica"
                                checked={form.naoSeAplica}
                                onChange={handleChange}
                            /> Não se aplica
                        </div>

                        <button type="submit" className="btn-submit-reserva">
                            Solicitar reserva
                        </button>
                    </forms>

                </div>



            </div>
            <Footer />
        </>
    );
}