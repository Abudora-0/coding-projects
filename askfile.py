import sys
import os
import requests
import json

# ── Read file content ─────────────────────────────────────────────────────────
def read_file(path):
    ext = os.path.splitext(path)[1].lower()

    if ext == ".pdf":
        from PyPDF2 import PdfReader
        reader = PdfReader(path)
        return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())

    elif ext in [".docx", ".doc"]:
        from docx import Document
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs if p.text)

    elif ext in [".txt", ".md", ".csv", ".py", ".js", ".ts", ".html", ".css", ".json", ".sql"]:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    else:
        print(f"Sorry, file type '{ext}' is not supported yet.")
        print("Supported: PDF, DOCX, TXT, MD, CSV, PY, JS, SQL, HTML, JSON")
        sys.exit(1)

# ── Ask Ollama ────────────────────────────────────────────────────────────────
def ask_ollama(file_content, question, model="phi3:mini"):
    prompt = f"""Here is the content of a file:

---
{file_content[:6000]}
---

Based on the file above, answer this question:
{question}"""

    print("\nThinking...\n")
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": True},
        stream=True
    )

    for line in response.iter_lines():
        if line:
            data = json.loads(line)
            print(data.get("response", ""), end="", flush=True)
    print("\n")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 50)
    print("   Ask AI About Any File")
    print("=" * 50)

    # Get file path
    if len(sys.argv) > 1:
        file_path = " ".join(sys.argv[1:])
    else:
        file_path = input("\nDrag & drop your file here (or type the path): ").strip().strip('"')

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    print(f"\nReading file: {os.path.basename(file_path)}")
    content = read_file(file_path)
    print(f"File loaded! ({len(content)} characters)")
    print("\nYou can now ask questions about this file.")
    print("Type 'exit' to quit.\n")

    # Chat loop
    while True:
        question = input("Your question: ").strip()
        if question.lower() in ["exit", "quit", "bye"]:
            print("Goodbye!")
            break
        if not question:
            continue
        ask_ollama(content, question)

if __name__ == "__main__":
    main()
