import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";
import Calendar from "react-calendar";

export default function SolicitaReserva() {
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [salas, setSalas] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [date, setDate] = useState(new Date());
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [form, setForm] = useState({
        data: "",
        dataISO: "",
        espaco: "",
        roomId: null,
        motivo: "",
        curso: "",
        naoSeAplica: false,
    });
    const [selectedPeriodIds, setSelectedPeriodIds] = useState([]);
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        async function loadPageData() {
            try {
                setLoadingPage(true);
                setError(null);

                const [roomsResponse, bookingsResponse] = await Promise.all([
                    fetch("/api/rooms", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                    fetch("/api/bookings/my", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                ]);

                if (!roomsResponse.ok) {
                    throw new Error("Falha ao carregar salas.");
                }
                if (!bookingsResponse.ok) {
                    throw new Error("Falha ao carregar suas reservas.");
                }

                const roomsData = await roomsResponse.json();
                const bookingsData = await bookingsResponse.json();

                setSalas(roomsData || []);
                setMyBookings(bookingsData || []);
            } catch (err) {
                setError(err.message || "Erro ao carregar a página.");
            } finally {
                setLoadingPage(false);
            }
        }

        loadPageData();
    }, [navigate]);

    useEffect(() => {
        if (selectedRoom && form.dataISO) {
            fetchAvailability(selectedRoom.id, form.dataISO);
        }
    }, [selectedRoom, form.dataISO]);

    async function fetchAvailability(roomId, dataISO) {
        if (!roomId || !dataISO) {
            setAvailability(null);
            return;
        }

        const token = localStorage.getItem("token");
        setLoadingAvailability(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/bookings/availability?roomId=${roomId}&date=${dataISO}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Não foi possível carregar a disponibilidade.");
            }

            const data = await response.json();
            setAvailability(data);
        } catch (err) {
            setError(err.message || "Erro ao buscar disponibilidade.");
            setAvailability(null);
        } finally {
            setLoadingAvailability(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        setForm((prev) => {
            const next = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            if (name === "naoSeAplica" && checked) {
                next.curso = "";
            }

            return next;
        });
    }

    function handlePeriodToggle(periodId) {
        setSelectedPeriodIds((prev) =>
            prev.includes(periodId)
                ? prev.filter((id) => id !== periodId)
                : [...prev, periodId]
        );
    }

    const roomStatusMap = myBookings.reduce((acc, booking) => {
        if (booking.bookingDate) {
            acc[booking.bookingDate] = booking.status;
        }
        return acc;
    }, {});

    function handleRoomSelect(room) {
        const dataISO = form.dataISO;
        if (!dataISO) {
            setError("Selecione uma data antes de escolher uma sala.");
            return;
        }

        setSelectedRoom(room);
        setForm((prev) => ({
            ...prev,
            espaco: room.name,
            roomId: room.id,
        }));
        setSelectedPeriodIds([]);
        setPeriodDropdownOpen(false);
        setModalOpen(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!form.roomId || selectedPeriodIds.length === 0 || !form.dataISO || !form.motivo) {
            setError("Preencha a data, sala, um ou mais períodos e o motivo para solicitar a reserva.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const notes = form.naoSeAplica
            ? "Não se aplica"
            : `Curso: ${form.curso || "-"}`;

        const results = [];
        const failures = [];

        try {
            setLoadingSubmit(true);

            for (const periodId of selectedPeriodIds) {
                const body = {
                    roomId: form.roomId,
                    periodId: Number(periodId),
                    bookingDate: form.dataISO,
                    subject: form.motivo,
                    notes,
                };

                const response = await fetch("/api/bookings", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    failures.push({ date: form.dataISO, message: errorText || "Falha ao solicitar a reserva." });
                    continue;
                }

                const booking = await response.json();
                results.push(booking);
            }

            if (results.length > 0) {
                const message = results.length === 1
                    ? "Reserva solicitada com sucesso. Aguarde aprovação."
                    : `${results.length} reservas solicitadas com sucesso. Aguarde aprovação.`;
                setSuccess(message);
                setSelectedRoom(null);
                setAvailability(null);
                setSelectedPeriodIds([]);
                setPeriodDropdownOpen(false);
                setForm((prev) => ({
                    ...prev,
                    espaco: "",
                    roomId: null,
                    motivo: "",
                    curso: "",
                    naoSeAplica: false,
                }));
            }

            if (failures.length > 0) {
                const failureMessages = failures
                    .map((failure) => `${failure.date}: ${failure.message}`)
                    .join("; ");
                setError(`Algumas reservas falharam: ${failureMessages}`);
            }

            await loadMyBookings(token);
        } catch (err) {
            setError(err.message || "Erro ao enviar a solicitação.");
        } finally {
            setLoadingSubmit(false);
        }
    }

    async function loadMyBookings(token) {
        try {
            const response = await fetch("/api/bookings/my", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Falha ao carregar suas reservas.");
            }

            const data = await response.json();
            setMyBookings(data || []);
        } catch (err) {
            setError(err.message || "Erro ao atualizar reservas.");
        }
    }

    const availablePeriods = availability?.periods?.filter((period) => period.available) || [];
    const selectedPeriodLabel = selectedPeriodIds.length === 0
        ? "Selecione os períodos"
        : `${selectedPeriodIds.length} período${selectedPeriodIds.length > 1 ? "s" : ""} selecionado${selectedPeriodIds.length > 1 ? "s" : ""}`;

    if (loadingPage) {
        return (
            <>
                <Navbar activePage="SolicitaReserva" />
                <PageHero
                    variant="SolicitaReserva"
                    tag="Painel Operacional"
                    title="Solicitação de Reserva"
                    description="Carregando dados de salas e reservas..."
                />
                <div className="content-solicitarReserva">
                    <div className="form-title">Carregando informações...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar activePage="SolicitaReserva" />

            <PageHero
                variant="SolicitaReserva"
                tag="Painel Operacional"
                title="Solicitação de Reserva"
                description="Gerencie as reservas de salas e visualize o histórico de solicitações."
            />

            <div className="content-solicitarReserva">
                <div className="div-calendario">
                    <div className="title-calendario">
                        <h3>Minhas Reservas:</h3>
                        <p>Selecione uma data para iniciar uma reserva.</p>
                    </div>

                    <Calendar
                        onChange={(value) => {
                            setDate(value);
                            const year = value.getFullYear();
                            const month = String(value.getMonth() + 1).padStart(2, "0");
                            const day = String(value.getDate()).padStart(2, "0");
                            const dataISO = `${year}-${month}-${day}`;

                            setForm((prev) => ({
                                ...prev,
                                data: value.toLocaleDateString("pt-BR"),
                                dataISO,
                            }));
                            setSelectedRoom(null);
                            setAvailability(null);
                            setSelectedPeriodIds([]);
                            setPeriodDropdownOpen(false);
                            setModalOpen(true);
                        }}
                        value={date}
                        tileClassName={({ date }) => {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            const dataISO = `${year}-${month}-${day}`;

                            if (dataISO === form.dataISO) return "dia-selecionado";

                            const status = roomStatusMap[dataISO];
                            if (status === "APPROVED") return "dia-aceita";
                            if (status === "PENDING") return "dia-pendente";
                            if (status === "CANCELLED") return "dia-cancelada";
                            return null;
                        }}
                        locale="pt-BR"
                        formatShortWeekday={(locale, date) =>
                            date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
                        }
                    />

                    <div className="legenda">
                        <div><span className="box verde"></span> Aceita</div>
                        <div><span className="box amarelo"></span> Pendente</div>
                        <div><span className="box vermelho"></span> Cancelada</div>
                        <div><span className="box cinza"></span> Selecionado</div>
                    </div>

                    <div className="reservas-feitas">
                        <h4>Horários Reservados:</h4>
                        <div className="lista-horarios">
                            {myBookings.map((booking) => (
                                <p key={booking.id}>
                                    <span className="hora">
                                        {booking.bookingDate} • {booking.periodStart?.slice(0, 5) || "--:--"} - {booking.periodEnd?.slice(0, 5) || "--:--"}
                                    </span>
                                    <span className="prof">{booking.roomName}</span>
                                </p>
                            ))}
                            {myBookings.length === 0 && <p>Nenhuma reserva encontrada.</p>}
                        </div>
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-espacos" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-topo">
                                <h2>Espaços disponíveis</h2>
                                <button
                                    className="btn-close-modal"
                                    onClick={() => setModalOpen(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="lista-salas">
                                {salas.filter((sala) => sala.bookable === 1).map((sala) => (
                                    <button
                                        key={sala.id}
                                        className="btn-sala"
                                        type="button"
                                        onClick={() => handleRoomSelect(sala)}
                                    >
                                        <span className="sala-nome">{sala.name}</span>
                                        <span className="sala-andar">{sala.location || sala.notes || "Local não informado"}</span>
                                    </button>
                                ))}

                                {salas.filter((sala) => sala.bookable === 1).length === 0 && (
                                    <div className="sem-salas">
                                        Nenhuma sala ativa encontrada.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="div-forms-reserva">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="form-title" style={{ color: "#b91c1c" }}>{error}</div>}
                        {success && <div className="form-title" style={{ color: "#166534" }}>{success}</div>}

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
                                />
                                <input
                                    type="text"
                                    name="espaco"
                                    placeholder="Selecione uma sala"
                                    value={form.espaco}
                                    readOnly
                                    style={{ backgroundColor: "#cfcccc89" }}
                                />
                            </div>
                        </div>

                        <div className="form-group-reserva">
                            <label>Períodos disponíveis:</label>
                            <div className="period-dropdown">
                                <button
                                    type="button"
                                    className="period-dropdown-button"
                                    onClick={() => setPeriodDropdownOpen((prev) => !prev)}
                                    disabled={!selectedRoom || loadingAvailability || availablePeriods.length === 0}
                                >
                                    {selectedPeriodIds.length === 0
                                        ? "Selecione os períodos"
                                        : `${selectedPeriodIds.length} período${selectedPeriodIds.length > 1 ? "s" : ""} selecionado${selectedPeriodIds.length > 1 ? "s" : ""}`}
                                    <span className="dropdown-arrow">▾</span>
                                </button>
                                {periodDropdownOpen && (
                                    <div className="period-dropdown-options">
                                        {availablePeriods.length === 0 ? (
                                            <small>{selectedRoom ? "Nenhum período disponível para essa sala nesta data." : "Selecione uma sala para ver os períodos disponíveis."}</small>
                                        ) : (
                                            availablePeriods.map((period) => (
                                                <label key={period.periodId} className="period-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        name="periodIds"
                                                        value={period.periodId}
                                                        checked={selectedPeriodIds.includes(period.periodId)}
                                                        onChange={() => handlePeriodToggle(period.periodId)}
                                                    />
                                                    {period.periodName} — {period.startTime?.slice(0, 5)} às {period.endTime?.slice(0, 5)}
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
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
                                required={!form.naoSeAplica}
                                disabled={form.naoSeAplica}
                                style={{ backgroundColor: form.naoSeAplica ? "#cfcccc89" : "white" }}
                            >
                                <option value="">Selecione um curso</option>
                                <option value="dsm">Desenvolvimento de Software Multiplataforma</option>
                                <option value="admin">Administração</option>
                                <option value="rh">Recursos Humanos</option>
                                <option value="ads">Análise e Desenvolvimento de Sistemas</option>
                                <option value="comex">Comércio Exterior</option>
                            </select>
                        </div>


                        <div className="form-group-reserva-check">
                            <p>Caso a reserva não se aplique a um curso, selecione a opção "Não se aplica"</p>
                            <input
                                type="checkbox"
                                name="naoSeAplica"
                                checked={form.naoSeAplica}
                                onChange={handleChange}
                            /> Não se aplica
                        </div>

                        <button type="submit" className="btn-submit-reserva" disabled={loadingSubmit}>
                            {loadingSubmit ? "Enviando..." : "Solicitar reserva"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
