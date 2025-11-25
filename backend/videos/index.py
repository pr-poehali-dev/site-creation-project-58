import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage video entries (list, search, add, delete)
    Args: event with httpMethod, queryStringParameters (page, search, tag)
    Returns: HTTP response with videos list or operation result
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-User-Id, X-Is-Admin',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        page = int(params.get('page', '1'))
        per_page = 12
        offset = (page - 1) * per_page
        
        search_query = params.get('search', '').strip()
        tag_filter = params.get('tag', '').strip()
        
        where_clauses = []
        query_params = []
        
        if search_query:
            where_clauses.append("title ILIKE %s")
            query_params.append(f'%{search_query}%')
        
        if tag_filter:
            where_clauses.append("%s = ANY(tags)")
            query_params.append(tag_filter)
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "TRUE"
        
        cursor.execute(
            f"SELECT COUNT(*) as total FROM videos WHERE {where_sql}",
            tuple(query_params)
        )
        total = cursor.fetchone()['total']
        
        query_params.extend([per_page, offset])
        cursor.execute(
            f"SELECT * FROM videos WHERE {where_sql} ORDER BY position DESC, created_at DESC LIMIT %s OFFSET %s",
            tuple(query_params)
        )
        videos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'videos': [dict(v) for v in videos],
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }, default=str)
        }
    
    if method == 'POST':
        headers = event.get('headers', {})
        is_admin = headers.get('x-is-admin', 'false').lower() == 'true'
        
        if not is_admin:
            cursor.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Admin access required'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        title = body_data.get('title', '').strip()
        tags = body_data.get('tags', [])
        external_url = body_data.get('external_url', '').strip()
        image1_url = body_data.get('image1_url', '').strip()
        image2_url = body_data.get('image2_url', '').strip()
        image3_url = body_data.get('image3_url', '').strip()
        
        if not all([title, external_url, image1_url, image2_url, image3_url]):
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        cursor.execute("SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM videos")
        next_position = cursor.fetchone()['next_pos']
        
        cursor.execute(
            "INSERT INTO videos (title, tags, external_url, image1_url, image2_url, image3_url, position) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (title, tags, external_url, image1_url, image2_url, image3_url, next_position)
        )
        video_id = cursor.fetchone()['id']
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'id': video_id})
        }
    
    if method == 'DELETE':
        headers = event.get('headers', {})
        is_admin = headers.get('x-is-admin', 'false').lower() == 'true'
        
        if not is_admin:
            cursor.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Admin access required'})
            }
        
        params = event.get('queryStringParameters') or {}
        video_id = params.get('id')
        
        if not video_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Video ID required'})
            }
        
        cursor.execute("DELETE FROM videos WHERE id = %s", (video_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True})
        }
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
