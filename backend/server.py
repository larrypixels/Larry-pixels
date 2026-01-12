from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random
import string
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

ADMIN_PASSWORD = "Salam03"

# Models
class AccessCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    is_used: bool = False
    created_by_admin: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used_by: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    discord_handle: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    images_created: int = 0
    codes_shared: int = 0
    last_active_date: Optional[str] = None
    streak_days: int = 0
    daily_images_today: int = 0
    last_image_date: Optional[str] = None
    invited_users_count: int = 0
    has_unlimited: bool = False
    invited_by: Optional[str] = None

class DailyShareCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    code: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used_by: Optional[str] = None
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=1))

class VerifyCodeRequest(BaseModel):
    code: str

class SignupRequest(BaseModel):
    username: str
    discord_handle: str

class LoginRequest(BaseModel):
    username: str

class AdminLoginRequest(BaseModel):
    password: str

class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    username: str
    score: int
    images_created: int
    codes_shared: int
    streak_days: int

def generate_code(length: int = 6) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def calculate_score(images: int, codes: int, streak: int) -> int:
    return (images * 10) + (codes * 20) + (streak * 5)

@api_router.get("/")
async def root():
    return {"message": "Larrypixels API"}

# Auth endpoints
@api_router.post("/auth/verify-code")
async def verify_code(request: VerifyCodeRequest):
    code_doc = await db.access_codes.find_one({"code": request.code.upper(), "is_used": False}, {"_id": 0})
    if not code_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or already used code")
    return {"valid": True, "message": "Code verified successfully"}

