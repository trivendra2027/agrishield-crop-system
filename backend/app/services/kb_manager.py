import os
import hashlib
import json
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class KBManager:
    def __init__(self):
        # Paths are resolved relative to the backend workspace
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.kb_dir = os.path.join(self.base_dir, "knowledge_base")
        self.docs_dir = os.path.join(self.kb_dir, "documents")
        self.manifest_path = os.path.join(self.kb_dir, "kb_manifest.json")
        self.chunks_path = os.path.join(self.kb_dir, "kb_chunks.json")
        self.index_path = os.path.join(self.kb_dir, "vector_store.faiss")
        
        self.model_name = "all-MiniLM-L6-v2"
        self.embedding_model = None
        self.faiss_index = None
        self.chunks_data = []

        # Ensure directories exist
        os.makedirs(self.kb_dir, exist_ok=True)
        os.makedirs(self.docs_dir, exist_ok=True)

    def _load_model(self):
        if self.embedding_model is None:
            logger.info(f"Loading SentenceTransformer model: {self.model_name}...")
            from sentence_transformers import SentenceTransformer
            self.embedding_model = SentenceTransformer(self.model_name)
        return self.embedding_model

    def _load_faiss(self):
        if self.faiss_index is None:
            import faiss
            if os.path.exists(self.index_path):
                logger.info(f"Loading existing FAISS index from {self.index_path}...")
                self.faiss_index = faiss.read_index(self.index_path)
            else:
                logger.info("Initializing new FAISS IndexFlatL2...")
                self.faiss_index = faiss.IndexFlatL2(384)  # 384 dimensions for all-MiniLM-L6-v2
        return self.faiss_index

    def _get_file_hash(self, filepath: str) -> str:
        hasher = hashlib.md5()
        with open(filepath, "rb") as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()

    def _load_chunks_data(self):
        if os.path.exists(self.chunks_path):
            try:
                with open(self.chunks_path, "r", encoding="utf-8") as f:
                    self.chunks_data = json.load(f)
            except Exception as e:
                logger.error(f"Error loading chunks file: {e}")
                self.chunks_data = []
        else:
            self.chunks_data = []
        return self.chunks_data

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text recursively into small overlapping chunks."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def update_knowledge_base(self) -> Dict[str, Any]:
        """
        Scans documents directory, tracks additions/deletions,
        rebuilds FAISS index if changes are detected, and updates manifests.
        """
        import faiss
        from pypdf import PdfReader
        import datetime

        # Ensure directories exist
        os.makedirs(self.docs_dir, exist_ok=True)

        # 1. Read existing manifest
        manifest = {"manifest_version": "1.0", "last_updated": "", "documents": {}}
        if os.path.exists(self.manifest_path):
            try:
                with open(self.manifest_path, "r", encoding="utf-8") as f:
                    manifest = json.load(f)
            except Exception as e:
                logger.error(f"Error reading manifest: {e}")

        # 2. Scan documents directory
        pdf_files = [f for f in os.listdir(self.docs_dir) if f.endswith(".pdf")]
        logger.info(f"Scanning documents dir: found {len(pdf_files)} PDFs.")

        # Compute current files maps
        current_hashes = {}
        for f in pdf_files:
            path = os.path.join(self.docs_dir, f)
            current_hashes[f] = {
                "hash": self._get_file_hash(path),
                "size": os.path.getsize(path)
            }

        # 3. Check if changes exist
        manifest_docs = manifest.get("documents", {})
        has_changes = False

        # Any file added or changed?
        for f, meta in current_hashes.items():
            if f not in manifest_docs or manifest_docs[f]["file_hash"] != meta["hash"]:
                has_changes = True
                logger.info(f"Detected change/addition in file: {f}")
                break

        # Any file removed?
        for f in list(manifest_docs.keys()):
            if f not in current_hashes:
                has_changes = True
                logger.info(f"Detected removal of file: {f}")
                break

        if not has_changes:
            logger.info("No changes detected in knowledge base documents. Skip update.")
            return {"status": "unchanged", "message": "No changes detected."}

        logger.info("Changes detected. Rebuilding vector database...")
        self._load_model()
        
        # We build a fresh FAISS index and chunks list to keep everything clean and synced
        new_index = faiss.IndexFlatL2(384)
        new_chunks_data = []
        new_manifest_docs = {}

        global_chunk_idx = 0
        for f in pdf_files:
            path = os.path.join(self.docs_dir, f)
            meta = current_hashes[f]
            logger.info(f"Processing PDF: {f}")

            try:
                reader = PdfReader(path)
                full_text = ""
                for page_idx, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        full_text += f"\n[Page {page_idx+1}] " + page_text

                # Chunking
                chunks = self.chunk_text(full_text)
                if not chunks:
                    logger.warning(f"No text extracted from {f}, skipping.")
                    continue

                # Embeddings
                embeddings = self.embedding_model.encode(chunks)
                import numpy as np
                embeddings_np = np.array(embeddings).astype("float32")
                
                # Add to FAISS
                new_index.add(embeddings_np)

                # Save chunks data
                for i, chunk in enumerate(chunks):
                    new_chunks_data.append({
                        "id": global_chunk_idx + i,
                        "doc_name": f,
                        "text": chunk.strip()
                    })

                # Determine document version
                old_ver = manifest_docs.get(f, {}).get("version", 0)
                new_ver = old_ver + 1 if (f not in manifest_docs or manifest_docs[f]["file_hash"] != meta["hash"]) else max(1, old_ver)

                new_manifest_docs[f] = {
                    "version": new_ver,
                    "file_hash": meta["hash"],
                    "file_size": meta["size"],
                    "chunk_count": len(chunks),
                    "added_at": manifest_docs.get(f, {}).get("added_at", datetime.datetime.now(timezone.utc).isoformat() + "Z")
                }
                
                global_chunk_idx += len(chunks)
                logger.info(f"Successfully chunked {f}: {len(chunks)} chunks, Version: {new_ver}.")
            except Exception as e:
                logger.error(f"Error parsing PDF {f}: {e}")
                # Keep old metadata in manifest if parsing failed but file was there
                if f in manifest_docs:
                    new_manifest_docs[f] = manifest_docs[f]

        # 4. Save artifacts
        self.faiss_index = new_index
        faiss.write_index(new_index, self.index_path)

        self.chunks_data = new_chunks_data
        with open(self.chunks_path, "w", encoding="utf-8") as f_out:
            json.dump(new_chunks_data, f_out, indent=2, ensure_ascii=False)

        manifest["last_updated"] = datetime.datetime.now(timezone.utc).isoformat() + "Z"
        manifest["documents"] = new_manifest_docs
        with open(self.manifest_path, "w", encoding="utf-8") as f_out:
            json.dump(manifest, f_out, indent=2)

        logger.info("Successfully rebuilt FAISS vector index and manifests.")
        return {
            "status": "updated",
            "last_updated": manifest["last_updated"],
            "documents_count": len(new_manifest_docs),
            "total_chunks": len(new_chunks_data)
        }

    def query_knowledge_base(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Embed the input query and perform similarity search on FAISS vector store.
        Returns matching chunks.
        """
        self._load_model()
        self._load_faiss()
        self._load_chunks_data()

        if self.faiss_index.ntotal == 0 or not self.chunks_data:
            logger.warning("FAISS Index is empty. Returning empty list.")
            return []

        # Generate query embedding
        import numpy as np
        query_vector = self.embedding_model.encode([query_text])
        query_vector_np = np.array(query_vector).astype("float32")

        # Search index
        top_k = min(top_k, self.faiss_index.ntotal)
        distances, indices = self.faiss_index.search(query_vector_np, top_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks_data):
                continue
            chunk = self.chunks_data[idx]
            results.append({
                "doc_name": chunk["doc_name"],
                "text": chunk["text"],
                "distance": float(dist)
            })
        return results

# Singleton instance
kb_manager = KBManager()
