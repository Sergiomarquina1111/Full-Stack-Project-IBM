import json

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import FileResponse, Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from . import restapis
from .models import CarMake, CarModel


def _body(request):
    """Accept JSON bodies and form-encoded bodies (for cURL -d)."""
    if request.content_type == "application/json" and request.body:
        try:
            return json.loads(request.body)
        except json.JSONDecodeError:
            return {}
    return request.POST.dict()


def static_page(request, name):
    path = settings.STATICFILES_DIRS[0] / name
    if not path.exists():
        raise Http404("Page not found")
    return FileResponse(open(path, "rb"), content_type="text/html")


def _seed_cars():
    catalog = {
        "Ford": ["Explorer", "F-150", "Mustang"],
        "Honda": ["Civic", "CR-V", "Accord"],
        "Toyota": ["Camry", "RAV4", "Corolla"],
        "Audi": ["A4", "Q5", "Q7"],
        "Chevrolet": ["Silverado", "Equinox", "Malibu"],
    }
    types = {"Explorer": "SUV", "F-150": "TRUCK", "Mustang": "COUPE", "Civic": "SEDAN",
             "CR-V": "SUV", "Accord": "SEDAN", "Camry": "SEDAN", "RAV4": "SUV",
             "Corolla": "SEDAN", "A4": "SEDAN", "Q5": "SUV", "Q7": "SUV",
             "Silverado": "TRUCK", "Equinox": "SUV", "Malibu": "SEDAN"}
    for make_name, models in catalog.items():
        make = CarMake.objects.create(name=make_name, description=f"{make_name} vehicles")
        for i, model_name in enumerate(models):
            CarModel.objects.create(car_make=make, dealer_id=(i % 3) + 1, name=model_name,
                                    type=types[model_name], year=2024 + (i % 2))


@require_GET
def get_cars(request):
    if not CarMake.objects.exists():
        _seed_cars()
    models = CarModel.objects.select_related("car_make").order_by("car_make__name", "name")
    cars = [{"CarMake": m.car_make.name, "CarModel": m.name, "Type": m.type,
             "Year": m.year, "DealerId": m.dealer_id} for m in models]
    return JsonResponse({"status": 200, "CarModels": cars})


@csrf_exempt
@require_POST
def login_user(request):
    data = _body(request)
    username = data.get("userName", "")
    password = data.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({"userName": username, "status": "Authenticated"})
    return JsonResponse({"userName": username, "error": "Invalid username or password"}, status=401)


@csrf_exempt
def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
@require_POST
def registration(request):
    data = _body(request)
    username = data.get("userName", "")
    password = data.get("password", "")
    if not username or not password:
        return JsonResponse({"error": "userName and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"}, status=409)
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=data.get("firstName", ""),
        last_name=data.get("lastName", ""),
        email=data.get("email", ""),
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


@require_GET
def get_dealerships(request):
    return JsonResponse({"status": 200, "dealers": restapis.get_all_dealers()})


@require_GET
def get_dealers_by_state(request, state):
    return JsonResponse({"status": 200, "dealers": restapis.get_dealers_by_state(state)})


@require_GET
def get_dealer_details(request, dealer_id):
    dealer = restapis.get_dealer_by_id(dealer_id)
    if dealer is None:
        return JsonResponse({"status": 404, "error": "Dealer not found"}, status=404)
    return JsonResponse({"status": 200, "dealer": dealer})


@require_GET
def get_dealer_reviews(request, dealer_id):
    return JsonResponse({"status": 200, "reviews": restapis.get_reviews_for_dealer(dealer_id)})


@csrf_exempt
@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "error": "Login required"}, status=401)
    data = _body(request)
    if isinstance(data.get("review"), dict):
        data = data["review"]
    review = {
        "name": request.user.get_full_name() or request.user.username,
        "dealership": int(data.get("dealership", 0)),
        "review": data.get("review", ""),
        "purchase": str(data.get("purchase", "false")).lower() in ("true", "1", "yes", "on"),
        "purchase_date": data.get("purchase_date", ""),
        "car_make": data.get("car_make", ""),
        "car_model": data.get("car_model", ""),
        "car_year": int(data.get("car_year", 0) or 0),
    }
    saved = restapis.add_review(review)
    return JsonResponse({"status": 200, "review": saved})


@require_GET
def analyze_review(request, text):
    return JsonResponse({"sentiment": restapis.analyze_sentiment(text), "text": text})
