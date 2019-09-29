# -*- coding: utf-8 -*-
from pymongo import MongoClient
from bson import ObjectId
from challenge import Challenge
import task_checker

false = False
true = True
null = None

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

    def create_challenge(self, name, description, complete_message, tasks, max_participants, challenge_hashtag, winner, first_name, last_name, user_photo, cover, category, group_publisher=None):
        if not isinstance(tasks, list):
            raise Exception('ApiException', 'Invalid format for tasks. It should be [{validator: ..., description: ..., value:...}, ... ]')
        for i in tasks:
            if 'type' not in list(i.keys()) or 'value' not in list(i.keys()) or 'description' not in list(i.keys()):
                raise Exception('ApiException', 'Invalid format for tasks. It should be [{validator: ..., description: ..., value:...}, ... ]')  

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
            'first_name': first_name,
            'last_name': last_name,
            'user_photo': user_photo,
            'status': None,
            'cover': cover,
            'category': category
        }

        if group_publisher == None:
            challenge['publisher'] = self._id
        else:
            challenge['publisher'] = group_publisher

        challenge_id = self.db.challenges.insert_one(challenge).inserted_id

        self.db.users.update_one({'_id': self._id}, {'$push' : {'created_challenges': challenge_id}})
        
        return str(challenge_id)
    
    def join_challenge(self, challenge_id):
        if str(self._id) in self.db.challenges.find_one({'_id': ObjectId(challenge_id)})['participants']:
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
        if -int(group_id) in [i['group_id'] for i in self.db.users.find_one({'_id': self._id})['connected_groups']]:
            raise Exception('ApiException', 'Group already added!')
        self.db.users.update_one({'_id': self._id}, {'$push': {'connected_groups': {'group_id': -int(group_id), 'group_name': group_name}}})
        return group_id

    def disconnect_group(self, group_id):
        self.db.users.update_one({'_id': self._id}, {'$pull': {'connected_groups': {'group_id': -int(group_id)}}})
        return group_id
    
    def check_task(self, api_data, challenge_id, task_index):
        print(challenge_id)
        print(task_index)
        # print(type(api_data))
        print(api_data)

        if str(self._id) not in self.db.challenges.find_one({'_id': ObjectId(challenge_id)})['participants']:
            raise Exception('ApiException', 'You are not a challenger here')

        for i,v in enumerate(self.db.users.find_one({'_id': self._id})['challenges']):
            if v['challenge_id'] == ObjectId(challenge_id):
                challenge_index = i
                break
        
        print(challenge_index)
        task = Challenge(challenge_id).get_challenge_info()['tasks'][task_index]

        if task['type'].encode('utf-8') == 'Репост':
            if task_checker.check_repost(api_data, task['value']):
                self.db.users.update_one({"_id" : str(self._id)}, {'$set': {'challenges.%s.tasks_completed.%s.completed' % (challenge_index, task_index): True}})
                return True
            return False
        elif task['type'].encode('utf-8') == 'Хештег':
            if task_checker.check_hashtag(api_data, task['value']):
                self.db.users.update_one({"_id" : str(self._id)}, {'$set': {'challenges.%s.tasks_completed.%s.completed' % (challenge_index, task_index): True}})
                return True
            return False
        elif task['type'].encode('utf-8') == 'Хештег и фото':
            if task_checker.check_hashtag_and_photo(api_data, task['value']):
                self.db.users.update_one({"_id" : str(self._id)}, {'$set': {'challenges.%s.tasks_completed.%s.completed' % (challenge_index, task_index): True}})
                return True
            return False
        elif task['type'].encode('utf-8') == 'Подписка':
            if task_checker.check_subscription(api_data):
                self.db.users.update_one({"_id" : str(self._id)}, {'$set': {'challenges.%s.tasks_completed.%s.completed' % (challenge_index, task_index): True}})
                return True
            return False
        elif task['type'].encode('utf-8') == 'Отметка пользователя':
            if task_checker.check_mention(api_data, task['value']):
                self.db.users.update_one({"_id" : str(self._id)}, {'$set': {'challenges.%s.tasks_completed.%s.completed' % (challenge_index, task_index): True}})
                return True
            return False
        elif task['type'].encode('utf-8') == 'Лайк':
            if task_checker.check_like(api_data):
                self.db.users.update_one({"_id" : str(self._id)}, {'$set': {'challenges.%s.tasks_completed.%s.completed' % (challenge_index, task_index): True}})
                return True
            return False

    
    def join_main_challenge(self):
        pass
               
        