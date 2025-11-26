import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{ padding: "20px", background: "#eee" }}>
      <nav style={{ display: "flex", gap: "20px" }}>
        <Link to="/">Home</Link>

        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/auth">Sign In / Register</Link>
        )}
      </nav>
    </header>
  );
}
