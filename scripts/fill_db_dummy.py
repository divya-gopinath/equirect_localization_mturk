import sqlite3
import string
import random

def fill_dummy_rows(db_file, num_rows):
    """ create a database connection to a SQLite database """
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    VIDEO_URL = "https://www.dl.dropboxusercontent.com/s/eirjhecnnnx3tqr/3_19_19_synced_Large.mp4"
    VALIDATION_VIDEO_URL = "https://www.dl.dropboxusercontent.com/s/8m2kifp2g2by9jb/validation.mp4"

    for _ in range(num_rows):
        worker_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=20))
        print(worker_id)
        validation = random.random() <= 0.5
        video_url = VALIDATION_VIDEO_URL if validation else VIDEO_URL
        worker_string = "INSERT INTO workers VALUES('{}', 0, 0)".format(worker_id)
        task_string = "INSERT INTO completed_tasks VALUES('{}', 1, DATETIME('now'))".format(worker_id)
        videos_string = "INSERT INTO video_urls(video_url, validation) VALUES('{}', {})".format(video_url, int(validation))
        # c.execute(worker_string)
        # c.execute(task_string)
        c.execute(videos_string)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    fill_dummy_rows("C:/Users/divya/Documents/UROP/equirect_localization_mturk/db/localization.db", 10)