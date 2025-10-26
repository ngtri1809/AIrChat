"""
Vector store management using ChromaDB
Local, persistent document storage for RAG
"""
import os
from pathlib import Path
from typing import List, Dict, Any

from rag.embeddings import get_default_embeddings


# Persistent storage path
CHROMA_DB_PATH = Path(__file__).resolve().parents[1] / "store" / "chroma" / "airchat_vi_v1"


def get_or_create_vector_store():
    """
    Get or create ChromaDB vector store
    
    Returns:
        Chroma vector store instance
    """
    try:
        from langchain_chroma import Chroma
        
        # Create persistent storage directory
        CHROMA_DB_PATH.mkdir(parents=True, exist_ok=True)
        
        embeddings = get_default_embeddings()
        
        vector_store = Chroma(
            collection_name="air_quality_kb",
            embedding_function=embeddings,
            persist_directory=str(CHROMA_DB_PATH)
        )
        
        print(f"✅ ChromaDB vector store initialized at {CHROMA_DB_PATH}")
        return vector_store
        
    except ImportError:
        raise ImportError("Please install: pip install langchain-chroma chromadb")
    except Exception as e:
        raise Exception(f"Error initializing ChromaDB: {str(e)}")


def add_documents_to_store(vector_store, documents: List[Dict[str, Any]]) -> int:
    """
    Add documents to vector store
    
    Args:
        vector_store: Chroma instance
        documents: List of dicts with 'content' and 'metadata'
    
    Returns:
        Number of documents added
    """
    if not documents:
        return 0
    
    texts = [doc["content"] for doc in documents]
    metadatas = [doc.get("metadata", {}) for doc in documents]
    
    ids = vector_store.add_texts(texts, metadatas=metadatas)
    
    print(f"✅ Added {len(ids)} documents to vector store")
    return len(ids)


def search_vector_store(vector_store, query: str, k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for similar documents
    
    Args:
        vector_store: Chroma instance
        query: Search query
        k: Number of results
    
    Returns:
        List of relevant documents with scores
    """
    results = vector_store.similarity_search_with_score(query, k=k)
    
    formatted_results = []
    for doc, score in results:
        # Convert distance to similarity (0-1)
        similarity = 1 - (score / 2)  # ChromaDB uses distance, normalize to similarity
        
        formatted_results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "similarity": round(max(0, similarity), 3)  # Ensure 0-1 range
        })
    
    return formatted_results
