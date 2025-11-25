import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Initialize database with sample video data
    Args: event with httpMethod
    Returns: HTTP response with success message
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("SELECT COUNT(*) as count FROM videos")
    result = cursor.fetchone()
    
    if result['count'] > 0:
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Database already has data'})
        }
    
    sample_videos = [
        ('Introduction to React', ['react', 'javascript', 'tutorial'], 'https://example.com/video1', 
         'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', 
         'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400', 
         'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', 1),
        ('TypeScript Basics', ['typescript', 'programming', 'tutorial'], 'https://example.com/video2',
         'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400',
         'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
         'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', 2),
        ('Web Design Principles', ['design', 'ui', 'ux'], 'https://example.com/video3',
         'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
         'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
         'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400', 3),
        ('Backend Development', ['backend', 'api', 'nodejs'], 'https://example.com/video4',
         'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
         'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400',
         'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', 4),
        ('CSS Animations', ['css', 'animation', 'frontend'], 'https://example.com/video5',
         'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400',
         'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
         'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400', 5),
        ('Database Design', ['database', 'sql', 'backend'], 'https://example.com/video6',
         'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
         'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
         'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=400', 6),
        ('Mobile Development', ['mobile', 'react-native', 'ios'], 'https://example.com/video7',
         'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
         'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
         'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 7),
        ('Git and GitHub', ['git', 'version-control', 'tutorial'], 'https://example.com/video8',
         'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
         'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400',
         'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', 8),
        ('Docker Essentials', ['docker', 'devops', 'containers'], 'https://example.com/video9',
         'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400',
         'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400',
         'https://images.unsplash.com/photo-1579003593419-98f949b9398f?w=400', 9),
        ('Security Best Practices', ['security', 'encryption', 'cybersecurity'], 'https://example.com/video10',
         'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400',
         'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
         'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400', 10),
        ('Testing Strategies', ['testing', 'qa', 'automation'], 'https://example.com/video11',
         'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
         'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400',
         'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400', 11),
        ('Performance Optimization', ['performance', 'optimization', 'frontend'], 'https://example.com/video12',
         'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
         'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
         'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', 12),
    ]
    
    for video in sample_videos:
        cursor.execute(
            "INSERT INTO videos (title, tags, external_url, image1_url, image2_url, image3_url, position) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            video
        )
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'message': f'Added {len(sample_videos)} sample videos'})
    }