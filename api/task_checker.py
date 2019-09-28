import vk_api

#utility
def activate(login, password):
    account = vk_api.VkApi(login, password)
    account.auth()

    return account.get_api()

#checkers
def check_repost():
    pass    

def check_hashtag():
    pass

def check_subscription():
    pass

def check_user_marked():
    pass

    

def check_purchase():
    pass

def check_obj_on_photo():
    pass