import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageHero from "../components/PageHero";
import Footer from "../components/Footer";

export default function RedefinirSenha() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const isInvalid = !token;

    const [senha, setSenha] = useState("");
    const [confirma, setConfirma] = useState("");
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirma, setShowConfirma] = useState(false);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);

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

        if (!senha) return setErro("Digite a nova senha.");
        if (strength < 2) return setErro("Senha fraca.");
        if (senha !== confirma) return setErro("As senhas não coincidem.");

        setLoading(true);

        try {
            const response = await fetch("/api/users/password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: senha
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao redefinir senha");
            }

            setSucesso(true);
        } catch {
            setErro("Erro ao redefinir senha.");
        } finally {
            setLoading(false);
        }
    }

    // ❌ TOKEN INVÁLIDO
    if (isInvalid) {
        return (
            <>
                <Navbar activePage="Login" />
                <PageHero
                    tag="Segurança"
                    title="Redefinir Senha"
                    description="Link inválido ou expirado"
                />

                <div className="content">
                    <h3>Link inválido ou expirado</h3>
                    <button
                        className="btn-submit-cadastro"
                        onClick={() => navigate("/esqueci-senha")}
                    >
                        Solicitar novo link
                    </button>
                </div>

                <Footer />
            </>
        );
    }

    // ✅ SUCESSO
    if (sucesso) {
        return (
            <>
                <Navbar activePage="Login" />
                <PageHero
                    tag="Segurança"
                    title="Senha redefinida"
                    description="Sua senha foi atualizada"
                />

                <div className="content">
                    <h3>Senha redefinida com sucesso!</h3>
                    <button
                        className="btn-submit-cadastro"
                        onClick={() => navigate("/")}
                    >
                        Ir para login
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
                title="Redefinir Senha"
                description="Crie uma nova senha segura"
            />

            <div className="content">
                {erro && <div className="error-msg">{erro}</div>}

                <form onSubmit={handleSubmit} className="form-reset-senha">

                    {/* SENHA */}
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

                        {/* FORÇA DA SENHA */}
                        {senha.length > 0 && (
                            <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 8 }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            height: 4,
                                            borderRadius: 2,
                                            background: i <= strength ? strengthColors[strength] : "#E8E8E8",
                                            transition: "background 0.3s",
                                        }}
                                    />
                                ))}
                                <span
                                    style={{
                                        fontSize: 12,
                                        marginLeft: 8,
                                        minWidth: 48,
                                        color: strengthColors[strength],
                                    }}
                                >
                                    {strengthLabels[strength]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONFIRMAR SENHA */}
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

                    {/* BOTÃO */}
                    <button type="submit" className="btn-submit-cadastro" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar nova senha"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <a
                        href="/"
                        style={{
                            fontSize: 13,
                            color: "#6B6B6B",
                            fontFamily: "Sora, sans-serif",
                            fontWeight: 600,
                            textDecoration: "none",
                        }}
                    >
                        Voltar para o login
                    </a>
                </div>
            </div>

            <Footer />
        </>
    );
}