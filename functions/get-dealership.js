// IBM Cloud Function: returns dealerships, optionally filtered by state or id.
// Params: { state?: "Kansas", dealerId?: 1 }
const fs = require("fs");
const path = require("path");

function loadDealers() {
  const file = path.join(__dirname, "..", "cloudant", "data", "dealerships.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return data.dealerships;
}

function main(params = {}) {
  let dealers = loadDealers();
  if (params.dealerId !== undefined) {
    dealers = dealers.filter((d) => String(d.id) === String(params.dealerId));
    return { statusCode: 200, body: { entries: dealers } };
  }
  if (params.state) {
    const s = String(params.state).toLowerCase();
    dealers = dealers.filter((d) => d.state.toLowerCase() === s || d.st.toLowerCase() === s);
  }
  return { statusCode: 200, body: { entries: dealers } };
}

module.exports = { main };
