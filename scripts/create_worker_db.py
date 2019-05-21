import sqlite3
from sqlite3 import Error

def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    sql_create_worker_table = """CREATE TABLE IF NOT EXISTS workers (
                                    worker_id varchar(1023),
                                    number_hits_since_validation integer NOT NULL
                                );"""

    sql_create_task_table = """CREATE TABLE IF NOT EXISTS completed_tasks (
                                    worker_id varchar(1023),
                                    video_id integer NOT NULL,
                                    timestamp timestamp NOT NULL
                                );"""

    sql_create_videos_table = """CREATE TABLE IF NOT EXISTS video_urls (
                                    video_id integer PRIMARY KEY,
                                    video_url varchar(1023) NOT NULL,
                                    validation bit NOT NULL
                                );"""

    c.execute("DROP TABLE IF EXISTS workers")
    c.execute("DROP TABLE IF EXISTS completed_tasks")
    c.execute("DROP TABLE IF EXISTS videos")
    c.execute(sql_create_worker_table)
    c.execute(sql_create_task_table)
    c.execute(sql_create_videos_table)
    c.execute('SELECT name from sqlite_master where type= "table"')
    print(c.fetchall())

    conn.close()

if __name__ == '__main__':
    create_connection("C:/Users/divya/Documents/UROP/equirect_localization_mturk/db/localization.db")