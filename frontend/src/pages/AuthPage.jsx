import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1>Authentication</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      /><br />

      <input
        placeholder="Password (min 8 chars)"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br />

      <button onClick={() => login(username, password)}>Sign In</button>
      <button onClick={() => register(username, password)}>Register</button>
    </div>
  );
}
