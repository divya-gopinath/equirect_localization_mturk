from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("intro.html", value=request.args.get('assignmentId', 0))

@app.route("/continue", methods=['GET', 'POST'])
def next_page():
    return render_template("index.html", value=request.form.get('assignmentId', 0))

if __name__ == "__main__":
    app.run()