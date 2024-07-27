import streamlit as st
import google.generativeai as genai
import fitz  # PyMuPDF
import io

GOOGLE_API_KEY = "AIzaSyCr109nLhfwS7ozcKEsO20PldcmWHoxgYA"
genai.configure(api_key=GOOGLE_API_KEY)

MODEL_CONFIG = {
  "temperature": 0.2,
  "top_p": 1,
  "top_k": 32,
  "max_output_tokens": 4096,
}

safety_settings = [
  {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
  {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
  {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
  {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
]

model = genai.GenerativeModel('gemini-1.5-flash', safety_settings=safety_settings)

def extract_text_from_file(uploaded_file):
    if uploaded_file.type == "application/pdf":
        doc = fitz.open(stream=uploaded_file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    elif uploaded_file.type == "text/plain":
        return str(uploaded_file.read(), "utf-8")
    else:
        st.error("Unsupported file type")
        return None

def generate_mcqs(text, num_mcqs, difficulty):
    prompt = (
        f"Generate {num_mcqs} multiple-choice questions from the following text "
        f"with a {difficulty} difficulty level. The questions should be appropriate for "
        f"{'elementary' if difficulty == 'Easy' else 'high school' if difficulty == 'Medium' else 'college'} level students.\n\n"
        f"Text:\n{text}\n\nQuestions:"
    )
    response = model.generate_content(prompt)
    return response.text

st.title("MCQ Generator")

num_mcqs = st.number_input("Enter the number of MCQs to generate", min_value=1, max_value=100, value=5)
difficulty = st.selectbox("Select the difficulty level", ["Easy", "Medium", "Hard"])
uploaded_file = st.file_uploader("Upload a text file or PDF file", type=["txt", "pdf"])

if st.button("Generate MCQs"):
    if uploaded_file is not None:
        text = extract_text_from_file(uploaded_file)
        if text:
            mcqs = generate_mcqs(text, num_mcqs, difficulty)
            st.markdown("### Generated MCQs")
            st.write(mcqs)
    else:
        st.error("Please upload a file.")
