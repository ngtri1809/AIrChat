"""
RAG Chain - Main integration point
Combines retriever + LLM for RAG functionality
"""
from typing import Optional

from rag.retriever import RAGRetriever


class RAGChain:
    """
    Retrieval-Augmented Generation chain
    Retrieves documents and uses them to augment LLM responses
    """
    
    def __init__(self, llm=None, score_threshold: float = 0.12):
        """
        Initialize RAG chain
        
        Args:
            llm: Language model instance (will use default if None)
            score_threshold: Minimum similarity score
        """
        self.llm = llm
        self.retriever = RAGRetriever(score_threshold=score_threshold)
        self.retriever.initialize()
    
    def invoke(self, query: str, k: int = 5) -> dict:
        """
        Run RAG chain
        
        Args:
            query: User query
            k: Number of documents to retrieve
        
        Returns:
            Dict with answer and sources
        """
        # Retrieve relevant documents
        result = self.retriever.retrieve_with_citations(query, k=k)
        
        documents = result["documents"]
        citations = result["citations"]
        
        # Format context for LLM
        context = self._format_context(documents)
        
        # Prepare LLM prompt with context
        prompt = self._build_prompt(query, context)
        
        return {
            "prompt": prompt,
            "context": context,
            "documents": documents,
            "citations": citations,
            "query": query
        }
    
    def _format_context(self, documents: list) -> str:
        """Format documents into context string"""
        if not documents:
            return "(No relevant documents found)"
        
        context_parts = []
        for i, doc in enumerate(documents, 1):
            source = doc["metadata"].get("source", "Unknown")
            page = doc["metadata"].get("page", "N/A")
            
            context_parts.append(
                f"[{i}] (Source: {source}, Page {page})\n{doc['content']}"
            )
        
        return "\n\n".join(context_parts)
    
    def _build_prompt(self, query: str, context: str) -> str:
        """Build RAG prompt for LLM"""
        prompt = f"""Based on the following context from EPA and WHO guidelines, answer the user's question.

CONTEXT:
{context}

USER QUESTION: {query}

INSTRUCTIONS:
1. Use ONLY information from the provided context
2. If the context doesn't contain relevant information, say so clearly
3. Cite the source (e.g., [1], [2]) when using information
4. Be concise and practical
5. Include specific numbers/thresholds when available

ANSWER:"""
        
        return prompt
    
    def get_stats(self) -> dict:
        """Get RAG chain statistics"""
        return self.retriever.get_stats()


# Simplified function for quick use
def run_rag_query(query: str, k: int = 5, llm=None) -> dict:
    """
    Quick function to run RAG query
    
    Args:
        query: User query
        k: Number of documents
        llm: Optional LLM instance
    
    Returns:
        RAG result dict
    """
    chain = RAGChain(llm=llm)
    return chain.invoke(query, k=k)
