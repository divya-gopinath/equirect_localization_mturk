# equirect_localization_mturk
Video annotation framework to localize sounds within a 3D equirectangular video, for mTurk labelling.

Currently testing video, hosted at https://sound-localization.herokuapp.com/

## Database Schema
All SQLite3 tables.

`worker`:
* `worker_id varchar(1023)` which is the unique String ID that Amazon mTurk assigns to a worker
* `number_hits_since_validation integer` denotes the number of non-validation HITS the worker has completed since the last validation procedure, which is used to determine whether the next video should be a validation video

`completed_tasks`
* `worker_id varchar(1023)`
* `video_id integer` integer ID denoting whatever video the worker has completed
* `timestamp timestamp` at which the worker completed the HIT (so we have a chronology if needed)

`video_urls`
* `video_id integer`
* `video_url varchar(1023)` URL of video
* `validation bit` boolean indicating whether the video is a validation video or a regular video

The ground truth values for any validation videos will be stored in a pickle file that is read in.

## TODOs
- Implement validation API endpoint in `server.py` - use some thresholding instead of LP?
- Figure out how to automatically detect that a HIT has been completed, and insert into table.

