import os
import sys
import threading
import socket
import select
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

from backend.models.database import init_db
from backend.api.claims import router as claims_router

# Initialize FastAPI App
app = FastAPI(
    title="ClaimGuard AI - Motor Insurance Statutory Adjudication Backend",
    description="Statutory claim adjudication, contradiction detection, and policy reasoning engine.",
    version="1.0.0"
)

# Enable CORS for local dev and API consumers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema and demo seed records on startup
@app.on_event("startup")
def on_startup():
    init_db()
    print("✓ ClaimGuard SQLite database initialized and verified.")

# Include claims API router
app.include_router(claims_router)

# Locate distribution assets
DIST_DIR = Path(__file__).resolve().parent / "dist"

# Mount static asset directory if built
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

# SPA Fallback: Serve built React frontend for all non-API paths
@app.get("/{full_path:path}")
async def serve_spa(request: Request, full_path: str):
    # Don't intercept API paths
    if full_path.startswith("api"):
        return JSONResponse(status_code=404, content={"error": f"API endpoint '/{full_path}' not found"})
    
    # Check if a specific file exists in dist (e.g. favicon, robots.txt, vite.svg)
    file_path = DIST_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
        
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    
    return JSONResponse(
        status_code=200,
        content={
            "service": "ClaimGuard AI Python Backend",
            "status": "online",
            "message": "Frontend build in progress or not found. Run 'npm run build' to generate frontend bundle.",
            "api_docs": "/docs",
            "endpoints": [
                "/api/claims",
                "/api/claims/{claim_id}",
                "/api/claims/{claim_id}/documents",
                "/api/claims/{claim_id}/review",
                "/api/claims/{claim_id}/evidence",
                "/api/claims/{claim_id}/policy-findings",
                "/api/claims/{claim_id}/escalate"
            ]
        }
    )

def start_port_bridge(source_port: int, target_port: int):
    """
    Lightweight background bridge so container environments routing exclusively
    through port 3000 can reach the FastAPI server running on port 8000.
    """
    def bridge_worker():
        try:
            server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_sock.bind(("0.0.0.0", source_port))
            server_sock.listen(128)
            print(f"✓ Ingress bridge active: port {source_port} -> port {target_port}")
            
            while True:
                client_sock, _ = server_sock.accept()
                threading.Thread(target=handle_bridge_client, args=(client_sock, target_port), daemon=True).start()
        except Exception as e:
            # Port might be occupied by another dev runner; safe to continue
            pass

    def handle_bridge_client(client_sock, target_port):
        try:
            target_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            target_sock.connect(("127.0.0.1", target_port))
            
            sockets = [client_sock, target_sock]
            while True:
                r, _, _ = select.select(sockets, [], [], 30.0)
                if not r:
                    break
                for s in r:
                    data = s.recv(65536)
                    if not data:
                        return
                    if s is client_sock:
                        target_sock.sendall(data)
                    else:
                        client_sock.sendall(data)
        except Exception:
            pass
        finally:
            client_sock.close()
            try:
                target_sock.close()
            except Exception:
                pass

    t = threading.Thread(target=bridge_worker, daemon=True)
    t.start()

if __name__ == "__main__":
    # Ensure frontend build exists
    if not (DIST_DIR / "index.html").exists():
        print("Building frontend assets into dist/...")
        os.system("npm run build")

    # Start bridge from 3000 to 8000 for container reverse proxy compatibility
    start_port_bridge(source_port=3000, target_port=8000)

    print("==================================================")
    print(" ClaimGuard AI - Python FastAPI Backend Starting ")
    print(" Server listening on: http://localhost:8000       ")
    print(" Ingress proxy: http://localhost:3000 -> 8000     ")
    print(" Swagger UI Docs: http://localhost:8000/docs      ")
    print("==================================================")

    # Listen on port 8000 as specified
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
