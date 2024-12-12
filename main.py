from flask import Flask, request, jsonify, render_template
import random
import openai

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/answer", methods=["POST"])
def answer():
    message_s = request.json["message_s"]
    n = main(message_s)
    
    return jsonify(n)


openai.api_key = "Your openai key"

model_engine = "text-davinci-002"
def generate_text(prompt):
    completions = openai.Completion.create(
        engine=model_engine,
        prompt=prompt,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=1.3  
    )

    message = completions.choices[0].text
    return message.strip()

filename = "personality.txt"
context_filename = "context.txt"

with open(filename, "r", encoding="utf-8") as file:
    lines = [line.strip() for line in file.readlines()]

questions = lines[0::2]
answers = lines[1::2]

personality_traits = " ".join(answers)

def load_context(filename):
    with open(filename, "r", encoding="utf-8") as file:
        context = file.read().splitlines()[-10:]  
    return "\n".join(context)

def load_person(filename):
    with open(filename, "r", encoding="utf-8") as file:
        context = file.read().splitlines()  
    return "\n".join(context)

def save_context(filename, context):
    with open(filename, "a", encoding="utf-8") as file: 
        file.write(context)

def add_new_information(context, new_info):
    context += f"\n{new_info}"
    return context

def check_for_image_request(user_input):
    image_keywords = ["bild", "foto", "image", "picture"]
    if any(keyword in user_input.lower() for keyword in image_keywords):
        return True
    return False

def check_for_video_request(user_input):
    video_keywords = ["video", "Film", "Movie"]
    if any(keyword in user_input.lower() for keyword in video_keywords):
        return True
    return False

def load_suggested_phrases(filename):
    with open(filename, "r", encoding="utf-8") as file:
        phrases = [line.strip() for line in file.readlines()]
    return phrases

suggested_phrases_filename = "suggested_phrases.txt"
suggested_phrases = load_suggested_phrases(suggested_phrases_filename)

@app.route("/suggested_phrases")
def get_suggested_phrases():
    return jsonify(suggested_phrases)


def main(user_input):
    context_filename = "context.txt"
    personality_filename = "personality.txt"
    
    if check_for_image_request(user_input):
        image_url = "/static/images/send_p.jpg" 
        response_text = "picture sent"
        save_context(context_filename, user_input + "\n" + response_text + "\n")
        return {"answer": response_text, "image": image_url}
    
    if check_for_video_request(user_input):
        video_url = "/static/videos/video_r.mp4"
        response_text = "video sent"
        save_context(context_filename, user_input + "\n" + response_text + "\n")
        return {"answer": response_text, "video": video_url}

    else:
        context = load_context(context_filename)
        personality = load_person(personality_filename)
        prompt = f"{personality}\n\n{context}Q: {user_input}\nA:"
        save_context("promt.txt", prompt)
        generated_text = generate_text(prompt)
        save_context(context_filename, user_input + "\n" + generated_text + "\n")
        return {"answer": generated_text}


if __name__ == "__main__":
    app.run(debug=True)
