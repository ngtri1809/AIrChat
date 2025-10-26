"""
Document loader for RAG pipeline
Load and chunk PDFs from knowledge base
"""
from pathlib import Path
from typing import List, Dict, Any

# Knowledge base paths
KB_ROOT = Path(__file__).parent.parent / "data" / "kb"
EPA_KB_PATH = KB_ROOT / "epa"
WHO_KB_PATH = KB_ROOT / "who"


def load_knowledge_base(chunk_size: int = 800, chunk_overlap: int = 120) -> List[Dict[str, Any]]:
    """
    Load and chunk all knowledge base documents
    
    Args:
        chunk_size: Size of text chunks
        chunk_overlap: Overlap between chunks
    
    Returns:
        List of document chunks with metadata
    """
    try:
        from langchain_community.document_loaders import PyPDFLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        raise ImportError("Please install: pip install pypdf langchain-text-splitters")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    
    documents = []
    
    # Load EPA documents
    epa_docs = _load_pdfs_from_dir(EPA_KB_PATH, "epa", text_splitter)
    documents.extend(epa_docs)
    print(f"📚 EPA: {len(epa_docs)} chunks")
    
    # Load WHO documents
    who_docs = _load_pdfs_from_dir(WHO_KB_PATH, "who", text_splitter)
    documents.extend(who_docs)
    print(f"📚 WHO: {len(who_docs)} chunks")
    
    print(f"✅ Total: {len(documents)} document chunks")
    
    return documents


def _load_pdfs_from_dir(directory: Path, domain: str, text_splitter) -> List[Dict[str, Any]]:
    """
    Load PDFs from directory
    
    Args:
        directory: Path to PDF directory
        domain: Domain label (epa, who)
        text_splitter: LangChain text splitter
    
    Returns:
        List of document chunks
    """
    from langchain_community.document_loaders import PyPDFLoader
    
    documents = []
    
    if not directory.exists():
        print(f"⚠️  Directory not found: {directory}")
        return documents
    
    pdf_files = list(directory.glob("*.pdf"))
    if not pdf_files:
        print(f"⚠️  No PDFs in {directory}")
        return documents
    
    for pdf_file in pdf_files:
        try:
            loader = PyPDFLoader(str(pdf_file))
            pages = loader.load()
            
            for page_num, page in enumerate(pages):
                chunks = text_splitter.split_text(page.page_content)
                
                for chunk_num, chunk in enumerate(chunks):
                    documents.append({
                        "content": chunk,
                        "metadata": {
                            "source": pdf_file.name,
                            "domain": domain,
                            "page": page_num + 1,
                            "chunk": chunk_num + 1
                        }
                    })
            
            print(f"  ✅ {pdf_file.name}: {len(pages)} pages")
            
        except Exception as e:
            print(f"  ❌ Error loading {pdf_file.name}: {str(e)}")
    
    return documents


def list_kb_files() -> Dict[str, List[str]]:
    """List all knowledge base files"""
    epa_files = [f.name for f in EPA_KB_PATH.glob("*.pdf")] if EPA_KB_PATH.exists() else []
    who_files = [f.name for f in WHO_KB_PATH.glob("*.pdf")] if WHO_KB_PATH.exists() else []
    
    return {
        "epa": epa_files,
        "who": who_files,
        "total": len(epa_files) + len(who_files)
    }
