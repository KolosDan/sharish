# -*- coding: utf-8 -*-

from flask import Flask, request
from user import User
from challenge import Challenge, get_challenge_list
from flask_cors import CORS
from bson import ObjectId
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)
false = False
true = True
null = None

#get
@app.route('/get_challenge_list')
def get_challenges():
    try:
        data = request.args
        if {'status'} != set(list(request.args.keys())):
            raise Exception('ApiException', 'Invalid arguments. Awaiting user_id')
        # print(get_challenge_list(data['status']))
        return {'result': get_challenge_list(data['status'])}
    except Exception as e:
        return {'error': str(e)}

#get args: user_id
@app.route('/get_user_info')
def get_user_info():
    try:
        if {'user_id'} != set(list(request.args.keys())):
            raise Exception('ApiException', 'Invalid arguments. Awaiting user_id')
        user_data = User(request.args['user_id']).get_user_info()
        return {'result': user_data}
    except Exception as e:
        return {'error': str(e)}

#get args: user_id, challenge_id
@app.route('/get_progress')
def get_progress():
    try:
        data = request.args
        if {'user_id', 'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        
        current_challenge = None
        for i in User(data['user_id']).get_user_info()['challenges']:
            if i['challenge_id'] == ObjectId(data['challenge_id']):
                current_challenge = i
                break
        
        print('\n\n=====\n\n')
        print(current_challenge)
        print('\n\n=====\n\n')

        if current_challenge == None:
            raise Exception('ApiException', 'No correspondance found')
        
        result = 65
        return {'result' : result}

    except Exception as e:
        return {'error': str(e)}    

#post args: user_id (str), name (str), description (str), complete_message (str), tasks ([{validator: ..., value:...}, ...]), max_participants (str), challenge_hashtag (str), winner (None / int) group_publisher int / None
@app.route('/create_challenge', methods=['POST'])
def create_challenge():
    try:
        data = eval(request.data.decode('utf-8'))
        print('\n\n=====\n\n' + str(data) + '\n\n=====\n\n')
        if {'user_id', 'name', 'description', 'complete_message','tasks', 'max_participants', 'challenge_hashtag', 'winner', 'group_publisher', 'first_name', 'last_name', 'user_photo', 'cover', 'category'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        
        
        if data['group_publisher'] != 'My account':
            return {'result': {'challenge_id': User(str(data['user_id'])).create_challenge(data['name'], data['description'], data['complete_message'], data['tasks'], data['max_participants'], data['challenge_hashtag'], data['winner'], data['first_name'], data['last_name'], data['user_photo'], data['cover'], data['category'], group_publisher= int(data['group_publisher']))}}
        return {'result': {'challenge_id': User(str(data['user_id'])).create_challenge(data['name'], data['description'], data['complete_message'], data['tasks'], data['max_participants'], data['challenge_hashtag'], data['winner'], data['first_name'], data['last_name'], data['user_photo'], data['cover'], data['category'])}}
    except Exception as e:
        return {'error': str(e)}

#get args: challenge_id
@app.route('/get_challenge_info')
def get_challenge_info():
    try:
        data = request.args
        if {'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        print(Challenge(data['challenge_id']).get_challenge_info())
        return {'result': Challenge(data['challenge_id']).get_challenge_info()}
    except Exception as e:
        return {'error': str(e)}

#get args: user_id
@app.route('/get_user_challenges')
def get_user_challenges():
    try:
        data = request.args
        if {'user_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        
        result = []
        for i in User(str(data['user_id'])).get_user_info()['created_challenges']:
            result.append(Challenge(i).get_challenge_info())
        return {'result': result}
    except Exception as e:
        return {'error': str(e)}


#post args: challenge_id
@app.route('/start_challenge', methods=['POST'])
def start_challenge():
    try:
        data = eval(request.data.decode())
        if {'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': {'challenge_id': Challenge(data['challenge_id']).start()}}
    except Exception as e:
        return {'error': str(e)}

#post args: challenge_id
@app.route('/pause_challenge', methods=['POST'])
def pause_challenge():
    try:
        data = eval(request.data.decode())
        print(data)
        if {'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': {'challenge_id': Challenge(data['challenge_id']).pause()}}
    except Exception as e:
        return {'error': str(e)}

#post args: challenge_id
@app.route('/stop_challenge', methods=['POST'])
def stop_challenge():
    try:
        data = eval(request.data.decode())
        print(data)
        if {'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': {'challenge_id': Challenge(data['challenge_id']).stop()}}
    except Exception as e:
        return {'error': str(e)}

#post args: challenge_id, kwargs
@app.route('/edit_challenge', methods=['POST'])
def edit_challenge():
    try:
        data = eval(request.data.decode('utf-8'))
        print(data)
        if {'challenge_id', 'kwargs'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': Challenge(data['challenge_id']).edit(data['kwargs'])}
    except Exception as e:
        return {'error': str(e)}

#post args: user_id, challenge_id
@app.route('/join_challenge', methods=['POST'])
def join_challenge():
    try:
        data = eval(request.data.decode())
        print(data)
        if {'user_id', 'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': User(str(data['user_id'])).join_challenge(data['challenge_id'])}
    except Exception as e:
        return {'error': str(e)}

# #post args: user_id, challenge_id
@app.route('/remove_challenge', methods=['POST'])
def remove_challenge():
    try:
        data = eval(request.data.decode())
        print(data)
        if {'user_id', 'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return User(str(data['user_id'])).remove_challenge(data['challenge_id'])
    except Exception as e:
        return {'error': str(e)}

#post args: user_id, group_id, group_name
@app.route('/connect_group', methods=['POST'])
def connect_group():
    try:
        data = eval(request.data.decode('utf-8'))
        if {'user_id', 'group_id', 'group_name'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': User(str(data['user_id'])).connect_group(data['group_id'], data['group_name'])}
    except Exception as e:
        return {'error': str(e)}

#post args: user_id, group_id
@app.route('/disconnect_group', methods=['POST'])
def disconnect_group():
    try:
        data = eval(request.data.decode())
        if {'user_id', 'group_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': User(str(data['user_id'])).disconnect_group(data['group_id'])}
    except Exception as e:
        return {'error': str(e)}

#post user_id api_data, challenge_id, task_value
@app.route('/check_task', methods=['POST'])
def check_task():
    try:
        data = eval(request.data.decode('utf-8'))
        if {'user_id', 'api_data', 'challenge_id', 'task_index'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': User(data['user_id']).check_task(data['api_data'], data['challenge_id'], data['task_index'])}
    except Exception as e:
        return {'error': str(e)}

#get
@app.route('/get_main_challenge')
def get_main_challenge():
    try:
        return {'result' : MongoClient().sharish.challenges.find_one({'_id': 'main'})}
    except Exception as e:
        return {'error': str(e)}

# #post args: user_id, group_id, group_name
# @app.route('/', methods=['POST'])
# def ():
#     try:
#         data = eval(request.data.decode())
#         if {'user_id', 'group_id', 'group_name'} != set(list(data.keys())):
#             raise Exception('ApiException', 'Invalid arguments are provided')
        
#     except Exception as e:
#         return {'error': str(e)}


app.run(host='0.0.0.0')