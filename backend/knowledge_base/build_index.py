"""
Script to build the FAISS Vector Index from company knowledge documents.
Uses Sentence Transformers (all-MiniLM-L6-v2) to generate dense embeddings.
"""

import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DOC_PATH = os.path.join(CURRENT_DIR, "company_info.txt")
INDEX_OUTPUT_DIR = os.path.join(CURRENT_DIR, "faiss_index")


def build_faiss_index():
    print(f"Loading document from: {DOC_PATH}")
    if not os.path.exists(DOC_PATH):
        raise FileNotFoundError(f"Knowledge document not found at: {DOC_PATH}")

    loader = TextLoader(DOC_PATH, encoding="utf-8")
    documents = loader.load()

    # Split into chunks suitable for semantic search
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", "###", "##", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Total chunks created: {len(chunks)}")

    # Initialize lightweight embedding model
    print("Loading embedding model (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    # Build and save FAISS index
    print("Generating embeddings and building FAISS vector store...")
    vector_store = FAISS.from_documents(chunks, embeddings)

    os.makedirs(INDEX_OUTPUT_DIR, exist_ok=True)
    vector_store.save_local(INDEX_OUTPUT_DIR)
    print(f"FAISS vector index successfully built and saved to: {INDEX_OUTPUT_DIR}")


if __name__ == "__main__":
    build_faiss_index()
