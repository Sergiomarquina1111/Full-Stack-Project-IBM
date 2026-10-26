# Full-Stack-Project-IBM

## Dealership Review Portal

A full-stack web application for car dealership reviews built with Django, React, Node.js, and IBM Cloud services.

A responsive web application for **Cars Dealership**, a national car retailer. Users can browse dealership
branches, filter them by state, read dealer reviews with sentiment labels, and (after logging in) submit
their own reviews.

## Tech stack
- **Frontend:** React (react-router), static HTML pages (About / Contact)
- **Backend:** Django (REST-style JSON endpoints under `/djangoapp/`), SQLite
- **Data:** Dealer and review data in `cloudant/data/*.json`
- **Sentiment analysis:** Built-in lexicon analyser, or an optional Flask microservice
- **Serverless functions:** `functions/` (IBM Cloud Functions style, Python and Node.js)
- **CI/CD:** GitHub Actions (`.github/workflows/main.yml`)

## Project name
**Cars Dealership Full-Stack Application**

## Run locally

### 1. Backend (Django)
```bash
cd server
pip install -r requirements.txt
python manage.py makemigrations djangoapp
python manage.py migrate
python manage.py createsuperuser        # e.g. username: root
python manage.py runserver 0.0.0.0:8000
```
Admin page: http://localhost:8000/admin/

### 2. Optional sentiment microservice
```bash
python server/djangoapp/microservices/sentiment_analyzer.py    # runs on :5050
export SENTIMENT_URL=http://localhost:5050/analyze            # before runserver
```

### 3. Frontend (React)
```bash
cd server/frontend
npm install
npm start                                # http://localhost:3000 (proxies /djangoapp to :8000)
```

Static pages: http://localhost:8000/About.html and http://localhost:8000/Contact.html

## API endpoints (base: `/djangoapp/`)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `get_cars` | All car makes and models |
| POST | `login` | Log in (`userName`, `password`) |
| GET | `logout` | Log out the current user |
| POST | `register` | Sign up (`userName`, `firstName`, `lastName`, `email`, `password`) |
| GET | `get_dealers` | All dealers |
| GET | `get_dealers/<state>` | Dealers in a state (e.g. `Kansas`) |
| GET | `dealer/<id>` | Details of one dealer |
| GET | `reviews/dealer/<id>` | Reviews for one dealer |
| POST | `add_review` | Submit a review (login required) |
| GET | `analyze_review/<text>` | Sentiment of a text |

## Example cURL calls
```bash
curl -i -X POST http://localhost:8000/djangoapp/login -H "Content-Type: application/json" \
  -d '{"userName":"root","password":"<your-password>"}'
curl http://localhost:8000/djangoapp/get_dealers
curl http://localhost:8000/djangoapp/get_dealers/Kansas
curl http://localhost:8000/djangoapp/dealer/1
curl http://localhost:8000/djangoapp/reviews/dealer/1
curl http://localhost:8000/djangoapp/analyze_review/Fantastic%20services
curl http://localhost:8000/djangoapp/get_cars
curl -i http://localhost:8000/djangoapp/logout
```

## Deployment
Build and deploy with Docker/IBM Cloud Code Engine. Put the public URL in `deploymentURL`.
