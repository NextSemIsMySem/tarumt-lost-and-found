from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime

# --- CONFIGURATION ---
# Replace with your actual Neon connection string
DB_URL = "postgresql://neondb_owner:npg_jGZ6UEg4Cnte@ep-flat-haze-a1tp3x3c-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE HELPER ---
def get_db_connection():
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

# --- PYDANTIC MODELS (Data Validation) ---

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    status: str
    user_id: int
    username: str
    role: str
    token: str

class ItemCreate(BaseModel):
    item_name: str
    description: str
    category_id: int
    location_id: int
    date_found: date
    reported_by_user_id: int
    image_url: Optional[str] = None

class ClaimCreate(BaseModel):
    item_id: int
    user_id: int
    proof_of_ownership: str

class ClaimUpdate(BaseModel):
    claim_id: int
    status: str # 'Approved' or 'Rejected'

# --- API ENDPOINTS ---

# 1. AUTHENTICATION (Module 1)
@app.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    # Check against MOCK_USERS (Simulated College DB Integration)
    user = next((u for u in MOCK_USERS if u["username"] == credentials.username and u["password"] == credentials.password), None)
    
    if user:
        # In a real app, generate a real JWT here.
        return {
            "status": "success",
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
            "token": f"fake-jwt-token-{user['user_id']}" 
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# 2. DROPDOWN DATA (Helpers for Frontend)
@app.get("/categories")
def get_categories():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT category_id, name FROM categories")
    categories = cur.fetchall()
    conn.close()
    return categories

@app.get("/locations")
def get_locations():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT location_id, name FROM locations")
    locations = cur.fetchall()
    conn.close()
    return locations

# 3. ITEM REPORTING & DASHBOARD (Module 2 & 3)
@app.get("/items")
def get_found_items(search: Optional[str] = None, category_id: Optional[int] = None):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Dynamic Query Building
    query = """
        SELECT i.item_id, i.item_name, i.description, i.status, i.date_found, i.image_url,
               c.name as category_name, l.name as location_name
        FROM items i
        JOIN categories c ON i.category_id = c.category_id
        JOIN locations l ON i.location_id = l.location_id
        WHERE i.status = 'Found'
    """
    params = []
    
    if search:
        query += " AND (i.item_name ILIKE %s OR i.description ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    if category_id:
        query += " AND i.category_id = %s"
        params.append(category_id)
        
    query += " ORDER BY i.date_reported DESC"
    
    cur.execute(query, tuple(params))
    items = cur.fetchall()
    conn.close()
    return items

@app.post("/items")
def report_found_item(item: ItemCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO items (item_name, description, category_id, location_id, date_found, reported_by_user_id, image_url, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Found')
            RETURNING item_id
            """,
            (item.item_name, item.description, item.category_id, item.location_id, item.date_found, item.reported_by_user_id, item.image_url)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"status": "success", "item_id": new_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# 4. CLAIM MANAGEMENT (Module 4)
@app.post("/claims")
def submit_claim(claim: ClaimCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check if item is still available
        cur.execute("SELECT status FROM items WHERE item_id = %s", (claim.item_id,))
        item_status = cur.fetchone()
        if not item_status or item_status[0] != 'Found':
             raise HTTPException(status_code=400, detail="Item is not available for claim")

        cur.execute(
            """
            INSERT INTO claims (claimant_user_id, claimed_item_id, proof_of_ownership, claim_status)
            VALUES (%s, %s, %s, 'Pending')
            RETURNING claim_id
            """,
            (claim.user_id, claim.item_id, claim.proof_of_ownership)
        )
        conn.commit()
        return {"status": "success", "message": "Claim submitted for review"}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/admin/claims")
def get_pending_claims():
    # In real app, check if user is Admin here!
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT c.claim_id, c.proof_of_ownership, c.date_claimed, c.claim_status,
               i.item_name, i.item_id,
               u.username as claimant_name
        FROM claims c
        JOIN items i ON c.claimed_item_id = i.item_id
        JOIN users u ON c.claimant_user_id = u.user_id
        WHERE c.claim_status = 'Pending'
    """)
    claims = cur.fetchall()
    conn.close()
    return claims

@app.put("/admin/claims")
def process_claim(update: ClaimUpdate):
    # In real app, check if user is Admin here!
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Update Claim Status
        cur.execute(
            "UPDATE claims SET claim_status = %s WHERE claim_id = %s RETURNING claimed_item_id",
            (update.status, update.claim_id)
        )
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        item_id = result[0]

        # 2. If Approved, Update Item Status to 'Claimed'
        if update.status == 'Approved':
            cur.execute("UPDATE items SET status = 'Claimed' WHERE item_id = %s", (item_id,))
            # Optional: Reject all other pending claims for this item
            cur.execute("UPDATE claims SET claim_status = 'Rejected' WHERE claimed_item_id = %s AND claim_id != %s", (item_id, update.claim_id))

        conn.commit()
        return {"status": "success", "message": f"Claim {update.status}"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# 5. ADMIN REPORT (Module 5)
@app.get("/admin/stats")
def get_stats():
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM items")
    total_items = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM items WHERE status = 'Claimed'")
    total_claimed = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE claim_status = 'Pending'")
    pending_claims = cur.fetchone()[0]
    
    conn.close()
    return {
        "total_items": total_items,
        "total_claimed": total_claimed,
        "pending_claims": pending_claims
    }