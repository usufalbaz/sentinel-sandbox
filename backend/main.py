import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.scan import router as scan_router
from api.status import router as status_router
from api.explain import router as explain_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

app = FastAPI(
    title="Sentinel Sandbox API",
    version="1.0.0",
    description=(
        "Disposable sandbox-as-a-service — detects npm supply-chain RCE "
        "attack chains in technical-assessment repos before they run on real machines."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router,    prefix="/api/scan",    tags=["scan"])
app.include_router(status_router,  prefix="/api/status",  tags=["status"])
app.include_router(explain_router, prefix="/api/explain", tags=["explain"])


@app.get("/healthz", tags=["health"])
def health():
    return {"status": "ok"}
