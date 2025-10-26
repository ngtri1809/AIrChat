"""
Embedding models for RAG pipeline
Supports: Google Embeddings (FREE) and OpenAI Embeddings (paid)
"""
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


def get_embeddings(model: str = "google"):
    """
    Get embedding model instance
    
    Args:
        model: "google" (FREE) or "openai" (paid)
    
    Returns:
        Embedding model instance
    """
    model = model.lower() or os.getenv("EMBEDDING_MODEL", "google").lower()
    
    if model == "google":
        return get_google_embeddings()
    elif model == "openai":
        return get_openai_embeddings()
    else:
        raise ValueError(f"Unsupported embedding model: {model}. Use 'google' or 'openai'")


def get_google_embeddings():
    """
    Get Google Embeddings (text-embedding-004)
    FREE tier: 1M embeddings included
    
    Perfect for hackathons and free projects!
    """
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
        
        print("✅ Google Embeddings initialized (FREE tier)")
        return embeddings
        
    except ImportError:
        raise ImportError("Please install: pip install langchain-google-genai")
    except Exception as e:
        raise Exception(f"Error initializing Google Embeddings: {str(e)}")


def get_openai_embeddings():
    """
    Get OpenAI Embeddings (text-embedding-3-small)
    Cost: $0.02 per 1M tokens
    
    Use only if user explicitly selects OpenAI
    """
    try:
        from langchain_openai import OpenAIEmbeddings
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=api_key
        )
        
        print("⚠️ OpenAI Embeddings initialized (Paid - $0.02 per 1M tokens)")
        return embeddings
        
    except ImportError:
        raise ImportError("Please install: pip install openai")
    except Exception as e:
        raise Exception(f"Error initializing OpenAI Embeddings: {str(e)}")


# Default: Google Embeddings
def get_default_embeddings():
    """
    Get default embedding model (OpenAI - Cheap paid alternative)
    Google free tier has strict quotas, so using OpenAI instead
    Cost: $0.02 per 1M tokens (very affordable)
    """
    try:
        # Use OpenAI as primary (more reliable quota)
        return get_openai_embeddings()
    except Exception as e:
        print(f"⚠️ OpenAI Embeddings failed: {e}")
        print("⚠️ Falling back to Google Embeddings...")
        try:
            return get_google_embeddings()
        except Exception as e2:
            raise Exception(f"Both embedding models failed: {e2}")
