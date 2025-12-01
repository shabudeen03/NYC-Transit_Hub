import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteButton({ isFavorite, toggle }) {
  console.log("State now: " + isFavorite);

  return (
    <button onClick={toggle} style={{ border: "none", background: "transparent" }}>
      {isFavorite ? (
        <FaHeart color="red" size={24} />
      ) : (
        <FaRegHeart color="red" size={24} />
      )}
    </button>
  );
}
