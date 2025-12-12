"""
Test script to diagnose Supabase database connection issues.
Run this to see detailed error messages.
"""
import psycopg2
import sys

# Connection string from main.py
DB_URL = "postgresql://postgres.egykldiebvqvecytyyva:niamajibaiez@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

print("Testing Supabase database connection...")
print(f"Host: aws-1-ap-south-1.pooler.supabase.com")
print(f"Port: 6543 (connection pooler)")
print(f"Database: postgres")
print("-" * 50)

# Test 1: Connection without SSL (will likely fail)
print("\n[Test 1] Attempting connection without SSL...")
try:
    conn = psycopg2.connect(DB_URL)
    print("✓ Connection successful without SSL (unexpected)")
    conn.close()
except Exception as e:
    print(f"✗ Failed: {type(e).__name__}: {e}")

# Test 2: Connection with SSL require
print("\n[Test 2] Attempting connection with SSL (sslmode=require)...")
try:
    conn = psycopg2.connect(DB_URL, sslmode='require')
    print("✓ Connection successful with SSL")
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"✓ Database version: {version[0][:50]}...")
    conn.close()
except psycopg2.OperationalError as e:
    print(f"✗ OperationalError: {e}")
    print("\nPossible causes:")
    if "timeout" in str(e).lower():
        print("  - Network timeout: Firewall blocking connection or slow network")
        print("  - Solution: Check firewall rules, try different network")
    elif "could not resolve" in str(e).lower() or "name resolution" in str(e).lower():
        print("  - DNS resolution failure: Cannot resolve hostname")
        print("  - Solution: Check internet connection, DNS settings, or VPN")
    elif "connection refused" in str(e).lower():
        print("  - Connection refused: Port blocked or server unreachable")
        print("  - Solution: Check firewall, try port 5432 (direct) instead of 6543 (pooler)")
    elif "ssl" in str(e).lower():
        print("  - SSL error: SSL/TLS handshake failed")
        print("  - Solution: Ensure SSL is enabled (sslmode=require)")
    elif "password" in str(e).lower() or "authentication" in str(e).lower():
        print("  - Authentication failed: Wrong password or username")
        print("  - Solution: Verify credentials in Supabase dashboard")
    else:
        print(f"  - Unknown error: {e}")
except Exception as e:
    print(f"✗ Unexpected error: {type(e).__name__}: {e}")

# Test 3: Try direct connection port (5432) instead of pooler (6543)
print("\n[Test 3] Attempting direct connection (port 5432) with SSL...")
DB_URL_DIRECT = DB_URL.replace(":6543", ":5432")
try:
    conn = psycopg2.connect(DB_URL_DIRECT, sslmode='require')
    print("✓ Direct connection successful")
    conn.close()
except Exception as e:
    print(f"✗ Direct connection failed: {type(e).__name__}: {e}")

print("\n" + "=" * 50)
print("Diagnosis complete. Check the errors above to identify the issue.")

