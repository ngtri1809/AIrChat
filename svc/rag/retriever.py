"""
RAG Retriever with MMR (Maximal Marginal Relevance)
Handles document retrieval and scoring
"""
from typing import List, Dict, Any, Optional

from rag.vector_store import get_or_create_vector_store, search_vector_store


class RAGRetriever:
    """Retrieve relevant documents from knowledge base"""
    
    def __init__(self, score_threshold: float = 0.12):
        """
        Initialize retriever
        
        Args:
            score_threshold: Minimum similarity score (0-1)
        """
        self.vector_store = None
        self.score_threshold = score_threshold
        self.initialized = False
    
    def initialize(self):
        """Initialize vector store and load KB if needed"""
        if self.initialized:
            return
        
        print("🔄 Initializing RAG Retriever...")
        
        self.vector_store = get_or_create_vector_store()
        
        # Check if KB is already loaded
        doc_count = len(self.vector_store.get())
        if doc_count == 0:
            print("📚 Loading knowledge base...")
            self._load_kb()
        else:
            print(f"✅ Found {doc_count} documents in store")
        
        self.initialized = True
    
    def _load_kb(self):
        """Load knowledge base into vector store"""
        from rag.document_loader import load_knowledge_base
        from rag.vector_store import add_documents_to_store
        
        documents = load_knowledge_base()
        if documents:
            add_documents_to_store(self.vector_store, documents)
    
    def retrieve(
        self,
        query: str,
        k: int = 5,
        filter_domain: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents
        
        Args:
            query: Search query
            k: Number of results
            filter_domain: Optional filter ("epa" or "who")
        
        Returns:
            List of relevant documents with scores
        """
        self.initialize()
        
        # Get candidates
        candidates = search_vector_store(self.vector_store, query, k=k*2)
        
        # Filter by threshold and domain
        results = []
        for doc in candidates:
            # Check similarity threshold
            if doc["similarity"] < self.score_threshold:
                continue
            
            # Check domain filter
            if filter_domain and doc["metadata"].get("domain") != filter_domain:
                continue
            
            results.append(doc)
            
            if len(results) >= k:
                break
        
        return results
    
    def retrieve_with_citations(
        self,
        query: str,
        k: int = 5
    ) -> Dict[str, Any]:
        """
        Retrieve documents with citation formatting
        
        Args:
            query: Search query
            k: Number of results
        
        Returns:
            Dict with results and formatted citations
        """
        documents = self.retrieve(query, k=k)
        
        citations = []
        for i, doc in enumerate(documents, 1):
            citation = {
                "id": i,
                "source": doc["metadata"].get("source", "Unknown"),
                "domain": doc["metadata"].get("domain", "Unknown"),
                "page": doc["metadata"].get("page", "N/A"),
                "similarity": doc["similarity"]
            }
            citations.append(citation)
        
        return {
            "query": query,
            "documents": documents,
            "citations": citations,
            "count": len(documents)
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get retriever statistics"""
        self.initialize()
        
        return {
            "status": "Ready" if self.initialized else "Not initialized",
            "score_threshold": self.score_threshold,
            "documents_loaded": len(self.vector_store.get()) if self.vector_store else 0
        }
