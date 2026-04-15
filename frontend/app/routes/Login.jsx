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
    const [form, setForm] = useState({
        email: "",
        senha: "",
    });
    const navigate = useNavigate();

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.senha
                })
            });
            if (!response.ok) {
                let errorMessage = 'Erro no login';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Se não conseguir fazer parse do JSON, usa o status text
                    errorMessage = response.statusText || `Erro ${response.status}`;
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('authlevel', data.authlevel);
            setSubmitted(true);
            // Redirecionar baseado no authlevel
            if (data.authlevel === 1) {
                navigate('/coordenador');
            } else {
                navigate('/professor');
            }
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

                {/* Formulário de Login */}
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
                                    placeholder="Ex:joao@professor.cps.sp.gov.br"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        
                            <div className="form-group-cadastro">
                                <label>Senha</label>
                                <input
                                    type="password"
                                    name="senha"
                                    placeholder="Digite sua senha"
                                    value={form.senha}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-submit-cadastro">
                                Entrar
                            </button>
                        </form>

                        <div className="cadastro-link">
                            <h3>Não possui cadastro?</h3>
                            <p>Crie sua conta para começar a utilizar o sistema.</p>

                            
                            <a href="/cadastro">Cadastrar-se</a>
                        </div>

                    </>
                )}
            </div>

            <Footer />
        </>
    );
}