@api_router.post("/auth/signup")
async def signup(request: SignupRequest):
    existing = await db.users.find_one({"username": request.username}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    user = User(username=request.username, discord_handle=request.discord_handle)
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    return {"user": user.model_dump(), "message": "User created successfully"}

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"username": request.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": user, "message": "Login successful"}

@api_router.post("/auth/use-code")
async def use_code(request: VerifyCodeRequest, username: str):
    code_doc = await db.access_codes.find_one({"code": request.code.upper(), "is_used": False})
    if not code_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or already used code")
    
    # Check if this code was created by another user (daily share code)
    daily_code = await db.daily_codes.find_one({"code": request.code.upper()}, {"_id": 0})
    if daily_code and daily_code.get('user_id'):
        # Find the user who created this code
        inviter = await db.users.find_one({"id": daily_code['user_id']}, {"_id": 0})
        if inviter:
            # Increment invited_users_count for the inviter
            new_count = inviter.get('invited_users_count', 0) + 1
            has_unlimited = new_count >= 10
            await db.users.update_one(
                {"id": daily_code['user_id']},
                {"$set": {"invited_users_count": new_count, "has_unlimited": has_unlimited}}
            )
            
            # Set invited_by for the new user
            await db.users.update_one(
                {"username": username},
                {"$set": {"invited_by": inviter['username']}}
            )
    
    await db.access_codes.update_one(
        {"code": request.code.upper()},
        {"$set": {"is_used": True, "used_by": username}}
    )
    return {"message": "Code used successfully"}

# Admin endpoints
@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    if request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    return {"message": "Admin login successful", "token": "admin_authenticated"}

@api_router.post("/admin/generate-code")
async def generate_access_code():
    code = generate_code(6)
    while await db.access_codes.find_one({"code": code}):
        code = generate_code(6)
    
    access_code = AccessCode(code=code)
    code_dict = access_code.model_dump()
    code_dict['created_at'] = code_dict['created_at'].isoformat()
    
    await db.access_codes.insert_one(code_dict)
    return {"code": code, "message": "Access code generated successfully"}

@api_router.get("/admin/users")
async def get_all_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return {"users": users}

@api_router.get("/admin/codes")
async def get_all_codes():
    codes = await db.access_codes.find({}, {"_id": 0}).to_list(1000)
    return {"codes": codes}

@api_router.get("/admin/stats")
async def get_admin_stats():
    total_users = await db.users.count_documents({})
    total_codes = await db.access_codes.count_documents({})
    used_codes = await db.access_codes.count_documents({"is_used": True})
    total_images = await db.users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$images_created"}}}]).to_list(1)
    
    return {
        "total_users": total_users,
        "total_codes": total_codes,
        "used_codes": used_codes,
        "available_codes": total_codes - used_codes,
        "total_images": total_images[0]['total'] if total_images else 0
    }

# User endpoints
@api_router.post("/user/daily-code")
async def generate_daily_code(username: str):
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    today = datetime.now(timezone.utc)
    existing_code = await db.daily_codes.find_one({
        "user_id": user['id'],
        "generated_at": {"$gte": (today - timedelta(days=1)).isoformat()}
    }, {"_id": 0})
    
    if existing_code:
        return {"code": existing_code['code'], "message": "Today's code already generated", "already_exists": True}
    
    code = generate_code(6)
    while await db.access_codes.find_one({"code": code}) or await db.daily_codes.find_one({"code": code}):
        code = generate_code(6)
    
    daily_code = DailyShareCode(user_id=user['id'], code=code)
    code_dict = daily_code.model_dump()
    code_dict['generated_at'] = code_dict['generated_at'].isoformat()
    code_dict['expires_at'] = code_dict['expires_at'].isoformat()
    
    await db.daily_codes.insert_one(code_dict)
    await db.access_codes.insert_one({
        "code": code,
        "is_used": False,
        "created_by_admin": False,
        "created_at": today.isoformat(),
        "used_by": None
    })
    
    await db.users.update_one({"username": username}, {"$inc": {"codes_shared": 1}})
    
    return {"code": code, "message": "Daily code generated successfully", "already_exists": False}

@api_router.get("/user/my-codes")
async def get_user_codes(username: str):
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    codes = await db.daily_codes.find({"user_id": user['id']}, {"_id": 0}).to_list(1000)
    return {"codes": codes}

@api_router.post("/user/image-created")
async def increment_image_count(username: str):
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_image_date = user.get('last_image_date')
    daily_images = user.get('daily_images_today', 0)
    has_unlimited = user.get('has_unlimited', False)
    
    # Reset daily counter if it's a new day
    if last_image_date != today_str:
        daily_images = 0
    
    # Check daily limit (10 images per day unless unlimited)
    if not has_unlimited and daily_images >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily limit reached. Invite 10 friends to unlock unlimited access!"
        )
    
    # Update streak logic
    last_active = user.get('last_active_date')
    if last_active == today_str:
        pass
    elif last_active == (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d"):
        await db.users.update_one({"username": username}, {"$inc": {"streak_days": 1}})
    else:
        await db.users.update_one({"username": username}, {"$set": {"streak_days": 1}})
    
    # Increment counters
    await db.users.update_one(
        {"username": username},
        {
            "$inc": {"images_created": 1, "daily_images_today": 1},
            "$set": {"last_active_date": today_str, "last_image_date": today_str}
        }
    )
    
    # Get updated count
    updated_user = await db.users.find_one({"username": username}, {"_id": 0})
    remaining = 10 - updated_user.get('daily_images_today', 0) if not has_unlimited else -1
    
    return {
        "message": "Image count updated",
        "daily_images_today": updated_user.get('daily_images_today', 0),
        "remaining_today": remaining,
        "has_unlimited": has_unlimited
    }

@api_router.get("/user/profile")
async def get_user_profile(username: str):
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"user": user}

# Leaderboard
@api_router.get("/leaderboard")
async def get_leaderboard():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    leaderboard = []
    
    for user in users:
        score = calculate_score(
            user.get('images_created', 0),
            user.get('codes_shared', 0),
            user.get('streak_days', 0)
        )
        leaderboard.append(LeaderboardEntry(
            username=user['username'],
            score=score,
            images_created=user.get('images_created', 0),
            codes_shared=user.get('codes_shared', 0),
            streak_days=user.get('streak_days', 0)
        ))
    
    leaderboard.sort(key=lambda x: x.score, reverse=True)
    return {"leaderboard": [entry.model_dump() for entry in leaderboard[:50]]}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()