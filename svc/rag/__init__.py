"""
RAG Pipeline Package for AIrChat
Provides Retrieval-Augmented Generation capabilities
"""

from rag.embeddings import get_embeddings, get_default_embeddings
from rag.vector_store import get_or_create_vector_store, search_vector_store
from rag.document_loader import load_knowledge_base, list_kb_files
from rag.retriever import RAGRetriever
from rag.rag_chain import RAGChain, run_rag_query

__all__ = [
    "get_embeddings",
    "get_default_embeddings",
    "get_or_create_vector_store",
    "search_vector_store",
    "load_knowledge_base",
    "list_kb_files",
    "RAGRetriever",
    "RAGChain",
    "run_rag_query"
]
