# -*- coding: utf-8 -*-

import vk_api
import re

def activate(login, password):
    account = vk_api.VkApi(login, password)
    account.auth()

    return account.get_api()

#wall.get count=10
def check_repost(api_data, post_link):
    post_credentials = post_link.split('w=wall')[-1].split('_')
    for i in api_data['items']:
        if i.get('copy_history') != None:
            repost = i.get('copy_history')[0]
            if str(repost['from_id']) == post_credentials[0] and str(repost['id']) == post_credentials[1]:
                return True
    
    return False

#wall.get count=10
def check_hashtag(api_data, hashtag_value):
    for i in api_data['items']:
        if '#' + hashtag_value in i['text'].decode('utf-8'):
            return True
    
    return False

#wall.get count=10
def check_hashtag_and_photo(api_data, hashtag_value):
    for i in api_data['items']:
        if '#' + hashtag_value in i['text'].decode('utf-8'):
            if 'attachments' in i.keys():
                for attach in i['attachments']:
                    if 'photo' in attach.keys():
                        return True
    return False

#groups.getById group_id=...
def check_subscription(api_data):
    if int(api_data[0]['is_member']) == 1:
        return True
    else:
        return False

#likes.isliked(user_id, type, owner_id, item_id) https://vk.com/pionerlager?w=wall-16995702_28214
#где wall - type, -16995702 - owner_id, 28214 - item_id
def check_like(api_data):
    if int(api_data['liked']) == 1:
        return True
    else:
        return False

#wall.get count=10
def check_mention(api_data, to_mention):
    username = to_mention.split('/')[-1]
    obj = activate('+79995668808', 'Xog2ioKq69').utils.resolveScreenName(screen_name=username)

    if obj['type'] == 'user':
        to_check = 'id' + str(obj['object_id'])
    elif obj['type'] == 'group':
        to_check = 'club' + str(obj['object_id'])
    elif obj['type'] == 'page':
        to_check = 'club' + str(obj['object_id'])

    for i in api_data['items']:
        if '[%s|' % to_check in i['text']:
            return True

    return False 