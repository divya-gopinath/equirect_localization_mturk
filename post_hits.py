import boto3
import boto

MTURK_SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'
VIDEO_HOST = 'https://sound-localization.herokuapp.com/'
question = open('question.xml', 'r').read()
print(question)

mturk = boto3.client('mturk', endpoint_url = MTURK_SANDBOX)
new_hit = mturk.create_hit(
    Title = 'Can you localize sounds in this video?',
    Description = 'Using 3-D camera feed and two-channel audio, localize the sounds in this video.',
    Keywords = 'video, audio, labelling',
    Reward = '0.0',
    MaxAssignments = 1,
    LifetimeInSeconds = 172800,
    AssignmentDurationInSeconds = 600,
    AutoApprovalDelayInSeconds = 14400,
    Question = question,
)

print("A new HIT has been created. You can preview it here:")
print("https://workersandbox.mturk.com/mturk/preview?groupId=" + new_hit['HIT']['HITGroupId'])
print("HITID = " + new_hit['HIT']['HITId'] + " (Use to Get Results)")
