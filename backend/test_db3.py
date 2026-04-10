import logging
logging.basicConfig(level=logging.ERROR)
from db import users_collection
if users_collection is not None:
    users = list(users_collection.find({}, {"email": 1, "_id": 0}))
    print(f"Users in DB: {users}")
else:
    print("users_collection is None")
