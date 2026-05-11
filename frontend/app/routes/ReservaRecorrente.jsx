import { useState } from "react";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ReservaRecorrente() {
  const [date, setDate] = useState(new Date());

  const [form, setForm] = useState({
    semestre: "",
    curso: "",
    semestreTurma: "",
    horaInicio: "",
    horaFim: "",
    sala: "",
  });

  const [diasSelecionados, setDiasSelecionados] = useState([]);

  const reservasRecorrentes = [
    {
      curso: "DSM",
      sala: "Laboratório 204",
      horario: "19:00 às 22:30",
      dias: "SEG • QUA",
    },
    {
      curso: "ADS",
      sala: "Sala 101",
      horario: "08:00 às 11:30",
      dias: "TER • QUI",
    },
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleDia(dia) {
    setDiasSelecionados((prev) =>
      prev.includes(dia)
        ? prev.filter((d) => d !== dia)
        : [...prev, dia]
    );
  }

  function gerarDatasSemestre() {
    if (!form.semestre) return [];

    let inicio;
    let fim;

    if (form.semestre === "1") {
      inicio = new Date(2026, 1, 1);
      fim = new Date(2026, 5, 30);
    } else {
      inicio = new Date(2026, 6, 1);
      fim = new Date(2026, 11, 15);
    }

    const diasMap = {
      SEG: 1,
      TER: 2,
      QUA: 3,
      QUI: 4,
      SEX: 5,
      SAB: 6,
    };

    const datas = [];

    for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
      const diaSemana = data.getDay();

      diasSelecionados.forEach((dia) => {
        if (diaSemana === diasMap[dia]) {
          datas.push(new Date(data).toLocaleDateString("sv-SE"));
        }
      });
    }

    return datas;
  }

  const datasColoridas = gerarDatasSemestre();

  return (
    <>
      <Navbar activePage="ReservaRecorrente" />

      <PageHero
        variant="SolicitaReserva"
        tag="Painel Operacional"
        title="Reserva Recorrente"
        description="Cadastre reservas recorrentes para turmas durante o semestre."
      />

      <div className="content-recorrente">

        {/* ESQUERDA */}
        <div className="box-calendario-recorrente">

          <div className="title-calendario">
            <h3>Calendário do semestre</h3>
            <p>Selecione o semestre e visualize as reservas recorrentes.</p>
          </div>

          <Calendar
            value={date}
            onChange={setDate}
            locale="pt-BR"
            formatShortWeekday={(locale, date) =>
              date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
            }
            tileClassName={({ date }) => {
              const dataISO = date.toLocaleDateString("sv-SE");
              if (datasColoridas.includes(dataISO)) return "dia-recorrente";
              return null;
            }}
          />

          <div className="legenda-recorrente">
            <div><span className="box-legenda vermelho"></span>Dias selecionados para reserva recorrente.</div>
          </div>

          <div className="reservas-recorrentes-box">
            <div className="topo-reservas-recorrentes">
              <h4>Reservas recorrentes</h4>
            </div>

            <div className="lista-recorrentes">
              {reservasRecorrentes.map((item, index) => (
                <div className="item-recorrente" key={index}>
                  <div className="bolinha-recorrente"></div>

                  <div className="info-recorrente">
                    <h5>{item.curso}</h5>
                    <p>{item.sala}</p>
                    <span>{item.horario} • {item.dias}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DIREITA */}
        <div className="box-form-recorrente">

          <form>

            <div className="form-group-recorrente">
              <label>Semestre</label>
              <select name="semestre" value={form.semestre} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="1">1º Semestre</option>
                <option value="2">2º Semestre</option>
              </select>
            </div>

            <div className="form-group-recorrente">
              <label>Curso</label>
              <select name="curso" value={form.curso} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="DSM">DSM</option>
                <option value="ADS">ADS</option>
                <option value="ADM">ADM</option>
              </select>
            </div>

            <div className="form-group-recorrente">
              <label>Semestre da turma</label>
              <select name="semestreTurma" value={form.semestreTurma} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="1">1º</option>
                <option value="2">2º</option>
                <option value="3">3º</option>
                <option value="4">4º</option>
              </select>
            </div>

            <div className="form-group-recorrente">
              <label>Horário</label>

              <div className="horario-recorrente">
                <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} />
                <span>até</span>
                <input type="time" name="horaFim" value={form.horaFim} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group-recorrente">
              <label>Dias da Semana com Aula Presencial</label>

              <div className="dias-semana">
                {["SEG","TER","QUA","QUI","SEX","SAB"].map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    className={`dia-btn ${diasSelecionados.includes(dia) ? "ativo" : ""}`}
                    onClick={() => toggleDia(dia)}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group-recorrente">
              <label>Sala</label>
              <select name="sala" value={form.sala} onChange={handleChange}>
                <option value="">Selecione</option>
                <option>Laboratório 204</option>
                <option>Sala 101</option>
                <option>Sala 102</option>
              </select>
            </div>

            <button className="btn-recorrente" type="submit">
              Reservar
            </button>

          </form>

        </div>
      </div>

      <Footer />
    </>
  );
}