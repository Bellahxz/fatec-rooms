import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function RedefinirSenha() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [senha, setSenha] = useState("");
    const [confirma, setConfirma] = useState("");
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirma, setShowConfirma] = useState(false);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [tokenInvalido, setTokenInvalido] = useState(false);

    useEffect(() => {
        if (!token) setTokenInvalido(true);
    }, [token]);

    function getStrength(pass) {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    }

    const strength = getStrength(senha);
    const strengthColors = ["", "#E24B4A", "#EF9F27", "#639922", "#0F6E56"];
    const strengthLabels = ["", "Fraca", "Regular", "Boa", "Forte"];

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");

        if (!senha) return setErro("Por favor, digite sua nova senha.");
        if (strength < 2) return setErro("Senha muito fraca. Use ao menos 8 caracteres com maiúsculas e números.");
        if (senha !== confirma) return setErro("As senhas não coincidem.");

        setLoading(true);
        try {
            const response = await fetch("/api/users/password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, novaSenha: senha }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const msg = data.message || "";
                if (msg.toLowerCase().includes("expirad") || msg.toLowerCase().includes("inválid")) {
                    setTokenInvalido(true);
                } else {
                    setErro(msg || "Erro ao redefinir a senha. Tente novamente.");
                }
                return;
            }

            setSucesso(true);
        } catch {
            setErro("Erro ao redefinir a senha. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    if (tokenInvalido) return (
        <>
            <Navbar activePage="Login" />
            <PageHero
                tag="Segurança"
                title="Redefinir Senha"
                description="Crie uma nova senha segura para sua conta Fatec Rooms"
            />
            <div className="content" style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
                <div style={{
                    textAlign: "center", padding: "32px 20px",
                    background: "#FFF4F4", borderRadius: 16,
                    border: "1.5px solid rgba(192,18,28,0.2)"
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="#C0121C" strokeWidth="1.5" style={{ marginBottom: 14 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, marginBottom: 8 }}>
                        Link inválido ou expirado
                    </h3>
                    <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 20 }}>
                        Este link de redefinição já foi usado ou expirou. Solicite um novo.
                    </p>
                    <button className="btn-submit-cadastro" onClick={() => navigate("/esqueci-senha")}>
                        Solicitar novo link
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );

    if (sucesso) return (
        <>
            <Navbar activePage="Login" />
            <PageHero
                tag="Segurança"
                title="Redefinir Senha"
                description="Crie uma nova senha segura para sua conta Fatec Rooms"
            />
            <div className="content" style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
                <div className="success-msg">
                    <div className="success-icon">
                        <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h3>Senha redefinida com sucesso!</h3>
                    <p>Sua senha foi atualizada. Você já pode fazer login.</p>
                    <button
                        className="btn-submit-cadastro"
                        style={{ marginTop: 20 }}
                        onClick={() => navigate("/")}
                    >
                        Ir para o login
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Navbar activePage="Login" />
            <PageHero
                tag="Segurança"
                title="Redefinir Senha"
                description="Crie uma nova senha segura para sua conta Fatec Rooms"
            />

            <div className="content" style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
                <div style={{
                    background: "white", borderRadius: 16,
                    border: "1.5px solid #E8E8E8", padding: "28px 24px"
                }}>
                    {erro && <div className="error-msg">{erro}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-cadastro">
                            <label>Nova senha</label>
                            <div className="input-with-icon">
                                <input
                                    type={showSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="Digite sua nova senha"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowSenha((v) => !v)}
                                >
                                    {showSenha ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {senha.length > 0 && (
                                <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 8 }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} style={{
                                            flex: 1, height: 4, borderRadius: 2,
                                            background: i <= strength ? strengthColors[strength] : "#E8E8E8",
                                            transition: "background 0.3s"
                                        }} />
                                    ))}
                                    <span style={{ fontSize: 12, marginLeft: 8, minWidth: 48, color: strengthColors[strength] }}>
                                        {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                            <span className="form-help">
                                Mínimo 8 caracteres, com letra maiúscula e número.
                            </span>
                        </div>

                        <div className="form-group-cadastro">
                            <label>Confirmar nova senha</label>
                            <div className="input-with-icon">
                                <input
                                    type={showConfirma ? "text" : "password"}
                                    value={confirma}
                                    onChange={(e) => setConfirma(e.target.value)}
                                    placeholder="Repita a nova senha"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirma((v) => !v)}
                                >
                                    {showConfirma ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit-cadastro"
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar nova senha"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        
                            href="/"
                            style={{
                                fontSize: 13, color: "#6B6B6B",
                                fontFamily: "Sora, sans-serif",
                                fontWeight: 600, textDecoration: "none",
                            }}
                        <a>
                            Voltar para o login
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}