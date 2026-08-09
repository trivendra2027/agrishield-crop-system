from datetime import timezone
from typing import Dict, List
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        # Maps user_id string to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"[WS CONNECTED] User ID: {user_id}. Active client sessions: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"[WS DISCONNECTED] User ID: {user_id}. Connections remaining: {len(self.active_connections.get(user_id, []))}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id not in self.active_connections:
            return
        
        dead_connections = []
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        # Clean up dead connections
        for dead in dead_connections:
            self.disconnect(user_id, dead)

    async def broadcast(self, message: dict):
        for user_id, connections in list(self.active_connections.items()):
            dead_connections = []
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_connections.append(connection)
            for dead in dead_connections:
                self.disconnect(user_id, dead)

# Shared instance of the WebSocketManager
ws_manager = WebSocketManager()
