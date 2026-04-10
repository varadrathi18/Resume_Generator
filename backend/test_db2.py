import logging
logging.basicConfig(level=logging.ERROR)
from db import users_collection, db_ready
print(f"db_ready: {db_ready}")
print(f"users_collection: {users_collection}")
