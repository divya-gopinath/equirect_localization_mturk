import sqlite3
import random

def is_returning_worker(conn, workerId):
    """
    Returns boolean value indicating whether worker has attempted a task before.
    """
    query = "SELECT * FROM workers WHERE worker_id = '{}'".format(worker_id)
    return len(conn.execute(query).fetchall()) != 0


def check_worker_qualified(conn, workerId):
  """
  Returns boolean value indicating whether worker is qualified or not.
  """
  query = "SELECT qualified FROM workers WHERE worker_id = '{}'".format(worker_id)
  result = conn.execute(query).fetchall()
  return (len(result) != 0) and bool(result[0][0])

def add_new_worker(conn, workerId):
    """
    Adds new worker to SQL db.
    Returns true if done successfully.
    """
    query = "INSERT INTO workers VALUES('{}', 0, 0)".format(worker_id)
    conn.execute(query)
    conn.commit()
    return True;

def completed_video_ids(conn, workerId):
    """
    Given a worker ID, returns the list of complete videos.
    """
    query = "SELECT video_id FROM completed_tasks WHERE worker_id = '{}'".format(worker_id)
    return [idx[0] for idx in conn.execute(query).fetchall()]

def insert_completed_hit(conn, workerId, videoId):
    pass

def get_next_video(conn, workerId):
    """
    Returns the (videoId, videoURL, validation) tupple of next video to watch.
    ID should be a validation ID if in validation stage.
    """
    query = """
    SELECT
        a.video_id as 'video_id',
        b.video_url as 'video_url',
        b.validation as 'validation'
    FROM
        completed_tasks a
    INNER JOIN
        video_urls b
    ON
        a.worker_id = '{}'
        AND
        a.video_id = b.video_id
    """.format(workerId)

    query3 = "SELECT number_hits_since_validation FROM workers WHERE worker_id = '{}'".format(workerId)
    completed_videos = conn.execute(query).fetchall()

    num_hits_since_validation = conn.execute(query3).fetchall()[0][0]

    need_validation = False
    if num_hits_since_validation == 0:
        need_validation = True

    if num_hits_since_validation > 10:
        if random.random() < 0.6:
            need_validation = True

    if need_validation:
        query4 = "UPDATE workers SET number_hits_since_validation = 0 WHERE worker_id = '{}'".format(workerId)
        conn.execute(query)
        conn.commit()

    query5 = "SELECT * FROM video_urls WHERE validation = {}".format(int(need_validation))
    available_videos = conn.execute(query5).fetchall()
    new_videos = [vid for vid in available_videos if vid not in completed_videos]

    if (len(new_videos) == 0):
        if need_validation:
            return random.choice(available_videos)
        else:
            return (None, None, None)
    return random.choice(new_videos)



if __name__ == '__main__':
    # test out functions
    try:
        conn = sqlite3.connect("C:/Users/divya/Documents/UROP/equirect_localization_mturk/db/localization.db")
        c = conn.cursor()
        worker_id = 'RGXO9A03YU29WRR2SQMI'
        print(get_next_video(conn, worker_id))
    except sqlite3.Error as e:
        print(e)
    finally:
        conn.close()



