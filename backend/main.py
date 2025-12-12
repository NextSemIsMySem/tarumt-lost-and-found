from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime
from supabase import create_client, Client
import os
import uuid

# --- CONFIGURATION ---
# Supabase DB connection string (with SSL requirement)
DB_URL = "postgresql://postgres.egykldiebvqvecytyyva:niamajibaiez@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

# Supabase Storage configuration
# Get these from Supabase Dashboard → Settings → API
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://egykldiebvqvecytyyva.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneWtsZGllYnZxdmVjeXR5eXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3NjYxOSwiZXhwIjoyMDgwOTUyNjE5fQ.Cxe6ueY-lNjDi016srEEzkEB3qrjj-8BogeFV1jIhUU")  # Set this in environment or replace with your key
STORAGE_BUCKET = "found-item-images"  # Your bucket name

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else None

app = FastAPI()

# frontend URL
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.200.53:3000",
    "http://172.17.4.120:3000",
    "http://192.168.100.136:3000",
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
        # Supabase requires SSL connections - use connection parameters
        # Parse the connection string and add SSL requirement
        conn = psycopg2.connect(
            DB_URL,
            sslmode='require'
        )
        return conn
    except psycopg2.OperationalError as e:
        error_msg = str(e)
        print(f"Database connection failed (OperationalError): {error_msg}")
        # Provide more specific error details
        if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            raise HTTPException(status_code=500, detail="Database connection timeout - check network/firewall settings")
        elif "could not resolve hostname" in error_msg.lower() or "name resolution" in error_msg.lower():
            raise HTTPException(status_code=500, detail="Cannot resolve database hostname - check DNS/network connectivity")
        elif "connection refused" in error_msg.lower():
            raise HTTPException(status_code=500, detail="Connection refused - database server may be down or port blocked")
        elif "ssl" in error_msg.lower():
            raise HTTPException(status_code=500, detail="SSL connection error - Supabase requires SSL connections")
        else:
            raise HTTPException(status_code=500, detail=f"Database connection error: {error_msg}")
    except Exception as e:
        error_msg = str(e)
        print(f"Database connection failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Database connection error: {error_msg}")

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
    image_url: str  # Required - NOT NULL in database

class ClaimCreate(BaseModel):
    item_id: str  # VARCHAR(5) format: IT###
    student_id: str  # VARCHAR(7) format: ST%
    proof_of_ownership: str

