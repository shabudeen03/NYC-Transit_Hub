import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Header({ name }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className={name}>
      <nav className="nav-bar" style={{ display: "flex", gap: "20px" }}>
        <Link to="/">Home</Link>

        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/auth">Authenticate</Link>
        )}
      </nav>
    </header>
  );
}
