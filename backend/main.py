from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime
import bcrypt

# --- CONFIGURATION ---
# Replace with your actual Neon connection string
DB_URL = "postgresql://neondb_owner:npg_jGZ6UEg4Cnte@ep-flat-haze-a1tp3x3c-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

app = FastAPI()

# frontend URL
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.200.53:3000",
    "http://172.17.4.120:3000",
]

# Enable CORS for React Frontend - Added immediately after app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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
    student_id: Optional[str] = None  # For student login
    admin_id: Optional[str] = None  # For admin login
    password: str

class LoginResponse(BaseModel):
    status: str
    user_id: str  # student_id or admin_id (VARCHAR)
    username: str
    role: str
    token: str

class ItemCreate(BaseModel):
    item_name: str
    description: str
    category_id: str  # VARCHAR(3) format: CT%
    location_id: str  # VARCHAR(3) format: L__
    student_id: str  # VARCHAR(7) format: ST%
    image_url: Optional[str] = None

class ClaimCreate(BaseModel):
    item_id: str  # VARCHAR(5) format: IT###
    student_id: str  # VARCHAR(7) format: ST%
    proof_of_ownership: str

class ClaimUpdate(BaseModel):
    claim_id: str  # VARCHAR(5) format: C####
    admin_id: str  # VARCHAR(5) format: AT% - Admin processing the claim
    status: str  # 'Approved' or 'Rejected'

# --- API ENDPOINTS ---

# Handle OPTIONS requests for CORS preflight
@app.options("/login")
async def options_login():
    return {"message": "OK"}

# 1. AUTHENTICATION (Module 1)
@app.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Validate that either student_id or admin_id is provided, but not both
        if not credentials.student_id and not credentials.admin_id:
            raise HTTPException(status_code=400, detail="Either student_id (for student) or admin_id (for admin) must be provided")
        if credentials.student_id and credentials.admin_id:
            raise HTTPException(status_code=400, detail="Provide either student_id or admin_id, not both")
        
        # Admin login: Check ADMIN table using admin_id
        if credentials.admin_id:
            cur.execute(
                "SELECT admin_id, username, email, password_hash FROM ADMIN WHERE admin_id = %s",
                (credentials.admin_id,)
            )
            admin = cur.fetchone()
            # TEMPORARY (testing): compare plaintext passwords; remove bcrypt requirement
            if admin and admin['password_hash'] and credentials.password == admin['password_hash']:
                return {
                    "status": "success",
                    "user_id": admin['admin_id'],
                    "username": admin['username'],
                    "role": "admin",
                    "token": f"fake-jwt-token-{admin['admin_id']}"
                }
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
        # Student login: Check STUDENT table using student_id
        if credentials.student_id:
            cur.execute(
                "SELECT student_id, username, email, password_hash FROM STUDENT WHERE student_id = %s",
                (credentials.student_id,)
            )
            student = cur.fetchone()
            # TEMPORARY (testing): compare plaintext passwords; remove bcrypt requirement
            if student and student['password_hash'] and credentials.password == student['password_hash']:
                return {
                    "status": "success",
                    "user_id": student['student_id'],
                    "username": student['username'],
                    "role": "student",
                    "token": f"fake-jwt-token-{student['student_id']}"
                }
            raise HTTPException(status_code=401, detail="Invalid student credentials")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")
    finally:
        conn.close()

# 2. DROPDOWN DATA (Helpers for Frontend)
@app.get("/categories")
def get_categories():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT category_id, category_name FROM CATEGORY")
    categories = cur.fetchall()
    conn.close()
    return categories

@app.get("/locations")
def get_locations():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT location_id, location_name FROM LOCATION")
    locations = cur.fetchall()
    conn.close()
    return locations

# 3. ITEM REPORTING & DASHBOARD (Module 2 & 3)
@app.get("/items")
def get_found_items(search: Optional[str] = None, category_id: Optional[str] = None):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Dynamic Query Building
    query = """
        SELECT i.item_id, i.item_name, i.description, i.status, i.date_reported,
               c.category_name, l.location_name
        FROM ITEM i
        JOIN CATEGORY c ON i.category_id = c.category_id
        JOIN LOCATION l ON i.location_id = l.location_id
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
        # date_reported will be set automatically by DEFAULT CURRENT_TIMESTAMP
        cur.execute(
            """
            INSERT INTO ITEM (item_name, description, category_id, location_id, student_id, status)
            VALUES (%s, %s, %s, %s, %s, 'Found')
            RETURNING item_id
            """,
            (item.item_name, item.description, item.category_id, item.location_id, item.student_id)
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
        cur.execute("SELECT status FROM ITEM WHERE item_id = %s", (claim.item_id,))
        item_status = cur.fetchone()
        if not item_status or item_status[0] != 'Found':
             raise HTTPException(status_code=400, detail="Item is not available for claim")

        # date_claimed will be set automatically by DEFAULT CURRENT_TIMESTAMP
        # Note: admin_id is NOT NULL in schema, so we use a placeholder admin_id
        # This will be updated to the actual processing admin when the claim is processed
        cur.execute(
            """
            INSERT INTO CLAIM (student_id, item_id, proof_of_ownership, claim_status, admin_id)
            VALUES (%s, %s, %s, 'Pending', (SELECT admin_id FROM ADMIN LIMIT 1))
            RETURNING claim_id
            """,
            (claim.student_id, claim.item_id, claim.proof_of_ownership)
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
               s.username as claimant_name
        FROM CLAIM c
        JOIN ITEM i ON c.item_id = i.item_id
        JOIN STUDENT s ON c.student_id = s.student_id
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
        # 1. Update Claim Status and set admin_id (admin processing the claim)
        cur.execute(
            "UPDATE CLAIM SET claim_status = %s, admin_id = %s WHERE claim_id = %s RETURNING item_id",
            (update.status, update.admin_id, update.claim_id)
        )
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        item_id = result[0]

        # 2. If Approved, Update Item Status to 'Claimed'
        if update.status == 'Approved':
            cur.execute("UPDATE ITEM SET status = 'Claimed' WHERE item_id = %s", (item_id,))
            # Optional: Reject all other pending claims for this item
            cur.execute("UPDATE CLAIM SET claim_status = 'Rejected' WHERE item_id = %s AND claim_id != %s", (item_id, update.claim_id))

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
    
    cur.execute("SELECT COUNT(*) FROM ITEM")
    total_items = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM ITEM WHERE status = 'Claimed'")
    total_claimed = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM CLAIM WHERE claim_status = 'Pending'")
    pending_claims = cur.fetchone()[0]
    
    conn.close()
    return {
        "total_items": total_items,
        "total_claimed": total_claimed,
        "pending_claims": pending_claims
    }