class ClaimUpdate(BaseModel):
    claim_id: str  # VARCHAR(5) format: C####
    admin_id: str  # VARCHAR(5) format: AT% - Admin processing the claim
    status: str  # 'Approved' or 'Rejected'
    rationale: Optional[str] = None  # Admin's rationale for approval/rejection

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
                "SELECT admin_id, username, email, password FROM ADMIN WHERE admin_id = %s",
                (credentials.admin_id,)
            )
            admin = cur.fetchone()
            # TEMPORARY (testing): compare plaintext passwords; remove bcrypt requirement
            if admin and admin['password'] and credentials.password == admin['password']:
                # Additional security: Verify this ID is NOT in the STUDENT table
                cur.execute("SELECT student_id FROM STUDENT WHERE student_id = %s", (credentials.admin_id,))
                if cur.fetchone():
                    raise HTTPException(status_code=403, detail="Invalid credentials: ID exists in student records")
                
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
                "SELECT student_id, username, email, password FROM STUDENT WHERE student_id = %s",
                (credentials.student_id,)
            )
            student = cur.fetchone()
            # TEMPORARY (testing): compare plaintext passwords; remove bcrypt requirement
            if student and student['password'] and credentials.password == student['password']:
                # Additional security: Verify this ID is NOT in the ADMIN table
                cur.execute("SELECT admin_id FROM ADMIN WHERE admin_id = %s", (credentials.student_id,))
                if cur.fetchone():
                    raise HTTPException(status_code=403, detail="Invalid credentials: ID exists in admin records")
                
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
def get_found_items(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    item_id: Optional[str] = None,
):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Dynamic Query Building
    query = """
        SELECT i.item_id, i.item_name, i.description, i.status, i.date_reported,
               c.category_name, l.location_name, i.image_url, i.student_id
        FROM ITEM i
        JOIN CATEGORY c ON i.category_id = c.category_id
        JOIN LOCATION l ON i.location_id = l.location_id
        WHERE i.status = 'Found'
    """
    params = []
    
    if search:
        query += " AND (i.item_name ILIKE %s OR i.description ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    if item_id:
        query += " AND i.item_id = %s"
        params.append(item_id)

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
        # Validate that image_url is provided and not empty
        if not item.image_url or not item.image_url.strip():
            raise HTTPException(status_code=400, detail="image_url is required and cannot be empty")
        
        # date_reported will be set automatically by DEFAULT CURRENT_TIMESTAMP
        cur.execute(
            """
            INSERT INTO ITEM (item_name, description, category_id, location_id, student_id, status, image_url)
            VALUES (%s, %s, %s, %s, %s, 'Found', %s)
            RETURNING item_id
            """,
            (item.item_name, item.description, item.category_id, item.location_id, item.student_id, item.image_url)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"status": "success", "item_id": new_id}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Image Upload Endpoint
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload image to Supabase Storage and return public URL"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured. Please set SUPABASE_SERVICE_KEY.")
    
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file
        file_data = await file.read()
        
        # Check file size (5MB limit)
        if len(file_data) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename or '')[1] or '.jpg'
        file_name = f"{uuid.uuid4().hex}{file_ext}"
        file_path = f"items/{file_name}"
        
        # Upload to Supabase Storage
        response = supabase.storage.from_(STORAGE_BUCKET).upload(
            file_path,
            file_data,
            file_options={"content-type": file.content_type}
        )
        
        # Check for upload errors
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=f"Upload failed: {response.error}")
        
        # Get public URL
        public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(file_path)
        
        return {"url": public_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    """Delete an item and any related claims. Admin auth should be enforced in a real app."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Remove dependent claims if cascade is not configured
        cur.execute("DELETE FROM CLAIM WHERE item_id = %s", (item_id,))
        cur.execute("DELETE FROM ITEM WHERE item_id = %s RETURNING item_id", (item_id,))
        deleted = cur.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Item not found")
        conn.commit()
        return {"status": "success", "message": "Item deleted"}
    except HTTPException:
        raise
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
        # Check if item exists and get its status and reporter
        cur.execute("SELECT status, student_id FROM ITEM WHERE item_id = %s", (claim.item_id,))
        item_data = cur.fetchone()
        if not item_data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item_status = item_data[0]
        item_reporter_id = item_data[1]
        
        if item_status != 'Found':
             raise HTTPException(status_code=400, detail="Item is not available for claim")

        # Prevent users from claiming items they reported
        if claim.student_id == item_reporter_id:
            raise HTTPException(
                status_code=400, 
                detail="You cannot claim an item you reported"
            )

        # Check if student has already submitted a claim for this item
        cur.execute(
            "SELECT claim_id, claim_status FROM CLAIM WHERE student_id = %s AND item_id = %s",
            (claim.student_id, claim.item_id)
        )
        existing_claim = cur.fetchone()
        if existing_claim:
            raise HTTPException(
                status_code=400, 
                detail=f"You have already submitted a claim for this item. Your previous claim status: {existing_claim[1]}"
            )

        # date_claimed will be set automatically by DEFAULT CURRENT_TIMESTAMP
        # admin_id is NULL for pending claims, will be set when admin processes the claim
        cur.execute(
            """
            INSERT INTO CLAIM (student_id, item_id, proof_of_ownership, claim_status, admin_id)
            VALUES (%s, %s, %s, 'Pending', NULL)
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

@app.get("/students/{student_id}/claims")
def get_student_claims(student_id: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            SELECT c.claim_id,
                   c.item_id,
                   i.item_name,
                   i.description AS item_description,
                   i.image_url,
                   c.date_claimed,
                   c.claim_status,
                   c.rationale,
                   c.proof_of_ownership,
                   a.username AS admin_name,
                   a.email AS admin_email
            FROM CLAIM c
            JOIN ITEM i ON c.item_id = i.item_id
            LEFT JOIN ADMIN a ON c.admin_id = a.admin_id
            WHERE c.student_id = %s
            ORDER BY c.date_claimed DESC
            """,
            (student_id,),
        )
        claims = cur.fetchall()
        return claims
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.delete("/claims/{claim_id}")
def delete_claim(claim_id: str):
    """Delete a claim. Only allow deletion if status is not 'Approved'."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check if claim exists and get its status
        cur.execute("SELECT claim_status FROM CLAIM WHERE claim_id = %s", (claim_id,))
        claim = cur.fetchone()
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        # Prevent deletion of approved claims
        if claim[0] == 'Approved':
            raise HTTPException(status_code=400, detail="Cannot delete an approved claim")
        
        # Delete the claim
        cur.execute("DELETE FROM CLAIM WHERE claim_id = %s RETURNING claim_id", (claim_id,))
        deleted = cur.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        conn.commit()
        return {"status": "success", "message": "Claim deleted"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.put("/admin/claims")
def process_claim(update: ClaimUpdate):
    # In real app, check if user is Admin here!
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Update Claim Status and set admin_id (admin processing the claim)
        cur.execute(
            "UPDATE CLAIM SET claim_status = %s, admin_id = %s, rationale = %s WHERE claim_id = %s RETURNING item_id",
            (update.status, update.admin_id, update.rationale, update.claim_id)
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

# 5. CLAIMS HISTORY (Approved & Rejected only)
@app.get("/admin/claims/history")
def get_claims_history():
    # In real app, check if user is Admin here!
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT 
                c.claim_id,
                c.proof_of_ownership,
                c.date_claimed,
                c.claim_status,
                c.rationale,
                c.admin_id,
                i.item_id,
                i.item_name,
                i.description as item_description,
                i.image_url,
                i.date_reported,
                i.location_id,
                l.location_name,
                i.category_id,
                cat.category_name,
                s.student_id as claimant_id,
                s.username as claimant_name,
                s.email as claimant_email,
                a.username as admin_name,
                a.email as admin_email
            FROM CLAIM c
            JOIN ITEM i ON c.item_id = i.item_id
            JOIN STUDENT s ON c.student_id = s.student_id
            JOIN LOCATION l ON i.location_id = l.location_id
            JOIN CATEGORY cat ON i.category_id = cat.category_id
            LEFT JOIN ADMIN a ON c.admin_id = a.admin_id
            WHERE c.claim_status IN ('Approved', 'Rejected')
            ORDER BY c.date_claimed DESC
        """)
        claims = cur.fetchall()
        conn.close()
        return claims
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

# 6. ADMIN REPORT (Module 5)
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