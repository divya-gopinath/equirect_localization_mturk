from flask import Flask, render_template, request, url_for
from db_utils import *
from validate import *
import os
import json
import pickle

VIDEO_URL = "https://www.dl.dropboxusercontent.com/s/eirjhecnnnx3tqr/3_19_19_synced_Large.mp4"
VALIDATION_VIDEO_URL = "https://www.dl.dropboxusercontent.com/s/8m2kifp2g2by9jb/validation.mp4"
DB_PATH = os.path.join(os.getcwd(), "db/localization.db")
HUNGARIAN_THRESH = 10

app = Flask(__name__)

@app.route("/")
def home():
    conn = sqlite3.connect(DB_PATH)
    worker_id = request.args.get('workerId', 'FAKE_USER')
    videoId, videoURL, validation = get_next_video(conn, worker_id)
    if videoId is None:
        return "Sorry, you have localized all of our videos. Thank you!"
    conn.close()
    info = {
        'assignmentId' : request.args.get('assignmentId', 0),
        'videoId' : videoId,
        'videoURL' : videoURL,
        'validation' : validation
    }
    return render_template("intro.html", value=info)

@app.route("/continue", methods=['GET', 'POST'])
def next_page():
    info = {
        'videoURL' : request.form.get('videoURL'),
        'videoId' : request.form.get('videoId'),
        'validation' : request.form.get('validation'),
        'assignmentId' : request.form.get('assignmentId', 0)
    }
    return render_template("index.html", value=info)

@app.route("/validate", methods=['GET'])
def validate_sources():
    videoURL = request.args.get('videoURL')
    sources = json.loads(request.args.get('localizedSources'))
    test = parse_labels_json(sources)
    with open("db/ground_truths.pkl", "rb") as fp:
        truth = pickle.load(fp)[videoURL]
        matching = hungarian_validate(test, truth)
        print(matching)
        return "true" if matching < HUNGARIAN_THRESH else "false"

@app.route("/displaydata", methods=['GET'])
def display_data():
    conn = sqlite3.connect(DB_PATH)
    result = pretty_print_all(conn)
    conn.close()
    return result


if __name__ == "__main__":
    app.run()