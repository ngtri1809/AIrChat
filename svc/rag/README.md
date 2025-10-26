# RAG Pipeline for AIrChat 🤖📚

Retrieval-Augmented Generation (RAG) pipeline combining **Google Embeddings** + **ChromaDB** + **LangChain**.

## 📊 Architecture

```
User Query
    ↓
[RAGChain] (rag_chain.py)
    ↓
[RAGRetriever] (retriever.py)
    ↓
[Vector Store] ChromaDB (vector_store.py)
    ↓
[Documents] EPA + WHO PDFs (document_loader.py)
    ↓
[Embeddings] Google (FREE) or OpenAI (paid)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
pip install langchain-chroma chromadb
pip install langchain-google-genai  # For Google Embeddings (FREE)
pip install langchain-openai        # Optional: For OpenAI Embeddings
```

### 2. Setup Environment

Create `.env` in project root:

```env
# Google Embeddings (FREE - required)
GOOGLE_API_KEY=your_google_api_key

# OpenAI Embeddings (Optional - for premium choice)
# OPENAI_API_KEY=your_openai_key
# EMBEDDING_MODEL=openai  # Default is "google"
```

### 3. Basic Usage

```python
from rag import run_rag_query

# Simple query
result = run_rag_query("What is PM2.5 and its health effects?", k=5)

# Access results
print(result["documents"])  # Retrieved documents
print(result["citations"]) # Source citations
print(result["prompt"])    # Formatted prompt for LLM
```

## 📝 Module Details

### `embeddings.py`
- **`get_embeddings(model='google')`** - Get embedding model (Google or OpenAI)
- **`get_google_embeddings()`** - Google Embeddings (FREE)
- **`get_openai_embeddings()`** - OpenAI Embeddings (paid, $0.02/1M tokens)

**Cost:**
- Google: FREE (1M tokens included)
- OpenAI: $0.02 per 1M tokens

### `vector_store.py`
- **`get_or_create_vector_store()`** - Initialize ChromaDB
- **`add_documents_to_store()`** - Add documents to vector store
- **`search_vector_store()`** - Search with similarity scores

**Storage:** `/svc/data/chroma_db/` (local, persistent)

### `document_loader.py`
- **`load_knowledge_base()`** - Load EPA + WHO PDFs
- **`list_kb_files()`** - List available documents

**KB Location:**
- EPA: `svc/data/kb/epa/`
- WHO: `svc/data/kb/who/`

**Chunking:** 800 tokens, 120 overlap

### `retriever.py`
- **`RAGRetriever`** - Main retrieval class
- **`retrieve()`** - Get relevant documents
- **`retrieve_with_citations()`** - Get documents + formatted citations

**Strategy:** MMR (Maximal Marginal Relevance)
**Threshold:** 0.12 (minimum similarity)

### `rag_chain.py`
- **`RAGChain`** - Main RAG integration
- **`run_rag_query()`** - Quick query function

**Output:**
```python
{
    "query": "...",
    "documents": [...],      # Retrieved documents
    "citations": [...],      # Source info
    "context": "...",        # Formatted context
    "prompt": "..."          # Prompt ready for LLM
}
```

## 🔍 Example Usage

### Basic Retrieval

```python
from rag import RAGRetriever

retriever = RAGRetriever(score_threshold=0.12)
docs = retriever.retrieve(
    query="PM2.5 health effects",
    k=5,
    filter_domain="epa"  # Optional: only EPA docs
)

for doc in docs:
    print(f"Source: {doc['metadata']['source']}")
    print(f"Similarity: {doc['similarity']}")
    print(f"Content: {doc['content'][:200]}...")
```

### With Citations

```python
from rag import RAGRetriever

retriever = RAGRetriever()
result = retriever.retrieve_with_citations(
    query="Air quality guidelines",
    k=3
)

print(result["documents"])  # [{"content": "...", "metadata": {...}, ...}]
print(result["citations"])  # [{"id": 1, "source": "...", "page": ..., ...}]
```

### Full RAG Chain

```python
from rag import RAGChain

chain = RAGChain()
result = chain.invoke("What does WHO recommend for PM2.5?", k=5)

# Get formatted prompt ready for LLM
prompt = result["prompt"]
context = result["context"]
sources = result["citations"]

# Pass to your LLM:
# llm_response = llm.invoke(prompt)
```

## 📚 Knowledge Base Setup

To add more PDFs:

1. Add EPA guides to `svc/data/kb/epa/`
2. Add WHO guidelines to `svc/data/kb/who/`
3. On next load, they'll be automatically indexed

List available files:

```python
from rag import list_kb_files

files = list_kb_files()
print(files)  # {"epa": [...], "who": [...], "total": ...}
```

## 💾 Persistence

- Vector store persists to `/svc/data/chroma_db/`
- Once loaded, KB won't be reloaded (unless deleted)
- Clear storage: `rm -rf svc/data/chroma_db/`

## 🧪 Testing

```python
from rag import RAGChain

# Test basic query
chain = RAGChain()
result = chain.invoke("Test query")
print(f"Found {result['count']} documents")
print(f"Status: {chain.get_stats()}")
```

## 🔧 Configuration

Edit `svc/config/rag.yaml`:

```yaml
chunk_size: 800           # Tokens per chunk
chunk_overlap: 120        # Overlap between chunks
score_threshold: 0.12     # Min similarity (0-1)
retrieval_k: 5           # Default documents to retrieve
embedding_model: google   # google or openai
```

## 📊 Performance

- **Google Embeddings**: ~300ms per query
- **ChromaDB Search**: ~50-100ms
- **Total RAG Query**: ~400-500ms (without LLM)

## 🐛 Troubleshooting

### "GOOGLE_API_KEY not found"
```bash
# Add to .env
export GOOGLE_API_KEY=your_key
# Or source it
source .env
```

### "No documents in vector store"
```python
from rag import load_knowledge_base, get_or_create_vector_store, add_documents_to_store

vs = get_or_create_vector_store()
docs = load_knowledge_base()
add_documents_to_store(vs, docs)
```

### "ChromaDB permission denied"
```bash
# Check permissions
ls -la svc/data/chroma_db/

# Reset if corrupted
rm -rf svc/data/chroma_db/
```

## 🎯 Next Steps

1. ✅ Phase A: RAG Setup (DONE)
2. 🔄 Phase B: AI Agent Integration
   - Add RAG tool to `ai_agent.py`
   - Integrate with ReAct pattern
3. 🎨 Phase C: Frontend UI
   - Show citations in chat
   - Embedding model selector
   - Citation references

## 📖 References

- [ChromaDB Docs](https://docs.trychroma.com/)
- [LangChain RAG](https://python.langchain.com/docs/use_cases/question_answering/)
- [Google Embeddings](https://ai.google.dev/docs/embeddings)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
