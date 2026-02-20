import { useState } from 'react'
import '../App.css'
import { login, loginWithGoogle, recoverPassword } from '../services/authService'
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [recoverPasswordMessage, setRecoverPasswordMessage] = useState(false);

    return (
        <>
            <div className='header'>

            </div>
            <div className='main'>
                <div className='card'>
                    <h1 style={{ paddingBottom: '20px' }}>Seja bem-vindo</h1>

                    <div className='inputs'>
                        <input type="text" placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={email} />
                        <input type="password" placeholder='Senha' onChange={(e) => setPassword(e.target.value)} value={password} onKeyDown={async () => {
                            setLoading(true);
                            setError('');

                            const result = await login(email, password);

                            setLoading(false);

                            if (result.error) {
                                setError(result.error);
                                return;
                            }
                            navigate('/');
                        }} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            setError('');

                            const result = await login(email, password);

                            setLoading(false);

                            if (result.error) {
                                setError(result.error);
                                return;
                            }
                            navigate('/');
                        }}
                    >
                        {loading ? <div className="spinner" style={{
                            width: '18px',
                            height: '18px',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '3px solid white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto'
                        }}></div> : "Entrar"}
                    </button>

                    <button
                        className="google-btn"
                        onClick={async () => {
                            setGoogleLoading(true);
                            setError('');
                            const result = await loginWithGoogle();
                            setGoogleLoading(false);
                            if (result.error) {
                                setError(result.error);
                                return;
                            }

                            navigate('/');
                        }}
                    >
                        {googleLoading ? <div className="spinnerGoogle"></div> : (<><img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google"
                        />
                            Entrar com Google</>)}
                    </button>
                    {error && <p className='error'>{error}</p>}
                    {error === 'Email ou senha incorretos' && <h3 className='recoverPassword'
                        onClick={async () => {
                            const result = await recoverPassword(email)
                            if (result.success) {
                                setError('');
                                setRecoverPasswordMessage(true)
                            }
                        }}>Recuperar senha</h3>}
                    {recoverPasswordMessage && (
                        <a
                            href="https://mail.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="recoverPassword"
                            onClick={() => setRecoverPasswordMessage('')}
                        >
                            Enviamos um email. Clique aqui para abrir o Gmail.
                        </a>
                    )}
                    <div className='divider'></div>

                    <h2>Ainda não possui uma conta?</h2>
                    <a href="/signUp">Cadastre-se</a>
                </div >

            </div >
        </>
    )
}

export default Login
