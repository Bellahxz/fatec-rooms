import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

export async function loader() {
    return null;
}

export default function Login() {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", senha: "" });
    const navigate = useNavigate();

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function parseLoginError(message, status) {
        if (!message) {
            return status === 401
                ? "E-mail ou senha incorretos. Verifique seus dados e tente novamente."
                : "Erro no login. Tente novamente mais tarde.";
        }
        const text = message.toLowerCase();
        if (text.includes("usuário ou senha inválidos") || text.includes("credenciais"))
            return "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
        if (text.includes("cadastro ainda não foi aprovado") || text.includes("não foi aprovado"))
            return "Seu cadastro ainda não foi aprovado por um coordenador. Aguarde aprovação antes de entrar.";
        if (text.includes("enabled") || text.includes("bloqueado"))
            return "Sua conta está bloqueada. Entre em contato com o coordenador.";
        return message;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (!form.email.trim() || !form.senha.trim()) {
            setError("Preencha e-mail e senha para continuar.");
            return;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.senha }),
            });

            if (!response.ok) {
                let errorMessage = "Erro no login";
                try {
                    const errorData = await response.json();
                    errorMessage = parseLoginError(errorData.message || errorData.error || "", response.status);
                } catch {
                    const text = await response.text();
                    errorMessage = parseLoginError(text, response.status);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("authlevel", data.authlevel);
            setSubmitted(true);

            if (data.authlevel === 1) navigate("/coordenador");
            else navigate("/professor");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            <Navbar activePage="Login" />

            <PageHero
                className="page-hero-cadastro"
                tag="Área de Login"
                title="Login do Usuário"
                description="Acesse sua conta para acessar o sistema."
            />

            <div className="content">
                {submitted ? (
                    <div className="success-msg">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3>Login realizado com sucesso!</h3>
                        <p>Redirecionando...</p>
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
                                <label>E-mail institucional</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Ex: joao@professor.cps.sp.gov.br"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group-cadastro">
                                <label>Senha</label>
                                <div className="input-with-icon">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="senha"
                                        placeholder="Digite sua senha"
                                        value={form.senha}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-cadastro">
                                Entrar
                            </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: 8 }}>
                            <a
                                href="/esqueci-senha"
                                style={{
                                    color: "#1976d2",
                                    fontSize: 13,
                                    textDecoration: "none",
                                    fontWeight: 500,
                                }}
                                onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                            >
                                Esqueci minha senha
                            </a>
                        </div>
                        <div className="cadastro-link">
                            <h3>Não possui cadastro?</h3>
                            <p>Crie sua conta para começar a utilizar o sistema.</p>
                            <a href="/cadastro" className="btn-submit-cadastro">
                                Cadastrar-se
                            </a>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </>
    );
}