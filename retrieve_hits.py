import boto3
mturk = boto3.client('mturk', endpoint_url = MTURK_SANDBOX
)



# Use the hit_id previously created
hit_id = 'PASTE_IN_YOUR_HIT_ID'
# We are only publishing this task to one Worker
# So we will get back an array with one item if it has been completed
worker_results = mturk.list_assignments_for_hit(HITId=hit_id, AssignmentStatuses=['Submitted'])