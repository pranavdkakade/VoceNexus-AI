"""
RAG Service for VoceNexus AI.
Loads the FAISS index and performs semantic retrieval over company documentation.
"""

import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Index resides in backend/knowledge_base/faiss_index
INDEX_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "knowledge_base", "faiss_index"))


class RAGService:
    def __init__(self):
        self.vector_store = None
        self.embeddings = None
        self._initialize()

    def _initialize(self):
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True}
            )
            if os.path.exists(INDEX_DIR) and os.path.exists(os.path.join(INDEX_DIR, "index.faiss")):
                self.vector_store = FAISS.load_local(
                    INDEX_DIR,
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
            else:
                self.vector_store = None
        except Exception as e:
            print(f"Warning: RAG index initialization failed: {e}")
            self.vector_store = None

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Perform similarity search on query string.
        Returns list of relevant chunks with content and relevance score.
        """
        if not self.vector_store:
            # Attempt to re-load if created after startup
            if os.path.exists(INDEX_DIR) and os.path.exists(os.path.join(INDEX_DIR, "index.faiss")):
                self._initialize()
            if not self.vector_store:
                return []

        try:
            results_with_scores = self.vector_store.similarity_search_with_score(query, k=top_k)
            formatted = []
            for doc, score in results_with_scores:
                formatted.append({
                    "content": doc.page_content.strip(),
                    "score": float(score)
                })
            return formatted
        except Exception as e:
            print(f"Error during RAG search: {e}")
            return []


# Singleton RAG instance
rag_service = RAGService()
