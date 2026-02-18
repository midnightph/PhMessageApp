import { auth } from "../services/firebase"

function Home (){
    const user = auth.currentUser;
    console.log(user);

    return (
        <div>
            <h1>Bem vindo {user.displayName}</h1>
        </div>
    )
}

export default Home