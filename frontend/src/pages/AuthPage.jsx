import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import "../stylesheets/Auth.css";

import Header from "../components/Header";

export default function AuthPage() {
  const { login, register } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // return (
  //   <div>
  //     <Header />
  //     <h1>Authentication</h1>

  //     <input
  //       placeholder="Username"
  //       value={username}
  //       onChange={e => setUsername(e.target.value)}
  //     /><br />

  //     <input
  //       placeholder="Password (min 8 chars)"
  //       type="password"
  //       value={password}
  //       onChange={e => setPassword(e.target.value)}
  //     /><br />

  //     <button onClick={() => login(username, password)}>Sign In</button>
  //     <button onClick={() => register(username, password)}>Register</button>
  //   </div>
  // );
  return (<>
    <Header name="default-header" />
    <div className="auth-page">
      <div className="auth-card">
        <h1>Authentication</h1>

        <input
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Password (min 8 chars)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="auth-buttons">
          <button className="auth-btn primary" onClick={() => login(username, password)}>
            Sign In
          </button>

          <button className="auth-btn" onClick={() => register(username, password)}>
            Register
          </button>
        </div>
      </div>
    </div>
  </>);
}
