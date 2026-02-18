import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

function Home() {
    const navigate = useNavigate();
    const user = auth.currentUser;
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div>
            <h1>Bem vindo {user.displayName}</h1>
        </div>
    )
}

export default Home