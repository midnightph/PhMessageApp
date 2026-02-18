import { useState } from 'react'
import '../App.css'
import { signUp, loginWithGoogle, recoverPassword } from '../services/authService'
import { useNavigate } from "react-router-dom";

function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
                    <h1>Seja bem-vindo</h1>
                    <h3 className='subtitle'>Para completar seu cadastro preencha as informações</h3>

                    <div className='inputs'>
                        <input type="text" placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={email} />
                        <input type="password" placeholder='Senha' onChange={(e) => setPassword(e.target.value)} value={password} />
                        <input type="password" placeholder='Confirme a senha' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            setError('');

                            const result = await signUp(email, password, confirmPassword);

                            setLoading(false);

                            if (result.error) {
                                setError(result.error);
                                return;
                            }
                            navigate('/home');
                        }}
                    >
                        {loading ? <div className="spinner"></div> : "Cadastrar-se"}
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

                            navigate('/home');
                        }}
                    >
                        {googleLoading ? <div className="spinnerGoogle"></div> : (<><img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google"
                        />
                            Entrar com Google</>)}
                    </button>
                    {error && <p className='error'>{error}</p>}
                    {error === 'Email já cadastrado' && <h3 className='recoverPassword'
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
                            onClick={()=> setRecoverPasswordMessage('')}
                        >
                            Enviamos um email. Clique aqui para abrir o Gmail.
                        </a>
                    )}
                    <div className='divider'></div>

                    <h2>Já possui uma conta?</h2>
                    <a href="/">Faça login</a>
                </div>

            </div>
        </>
    )
}

export default SignUp
