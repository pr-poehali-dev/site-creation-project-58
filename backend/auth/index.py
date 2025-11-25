import json
import os
import hashlib
import secrets
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication and session management
    Args: event with httpMethod, body (username, password)
    Returns: HTTP response with session token or error
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action', 'login')
    username = body_data.get('username', '').strip()
    password = body_data.get('password', '').strip()
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Username and password required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if action == 'register':
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            cursor.execute(
                "INSERT INTO users (username, password_hash, is_admin) VALUES (%s, %s, FALSE) RETURNING id, username, is_admin",
                (username, password_hash)
            )
            user = cursor.fetchone()
            conn.commit()
            
            session_token = secrets.token_urlsafe(32)
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'session_token': session_token,
                    'user': dict(user)
                })
            }
        except psycopg2.IntegrityError:
            conn.rollback()
            cursor.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Username already exists'})
            }
    
    if action == 'login':
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        cursor.execute(
            "SELECT id, username, is_admin FROM users WHERE username = %s AND password_hash = %s",
            (username, password_hash)
        )
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid credentials'})
            }
        
        session_token = secrets.token_urlsafe(32)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'session_token': session_token,
                'user': dict(user)
            })
        }
    
    if action == 'verify':
        session_token = body_data.get('session_token', '').strip()
        
        if not session_token:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No session token'})
            }
        
        cursor.execute(
            "SELECT id, username, is_admin FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'user': dict(user)
                })
            }
        
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid session'})
        }
    
    return {
        'statusCode': 400,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Invalid action'})
    }
