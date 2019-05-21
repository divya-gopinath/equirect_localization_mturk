# equirect_localization_mturk
Video annotation framework to localize sounds within a 3D equirectangular video, for mTurk labelling.

Currently testing video, hosted at https://sound-localization.herokuapp.com/

## Database Schema
`worker`:
* `worker_id varchar(1023)`
* `qualified bit` #TODO- remove
* `number_hits_since_validation integer`

`completed_tasks`
* `worker_id varchar(1023)`
* `video_id integer`
* `timestamp timestamp`

`video_urls`
* `video_id integer`
* `video_url varchar(1023)`
* `validation bit`
