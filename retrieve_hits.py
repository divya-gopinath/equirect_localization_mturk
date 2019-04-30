import boto3

MTURK_SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'
mturk = boto3.client('mturk', endpoint_url = MTURK_SANDBOX)
# Use the hit_id previously created
hit_id = '3DIIW4IV8PKK9PK98QH1WQ8TVP54I0'
# We are only publishing this task to one Worker
# So we will get back an array with one item if it has been completed
worker_results = mturk.list_assignments_for_hit(HITId=hit_id, AssignmentStatuses=['Submitted'])
print(worker_results)