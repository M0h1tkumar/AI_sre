import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
    HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    HINDSIGHT_BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "runbookmind-demo")
    PRIMARY_MODEL = os.getenv("PRIMARY_MODEL", "llama-3.1-70b-versatile")
    FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "llama-3.1-8b-instant")

config = Config()
