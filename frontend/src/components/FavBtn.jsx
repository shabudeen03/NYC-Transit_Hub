import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteButton() {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    console.log(isFavorite);
    setIsFavorite(prev => !prev);
  };

  return (
    <button onClick={toggleFavorite} style={{ border: "none", background: "transparent" }}>
      {isFavorite ? (
        <FaHeart color="red" size={24} />
      ) : (
        <FaRegHeart color="red" size={24} />
      )}
    </button>
  );
}
