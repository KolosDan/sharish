from pymongo import MongoClient
from bson import ObjectId

def get_challenge_list(status, query=None):
    client = MongoClient()
    db = client.sharish
    if query==None:
        if status != 'ALL':
            result = []
            for i in list(db.challenges.find({'status': status})):
                i['_id'] = str(i['_id'])
                result.append(i)
        else:
            result = []
            for i in list(db.challenges.find()):
                i['_id'] = str(i['_id'])
                result.append(i)
    else:
        pass

    client.close()

    return result

class Challenge:
    def __init__(self, _id):
        self.client = MongoClient()
        self.db = self.client.sharish

        if self.db.challenges.find_one({'_id': ObjectId(_id)}) == None:
            raise Exception('ApiException', 'Challenge not found. Verify its existence')
        
        self._id = _id

    def __del__(self):
        self.client.close()
    
    def get_challenge_info(self):
        result = self.db.challenges.find_one({'_id': ObjectId(self._id)})
        result['_id'] = str(result['_id'])
        
        return result
    
    def start(self):
        if self.db.challenges.find_one({'_id': ObjectId(self._id)})['status'] == 'STOPPED':
            raise Exception('ApiException', 'Challenge already stopped')

        self.db.challenges.update_one({'_id': ObjectId(self._id)}, {'$set': {'status': 'STARTED'}})

        return self._id
    
    def edit(self, kwargs):
        #name,description,complete_msg,tasks,requierements
        if self.db.challenges.find_one({'_id': ObjectId(self._id)})['status'] == 'STOPPED':
            raise Exception('ApiException', 'Challenge already stopped')

        for i in kwargs.keys():
            if i not in ['name', 'description', 'complete_msg', 'tasks', 'requierements', 'max_participants', '']:
                raise Exception('ApiException', 'Invalid key for edit - %s' % i)

        for k,v in kwargs.items():
            self.db.challenges.update_one({'_id': ObjectId(self._id)}, {'$set':{k:v}})

        return self._id

    def pause(self):
        if self.db.challenges.find_one({'_id': ObjectId(self._id)})['status'] == 'STOPPED':
            raise Exception('ApiException', 'Challenge already stopped')

        self.db.challenges.update_one({'_id': ObjectId(self._id)}, {'$set': {'status': 'PAUSE'}})

        return self._id

    def stop(self):
        if self.db.challenges.find_one({'_id': ObjectId(self._id)})['status'] == 'STOPPED':
            raise Exception('ApiException', 'Challenge already stopped')
        
        self.db.challenges.update_one({'_id': ObjectId(self._id)}, {'$set': {'status': 'STOPPED'}})

        return self._id