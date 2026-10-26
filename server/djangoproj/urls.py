from django.contrib import admin
from django.urls import include, path

from djangoapp.views import static_page

urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
    path("About.html", static_page, {"name": "About.html"}, name="about"),
    path("Contact.html", static_page, {"name": "Contact.html"}, name="contact"),
]
