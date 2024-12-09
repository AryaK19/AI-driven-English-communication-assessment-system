from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users
from config.database import init_db

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()


app.include_router(users.router, prefix="/api/users", tags=["users"])