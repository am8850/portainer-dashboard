from fastapi import FastAPI, HTTPException
import os
from dotenv import load_dotenv
import httpx
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles


load_dotenv()

PORTAINER_URL = os.getenv("PORTAINER_URL")
PORTAINER_USERNAME = os.getenv("PORTAINER_USERNAME")
PORTAINER_PASSWORD = os.getenv("PORTAINER_PASSWORD")
ENDPOINT_ID = os.getenv("ENDPOINT_ID")


app = FastAPI(title="Portainer Container Control API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth", response_model=str)
async def get_auth_token():
    auth_url = f"{PORTAINER_URL}/api/auth"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            auth_url,
            json={"Username": PORTAINER_USERNAME, "Password": PORTAINER_PASSWORD},
        )
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Authentication failed")
    return response.json()["jwt"]


class ContainerInfo(BaseModel):
    Id: str
    Names: List[str]
    Image: str
    State: str
    Status: str
    Labels: Optional[Dict[str, Any]] = None


@app.get("/api/containers", response_model=List[ContainerInfo])
async def list_containers():
    token = await get_auth_token()
    url = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/json"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    if response.status_code == 200:
        containers = response.json()
        return [ContainerInfo(**container) for container in containers]
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@app.post("/api/start/{container_id}")
async def start_container(container_id: str):
    token = await get_auth_token()
    url = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{container_id}/start"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers)
    if response.status_code == 204:
        return {"status": "started", "container_id": container_id}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@app.post("/api/stop/{container_id}")
async def stop_container(container_id: str):
    token = await get_auth_token()
    url = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{container_id}/stop"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers)
    if response.status_code == 204:
        return {"status": "stopped", "container_id": container_id}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@app.post("/api/pause/{container_id}")
async def pause_container(container_id: str):
    token = await get_auth_token()
    url = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{container_id}/pause"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers)
    if response.status_code == 204:
        return {"status": "paused", "container_id": container_id}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@app.post("/api/resume/{container_id}")
async def resume_container(container_id: str):
    token = await get_auth_token()
    url = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{container_id}/unpause"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers)
    if response.status_code == 204:
        return {"status": "resumed", "container_id": container_id}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@app.post("/api/restart/{container_id}")
async def restart_container(container_id: str):
    token = await get_auth_token()
    url = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{container_id}/restart"
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers)
    if response.status_code == 204:
        return {"status": "restarted", "container_id": container_id}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
