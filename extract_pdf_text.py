import pypdf
import sys

def extract_text(pdf_path):
    print(f"--- START OF {pdf_path} ---")
    try:
        reader = pypdf.PdfReader(pdf_path)
        for page in reader.pages:
            print(page.extract_text())
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    print(f"--- END OF {pdf_path} ---")

files = [
    r"c:\Users\Hello\Downloads\Machine Intelligence  Assignment 1.pdf",
    r"c:\Users\Hello\Downloads\Introduction_MI.pdf"
]

for f in files:
    extract_text(f)
