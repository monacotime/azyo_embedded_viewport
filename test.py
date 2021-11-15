# generate a key for client


'''
================================================================================
CLIENT
================================================================================
client str req = supposed to be 16 digit code unique to each client
client_data str req unique = folder is created to store client user details
================================================================================


================================================================================
CLIENT USER
================================================================================
client fk = CLIENT
user_name str req unique = username client will provide along with the request
user_data str req unique = path where user images and results are stored
================================================================================
'''

user = {'client': '0000111100001111', 'user': 'test user 1', 'some': {'a': 1}}
req = {'client': str,'user': str, 'some': {'a': 2}}
def validate_dict(dict_body, dict_config):
    def check_(dict_body, dict_config):
        check = True
        for key, value in dict_body.items():
            if key not in dict_config:
                check = False
                break

            if isinstance(value, dict):
                if value == dict:
                    check = check_(value, dict_config[key])
                    if not check: break

            else:
                if not isinstance(value, dict_config[key]):
                    check = False
                    break

        return check
    return check_(dict_body, dict_config)

print(validate_dict(user, req))