"""
db.py — Direct MongoDB connection for the Python AI service.
Reads from the same database as the Node.js backend.
Collections used: therapists, reviews, users
"""

import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load .env from the backend folder (one level up from ai_service)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/mental-health-app')

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI)
    # Extract DB name from URI, default to mental-health-app
    db_name = MONGODB_URI.rstrip('/').split('/')[-1].split('?')[0] or 'mental-health-app'
    return _client[db_name]


def fetch_verified_therapists():
    """
    Fetch all VERIFIED therapists who have at least one availability slot.
    Joins with the users collection to get name, email, profileImage.
    Joins with the reviews collection to compute average rating.
    Returns a plain list of dicts — no mock data, all from MongoDB.
    """
    db = get_db()

    # Query therapists collection directly (mirrors Node.js Therapist model)
    therapists_cursor = db['therapists'].find({
        'verification.status': 'VERIFIED',
        'availability.0': {'$exists': True}   # at least one slot
    })

    results = []
    for t in therapists_cursor:
        user_id = t.get('userId')

        # Fetch linked user document for name/email/profileImage
        user = db['users'].find_one({'_id': user_id}, {'name': 1, 'email': 1, 'profileImage': 1})
        if not user:
            continue  # skip orphaned therapist records

        # Aggregate average rating from reviews collection
        reviews = list(db['reviews'].find({'therapistId': user_id}))
        avg_rating = (
            round(sum(r['rating'] for r in reviews) / len(reviews), 1)
            if reviews else 0.0
        )

        availability = t.get('availability', [])

        results.append({
            'id':               str(t['_id']),
            'userId':           str(user_id),
            'name':             user.get('name', ''),
            'email':            user.get('email', ''),
            'profileImage':     user.get('profileImage', None),
            'specialization':   t.get('specialization', []),
            'experienceYears':  t.get('experienceYears', 0),
            'hourlyRate':       t.get('hourlyRate', 0),
            'availability':     availability,
            'availabilityCount': len(availability),
            'rating':           avg_rating,
            'bookingOption':    True,
        })

    return results
