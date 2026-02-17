import { useState } from 'react'
import './App.css'

function App() {

  return (
    <>
      <div className='header'>

      </div>
      <div className='main'>
        <div className='card'>
          <h1 style={{ paddingBottom: '20px' }}>Seja bem-vindo</h1>

          <div className='inputs'>
            <input type="text" placeholder='Email' />
            <input type="password" placeholder='Senha' />
          </div>

          <button type='submit'>Entrar</button>

          <button className="google-btn">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
            />
            Entrar com Google
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
