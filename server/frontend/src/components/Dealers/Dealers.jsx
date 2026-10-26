import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/djangoapp/get_dealers")
      .then((r) => r.json())
      .then((data) => {
        const list = data.dealers || [];
        setDealers(list);
        setStates([...new Set(list.map((d) => d.state))].sort());
      })
      .catch(() => setError("Could not load dealers."));
  }, []);

  const handleStateChange = (state) => {
    setSelectedState(state);
    const url = state
      ? `/djangoapp/get_dealers/${encodeURIComponent(state)}`
      : "/djangoapp/get_dealers";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setDealers(data.dealers || []))
      .catch(() => setError("Could not filter dealers."));
  };

  return (
    <div>
      <h1>Dealerships</h1>
      <div className="filter">
        <label htmlFor="state">Filter by state: </label>
        <select id="state" value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <table className="dealer-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>State</th>
            <th>Address</th>
            <th>Zip</th>
            <th>Reviews</th>
          </tr>
        </thead>
        <tbody>
          {dealers.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.full_name}</td>
              <td>{d.city}</td>
              <td>{d.state}</td>
              <td>{d.address}</td>
              <td>{d.zip}</td>
              <td><Link to={`/dealer/${d.id}`}>View reviews</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
