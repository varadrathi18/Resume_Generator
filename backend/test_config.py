from config import Config
print(f"URI length: {len(Config.MONGODB_URI)}")
print(f"URI: {Config.MONGODB_URI[:30] if Config.MONGODB_URI else 'EMPTY'}")
