# Deccan Origin — Router Package Exports
# All 25 domain routers are imported here for use in app/main.py

from app.routers import (
    auth,
    products,
    orders,
    payments,
    logistics,
    agri_services,
    trust,
    ai,
    community,
    admin,
    mandi,
    carbon,
    export_biosec,
    procurement,
    credit,
    gis,
    iot,
    contracts,
    sustainability,
    coop,
    lab,
    ledger,
    inspections,
    farmers,
    webhooks,
    events,
)

__all__ = [
    "auth", "products", "orders", "payments", "logistics", "agri_services",
    "trust", "ai", "community", "admin", "mandi", "carbon", "export_biosec",
    "procurement", "credit", "gis", "iot", "contracts", "sustainability",
    "coop", "lab", "ledger", "inspections", "farmers", "webhooks", "events",
]
