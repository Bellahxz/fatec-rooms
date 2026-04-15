// routes.js
import { index, route } from "@react-router/dev/routes";


export default [
  index("routes/Login.jsx"),
  route("contato", "routes/Contato.jsx"),
  route("coordenador", "routes/Coordenador.jsx"),
  route("professor", "routes/Professor.jsx"),
  route("cadastro", "routes/Cadastro.jsx"),
  route("confirmar", "routes/Confirmar.jsx"),
  route("solicitar-reserva", "routes/SolicitaReserva.jsx"),
  route("lista-salas", "routes/ListaSalas.jsx"),
  route("minhas-reservas", "routes/MinhasReservas.jsx"),
];