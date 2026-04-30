import json
import os
import redis
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/taskdb')
DB_NAME = os.getenv('DB_NAME', 'taskdb')

# Connect to Redis
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Connect to MongoDB
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
tasks_collection = db['tasks']


def process_task(task_data):
    task_id = ObjectId(task_data['taskId'])
    task = tasks_collection.find_one({'_id': task_id})
    if not task:
        print(f"Task {task_id} not found")
        return

    tasks_collection.update_one({'_id': task_id}, {'$set': {'status': 'running'}})

    input_text = task.get('input', '')
    operation = task.get('operation', '')
    result = ''
    logs = ''

    try:
        if operation == 'uppercase':
            result = input_text.upper()
        elif operation == 'lowercase':
            result = input_text.lower()
        elif operation == 'reverse':
            result = input_text[::-1]
        elif operation == 'word_count':
            result = str(len(input_text.split()))
        else:
            raise ValueError('Invalid operation')

        logs = 'Task processed successfully'
        status = 'success'
    except Exception as e:
        logs = str(e)
        status = 'failed'

    tasks_collection.update_one(
        {'_id': task_id},
        {'$set': {'status': status, 'result': result, 'logs': logs}}
    )


def main():
    print('Worker started')
    while True:
        task_data = redis_client.brpop('task_queue', timeout=0)
        if task_data:
            _, message = task_data
            task_data = json.loads(message)
            print(f"Processing task {task_data['taskId']}")
            process_task(task_data)


if __name__ == '__main__':
    main()