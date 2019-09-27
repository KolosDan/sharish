from flask import Flask, request
from user import User
from challenge import Challenge

app = Flask(__name__)

#get args: user_id
@app.route('/get_user_info')
def get_user_info():
    try:
        if {'user_id'} != set(list(request.args.keys())):
            raise Exception('ApiException', 'Invalid arguments. Awaiting user_id')
        return {'result': User(request.args['user_id']).get_user_info()}
    except Exception as e:
        return {'error': str(e)}

#post args: user_id (str), name (str), description (str), complete_message (str), requirements ([{type: ..., value: ...}, ... ]), tasks ([{validator: ..., value:...}, ...]), max_participants (str), challenge_hashtag (str), winner (None / int) group_publisher int / None
@app.route('/create_challenge', methods=['POST'])
def create_challenge():
    try:
        data = eval(request.data.decode())
        if not({'user_id', 'name', 'description', 'complete_message', 'tasks', 'max_participants', 'challenge_hashtag'} == set(list(data.keys())) or {'user_id', 'name', 'description', 'complete_message', 'requirements', 'tasks', 'max_participants', 'challenge_hashtag', 'group_publisher'} == set(list(data.keys()))):
            raise Exception('ApiException', 'Invalid arguments are provided')
        
        
        if data['group_publisher'] != '':
            return {'result': {'challenge_id': User(data['user_id']).create_challenge(data['name'], data['description'], data['complete_message'], data['tasks'], data['max_participants'], data['challenge_hashtag'], data['winner'], group_publisher= int(data['group_publisher']))}}
        return {'result': {'challenge_id': User(data['user_id']).create_challenge(data['name'], data['description'], data['complete_message'], data['tasks'], data['max_participants'], data['challenge_hashtag'], data['winner'])}}
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
        if {'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': {'challenge_id': Challenge(data['challenge_id']).stop()}}
    except Exception as e:
        return {'error': str(e)}

#post args: user_id, challenge_id
@app.route('/join_challenge', methods=['POST'])
def join_challenge():
    try:
        data = eval(request.data.decode())
        if {'user_id', 'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': User(data['user_id']).join_challenge(data['challenge_id'])}
    except Exception as e:
        return {'error': str(e)}

# #post args: user_id, challenge_id
@app.route('/remove_challenge', methods=['POST'])
def remove_challenge():
    try:
        data = eval(request.data.decode())
        if {'user_id', 'challenge_id'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return User(data['user_id']).remove_challenge(data['challenge_id'])
    except Exception as e:
        return {'error': str(e)}

#post args: user_id, group_id, group_name
@app.route('/connect_group', methods=['POST'])
def connect_group():
    try:
        data = eval(request.data.decode())
        if {'user_id', 'group_id', 'group_name'} != set(list(data.keys())):
            raise Exception('ApiException', 'Invalid arguments are provided')
        return {'result': User(data['user_id']).connect_group(data['group_id'], data['group_name'])}
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