import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PostReview({ username }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({
    dealership: id || "",
    review: "",
    purchase: false,
    purchase_date: "",
    car: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/djangoapp/get_dealers").then((r) => r.json()).then((d) => setDealers(d.dealers || []));
    fetch("/djangoapp/get_cars").then((r) => r.json()).then((d) => setCars(d.CarModels || []));
  }, []);

  if (!username) {
    return <p className="error">Please log in to post a review.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const [car_make, car_model, car_year] = form.car.split("|");
    const payload = {
      dealership: Number(form.dealership),
      review: form.review,
      purchase: form.purchase,
      purchase_date: form.purchase_date,
      car_make: car_make || "",
      car_model: car_model || "",
      car_year: Number(car_year || 0),
    };
    const res = await fetch("/djangoapp/add_review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMessage("Review posted. Thank you!");
      setTimeout(() => navigate(`/dealer/${form.dealership}`), 1200);
    } else {
      setError("Could not post review. Please log in and try again.");
    }
  };

  return (
    <div>
      <h1>Post a Review</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>Dealer</label>
        <select name="dealership" value={form.dealership} onChange={handleChange} required>
          <option value="">Select a dealer</option>
          {dealers.map((d) => (
            <option key={d.id} value={d.id}>{d.full_name} ({d.city}, {d.st})</option>
          ))}
        </select>

        <label>Your review</label>
        <textarea name="review" rows="5" value={form.review} onChange={handleChange} required />

        <label>
          <input type="checkbox" name="purchase" checked={form.purchase} onChange={handleChange} />
          {" "}I purchased a car here
        </label>

        <label>Purchase date</label>
        <input type="date" name="purchase_date" value={form.purchase_date} onChange={handleChange} />

        <label>Car make and model</label>
        <select name="car" value={form.car} onChange={handleChange}>
          <option value="">Select a car</option>
          {cars.map((c, i) => (
            <option key={i} value={`${c.CarMake}|${c.CarModel}|${c.Year}`}>
              {c.Year} {c.CarMake} {c.CarModel}
            </option>
          ))}
        </select>

        <button className="btn" type="submit">Submit Review</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
