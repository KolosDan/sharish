from pymongo import MongoClient
from bson import ObjectId

class User:
    def __init__(self, _id):
        self.client = MongoClient()
        self.db = self.client.sharish
        if _id == 'undefined':
            raise Exception('ApiException', 'ID set to undefined')

        if self.db.users.find_one({'_id': _id}) == None:
            self.db.users.insert_one({'_id': _id, 'connected_groups': [], 'challenges': [], 'created_challenges': []}) #push-notification-settings, privacy
        
        self._id = _id
    
    def __del__(self):
        self.client.close()
    
    def get_user_info(self):
        result = self.db.users.find_one({'_id': self._id})
        result['challenges'] = [str(i) for i in result['challenges']]
        result['created_challenges'] = [str(i) for i in result['created_challenges']]

        return result

    def create_challenge(self, name, description, complete_message, tasks, max_participants, challenge_hashtag, winner, group_publisher=None):
        print('GOT')
        if not isinstance(tasks, list):
            raise Exception('ApiException', 'Invalid format for tasks. It should be [{validator: ..., description: ..., value:...}, ... ]')
        for i in tasks:
            if 'type' not in list(i.keys()) or 'value' not in list(i.keys()) or 'description' not in list(i.keys()):
                raise Exception('ApiException', 'Invalid format for tasks. It should be [{validator: ..., description: ..., value:...}, ... ]')  
        print('CHECKED')

        challenge = {
            'name': name,
            'description': description,
            'complete_message': complete_message,
            'author_id': self._id,
            'tasks': tasks,
            'hashtag': challenge_hashtag,
            'participants': [],
            'max_participants': int(max_participants),
            'winner': winner,
            'status': None
        }

        if group_publisher == None:
            challenge['publisher'] = self._id
        else:
            challenge['publisher'] = group_publisher

        challenge_id = self.db.challenges.insert_one(challenge).inserted_id

        self.db.users.update_one({'_id': self._id}, {'$push' : {'created_challenges': challenge_id}})
        
        return str(challenge_id)
    
    def join_challenge(self, challenge_id):
        if ObjectId(challenge_id) in self.db.users.find_one({'_id': self._id})['challenges']:
            raise Exception('ApiException', 'Challenge already added')
        
        challenge = self.db.challenges.find_one({'_id': ObjectId(challenge_id)})

        if challenge == None:
            raise Exception('ApiException', 'Challenge does not exist')

        tasks_completed = [{'task_index': i, 'completed': False} for i in range(len(challenge['tasks']))]

        self.db.users.update_one({'_id': self._id }, {'$push': {'challenges': {'challenge_id': ObjectId(challenge_id), 'tasks_completed': tasks_completed}}})
        self.db.challenges.update_one({'_id': ObjectId(challenge_id)}, {'$push': {'participants': self._id}})

        return challenge_id
    
    def remove_challenge(self, challenge_id):
        self.db.users.update({"_id" : "67880703"}, {'$pull': {'challenges': {'challenge_id': ObjectId(challenge_id)}}})
        return challenge_id
    
    def connect_group(self, group_id, group_name):
        self.db.users.update_one({'_id': self._id}, {'$push': {'connected_groups': {'group_id': group_id, 'group_name': group_name}}})
        return group_id
    
