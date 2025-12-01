import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Header from "../components/Header";
import "../stylesheets/Profile.css";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    //fetch all favorited station Ids
    fetchData();
  }, []);

  const fetchData = async() => {
    try {
      const res = await axios.get("http://localhost:5000/user/favorites/all", {
        headers: {
            "x-user-id": user.id
        }
    });
      // setData(res.data.data);
      console.log(res.data.data);
      setData(res.data.data);
    } catch (err) {
      console.error(err.message);
    }
  }

  const removeFav = async (fid) => {
    await axios.delete("http://localhost:5000/user/favorites/update", {
        params: { fid: fid },
        headers: { "x-user-id": user.id }
    });

    await fetchData();
  };

  if (!user) return <h2>You must log in.</h2>;

  return (
  <>
    <Header name="default-header" />
    <div className="profile-container">
      <h1 className="profile-title">User Profile</h1>
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Account Created on:</strong> {user.account_created}</p>
      </div>

      <hr className="profile-divider"/>
      {data && data.length > 0 && (<>
        <h2 className="favorites-title">Favorited Stations</h2>
        <div className="favorites-grid">
          {data.map((d) => (
            <div key={crypto.randomUUID()} className="favorite-card">
              <p className="favorite-name">{d.stop_name}</p>
              <button className="favorite-remove" onClick={() => removeFav(d.stop_id)}>Remove Favorite</button>
            </div>
          ))}
        </div>
      </>)}
      {(!data || data.length === 0) && <h2 className="no-favorites">No Stations Favorited</h2>}
    </div>
  </>);
}
