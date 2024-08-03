# mcq generator webapp using llm
simple webapp built for generating `multiple choice questions` by analysing a piece of text 
to be input by the user in `.txt` or `pdf` format.

The `mcqs` generated can be in varying order of difficulty as per the choice of user,
`easy`, `medium` or `hard`.

number of questions are also to be input by the user as per their requirement.

## structure
my initial idea to implement this project was with the help of `T5 Transformer` `encoder-decoder`
and `BERT` `encoder` model, using `NLP` techniques.

but due to constraints I halted that idea for future. Hence, I implemented the idea using `gemini-1.5-flash`
LLM model.

I hope to keep updating the webapp with additional features, consistently.

## deployment
webapp deployed on <a href="https://mcq-generator-web.streamlit.app/">Website</a>
