from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("intro.html", value=request.args['assignmentId'])

@app.route("/continue", methods=['GET', 'POST'])
def next_page():
    return render_template("index.html")

if __name__ == "__main__":
    app.run()