import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function EsqueciSenha() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");

        if (!email) {
            return setErro("Digite seu email.");
        }

        setLoading(true);

        try {
            const response = await fetch("/api/users/password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error();
            }

            setSucesso(true);
        } catch {
            setErro("Erro ao enviar solicitação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    if (sucesso) {
        return (
            <>
                <Navbar activePage="Login" />
                <PageHero
                    tag="Segurança"
                    title="Verifique seu email"
                    description="Se o email estiver cadastrado, enviaremos um link para redefinição"
                />

                <div className="content">
                    <h3>Solicitação enviada!</h3>
                    <p>Verifique sua caixa de entrada (e spam).</p>

                    <button
                        className="btn-submit-cadastro"
                        onClick={() => navigate("/")}
                    >
                        Voltar para o login
                    </button>
                </div>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar activePage="Login" />

            <PageHero
                tag="Segurança"
                title="Esqueci minha senha"
                description="Informe seu email para receber o link de recuperação"
            />

            <div className="content">
                {erro && <div className="error-msg">{erro}</div>}

                <form onSubmit={handleSubmit} className="form-reset-senha">
                    <div className="form-group-cadastro">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-cadastro"
                        disabled={loading}
                    >
                        {loading ? "Enviando..." : "Enviar link de recuperação"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <a href="/">Voltar para o login</a>
                </div>
            </div>

            <Footer />
        </>
    );
}