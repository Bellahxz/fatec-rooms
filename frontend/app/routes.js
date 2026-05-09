// routes.js
import { index, route } from "@react-router/dev/routes";


export default [
  index("routes/Login.jsx"),
  route("contato", "routes/Contato.jsx"),
  route("coordenador", "routes/Coordenador.jsx"),
  route("gerenciar-salas", "routes/GerenciarSalas.jsx"),
  route("salas-adicionar", "routes/AdicionarSala.jsx"),
  route("salas-editar", "routes/EditarSala.jsx"),
  route("salas-remover", "routes/RemoverSala.jsx"),
  route("professor", "routes/Professor.jsx"),
  route("cadastro", "routes/Cadastro.jsx"),
  route("confirmar", "routes/Confirmar.jsx"),
  route("solicitar-reserva", "routes/SolicitaReserva.jsx"),
  route("minhas-reservas", "routes/MinhasReservas.jsx"),
  route("cadastro-salas", "routes/CadastroSalas.jsx"),
  route("perfil", "routes/Perfil.jsx"),
  route("relatorio-reservas", "routes/RelatorioReservas.jsx"),
  route("todas-reservas", "routes/TodasReservas.jsx"),
  route("configuracao", "routes/Configuracao.jsx"),
  route("coordenador-solicitacoes", "routes/CoordenadorSolicitacoes.jsx"),
  route("redefinir-senha", "routes/RedefinirSenha.jsx"),
  route("esqueci-senha", "routes/EsqueciSenha.jsx"),
  route("gerenciar-usuarios", "routes/GerenciarUsuario.jsx"),

];