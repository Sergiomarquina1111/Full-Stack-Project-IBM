import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Dealer({ username }) {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/djangoapp/dealer/${id}`)
      .then((r) => r.json())
      .then((data) => setDealer(data.dealer || null))
      .catch(() => setError("Could not load dealer."));
    fetch(`/djangoapp/reviews/dealer/${id}`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setError("Could not load reviews."));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!dealer) return <p>Loading...</p>;

  return (
    <div>
      <h1>{dealer.full_name}</h1>
      <p>{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p>
      {username ? (
        <Link to={`/postreview/${dealer.id}`}><button className="btn">Write a review</button></Link>
      ) : (
        <p><Link to="/login">Log in</Link> to write a review.</p>
      )}
      <h2>Reviews</h2>
      {reviews.length === 0 && <p>No reviews yet.</p>}
      {reviews.map((r) => (
        <div className="review-card" key={r.id}>
          <p><strong>{r.name}</strong> reviewed {r.car_make} {r.car_model} {r.car_year}{" "}
            <span className={`badge ${r.sentiment}`}>{r.sentiment}</span></p>
          <p>{r.review}</p>
          {r.purchase && <p><em>Purchased on {r.purchase_date}</em></p>}
        </div>
      ))}
    </div>
  );
}
