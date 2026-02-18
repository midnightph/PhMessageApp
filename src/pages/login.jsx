import { useState } from 'react'
import '../App.css'
import { login, loginWithGoogle } from '../services/authService'

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    return (
        <>
            <div className='header'>

            </div>
            <div className='main'>
                <div className='card'>
                    <h1 style={{ paddingBottom: '20px' }}>Seja bem-vindo</h1>

                    <div className='inputs'>
                        <input type="text" placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={email} />
                        <input type="password" placeholder='Senha' onChange={(e) => setPassword(e.target.value)} value={password} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);

                            const result = await login(email, password);

                            setLoading(false);

                            if (result.error) {
                                alert(result.error);
                            }

                            if (result.success) {
                                alert('Login realizado com sucesso!');
                            }
                        }}
                    >
                        {loading ? <div className="spinner"></div> : "Entrar"}
                    </button>

                    <button
                        className="google-btn"
                        onClick={async () => {
                            setGoogleLoading(true);
                            const result = await loginWithGoogle();
                            setGoogleLoading(false);
                            if (result.error) {
                                alert(result.error);
                                return;
                            }

                            console.log("Usuário logado:", result.user);
                        }}
                    >
                        {googleLoading ? <div className="spinnerGoogle"></div> : (<><img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google"
                        />
                        Entrar com Google</>) }
                    </button>
                    <div className='divider'></div>

                    <h2>Ainda não possui uma conta?</h2>
                    <a href="">Cadastre-se</a>
                </div>

            </div>
        </>
    )
}

export default App
