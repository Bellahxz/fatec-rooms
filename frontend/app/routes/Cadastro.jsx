import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export async function loader() {
    return null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const DOMINIOS_PERMITIDOS = [
    "professor.cps.sp.gov.br",
    "cps.sp.gov.br",
    "gmail.com",
];

function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return "Informe seu e-mail institucional.";
    }
    if (email.includes("..")) {
        return "O e-mail não pode conter pontos consecutivos.";
    }
    if (!EMAIL_REGEX.test(email)) {
        return "Formato de e-mail inválido (ex: joao@professor.cps.sp.gov.br).";
    }
    const domain = email.split("@")[1].toLowerCase();
    if (!DOMINIOS_PERMITIDOS.includes(domain)) {
        return "Apenas e-mails institucionais são permitidos (ex: joao@professor.cps.sp.gov.br).";
    }
    return null;
}

function validateNome(nome) {
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "Informe seu nome completo.";
    if (parts.length < 2) return "Informe nome e sobrenome (ex: João Silva).";
    if (parts.some((p) => p.length < 2)) return "Cada parte do nome deve ter ao menos 2 letras.";
    if (/[0-9]/.test(nome)) return "O nome não pode conter números.";
    return null;
}

function validateSenha(senha) {
    if (!senha || senha.length === 0) return "Informe uma senha.";
    if (senha.length < 6) return "A senha deve ter ao menos 6 caracteres.";
    if (senha.length > 64) return "A senha deve ter no máximo 64 caracteres.";
    if (/^(.)\1+$/.test(senha)) return "A senha não pode conter caracteres repetidos.";
    if (senha.includes(" ")) return "A senha não pode conter espaços.";
    return null;
}

function parseRegisterError(message) {
    if (!message) return "Erro no cadastro. Tente novamente mais tarde.";
    if (message.includes("Username já está em uso")) return "Usuário já cadastrado. Verifique seu e-mail institucional ou use outro login.";
    if (message.includes("E-mail já está em uso")) return "E-mail já cadastrado. Use outro endereço ou faça login.";
    if (message.includes("Senha deve ter ao menos 6 caracteres")) return "A senha deve ter ao menos 6 caracteres.";
    if (message.toLowerCase().includes("notblank") || message.toLowerCase().includes("invalid")) return "Preencha todos os campos corretamente.";
    return message;
}

export default function Cadastro() {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
    });
    const navigate = useNavigate();

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        const nomeError = validateNome(form.nome);
        if (nomeError) { setError(nomeError); return; }

        const emailError = validateEmail(form.email.trim());
        if (emailError) { setError(emailError); return; }

        const senhaError = validateSenha(form.senha);
        if (senhaError) { setError(senhaError); return; }

        if (!form.confirmarSenha || form.confirmarSenha.length === 0) {
            setError("Confirme sua senha."); return;
        }
        if (form.senha !== form.confirmarSenha) {
            setError("As senhas não coincidem. Verifique e tente novamente."); return;
        }

        try {
            const nameParts = form.nome.trim().split(/\s+/).filter(Boolean);
            const [firstname, ...lastnameParts] = nameParts;
            const lastname = lastnameParts.join(" ");

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email: form.email.trim(),
                    username: form.email.split("@")[0],
                    password: form.senha,
                    displayname: form.nome,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(parseRegisterError(errorText));
            }

            await response.text();
            setSubmitted(true);
            setTimeout(() => navigate("/"), 3000);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            <Navbar activePage="Cadastro" />

            <PageHero
                className="page-hero-cadastro"
                tag="Área de Cadastro"
                title="Cadastro do Usuário"
                description="Crie sua conta para acessar o sistema."
            />

            <div className="content">
                {submitted ? (
                    <div className="success-msg">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3>Cadastro realizado com sucesso!</h3>
                        <p>Seu cadastro ficará pendente de aprovação por um coordenador. Você será redirecionado para o login em breve.</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="error-msg">
                                <p>{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group-cadastro">
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    name="nome"
                                    placeholder="Ex: João Silva"
                                    value={form.nome}
                                    onChange={handleChange}
                                    required
                                />
                                <small className="form-help">Informe nome e sobrenome, sem números.</small>
                            </div>
                            <div className="form-group-cadastro">
                                <label>E-mail institucional</label>
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="joao@professor.cps.sp.gov.br"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                <small className="form-help">Use seu e-mail institucional válido.</small>
                            </div>
                            <div className="form-group-cadastro">
                                <label>Crie sua senha</label>
                                <div className="input-with-icon">
                                    <input
                                        type={showSenha ? "text" : "password"}
                                        name="senha"
                                        placeholder="Digite sua senha"
                                        value={form.senha}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowSenha((prev) => !prev)}
                                        aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showSenha ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                <small className="form-help">Mínimo 6 caracteres, sem espaços ou repetições.</small>
                            </div>
                            <div className="form-group-cadastro">
                                <label>Confirme sua senha</label>
                                <div className="input-with-icon">
                                    <input
                                        type={showConfirmSenha ? "text" : "password"}
                                        name="confirmarSenha"
                                        placeholder="Confirme sua senha"
                                        value={form.confirmarSenha}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmSenha((prev) => !prev)}
                                        aria-label={showConfirmSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showConfirmSenha ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-cadastro">
                                Cadastrar-se
                            </button>
                        </form>
                    </>
                )}
            </div>

            <Footer />
        </>
    );
}