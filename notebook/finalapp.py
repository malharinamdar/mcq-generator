import streamlit as st
import google.generativeai as genai
import fitz  # PyMuPDF
from PIL import Image
import pytesseract 

API_KEY =st.secrets["API_KEY"]
genai.configure(api_key=API_KEY)

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
    elif uploaded_file.type in ["image/png", "image/jpeg", "image/jpg"]:
        image = Image.open(uploaded_file)
        text = pytesseract.image_to_string(image)
        return text
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
uploaded_file = st.file_uploader("Upload a text file, PDF file, or image file", type=["txt", "pdf", "png", "jpeg", "jpg"])

if st.button("Generate MCQs"):
    if uploaded_file is not None:
        text = extract_text_from_file(uploaded_file)
        if text:
            mcqs = generate_mcqs(text, num_mcqs, difficulty)
            
            # Split the response into individual questions
            questions = mcqs.split("\n\n")
            st.markdown("### Generated MCQs")
            for question in questions:
                # Display each question and its options on a new line
                st.write(question.replace("\n", "\n\n"))
                
            # Button to show correct answers
            with st.expander("Show Correct Answers"):
                st.markdown("### Correct Answers")
                # Assuming the API response includes answers
                for i, question in enumerate(questions, start=1):
                    answer_line = question.split("\n")[-1]  # Assuming the last line is the answer
                    st.write(f"Answer {i}: {answer_line}")
    else:
        st.error("Please upload a file.")
