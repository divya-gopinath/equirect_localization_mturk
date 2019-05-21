from flask import Flask, render_template, request, url_for
from db_utils import *
import os
import json

VIDEO_URL = "https://www.dl.dropboxusercontent.com/s/eirjhecnnnx3tqr/3_19_19_synced_Large.mp4"
VALIDATION_VIDEO_URL = "https://www.dl.dropboxusercontent.com/s/8m2kifp2g2by9jb/validation.mp4"
DB_PATH = os.path.join(os.getcwd(), "db/localization.db")

app = Flask(__name__)

@app.route("/")
def home():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    worker_id = 'RGXO9A03YU29WRR2SQMI'
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
    # TODO -- run validation algorithm
    return "true"

if __name__ == "__main__":
    app.run()