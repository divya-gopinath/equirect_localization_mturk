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

## Validation Strategy
Using Hungarian algorithm from scipy to perform a bipartite matching on _paths_ that are formed on objects when they localize.
Using the Fréchet distance defined on polygonal (piecewise linear) curves ass found here:  http://www.kr.tuwien.ac.at/staff/eiter/et-archive/cdtr9464.pdf

Paths are represented as sequence of 3-D points `(x, y, t)`. The ground truths are pulled from a dictionary stored in the `db/` folder.
Some edge-case information:
* When an object goes out of frame, the current path ends. If the object happens to reappear later in the video, a new curve begins at this point.
* When an object is deleted, it is obviously not included in the calculation.
* The Fréchet distance between two paths P1 and P2 requires that they both contain the same amount of piecewise linear segments for the algorithm to run. To deal with this, if P1 is compromised of points a --> b --> c and P2 is d --> e, P2 will be padded (wlog) to be d --> e --> e in order to match the length of P1. 


## TODOs
- Figure out how to automatically detect that a HIT has been completed, and insert into table.

