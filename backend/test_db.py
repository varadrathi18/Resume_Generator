from db import users_collection, get_user_by_email

print("Users in DB:")
if users_collection is not None:
    for u in users_collection.find():
        print(u)
else:
    print("users_collection is None")
