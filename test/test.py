# user = {'client': '0000111100001111', 'user': 'test user 1', 'some': {'a': 1}}
# req = {'client': str,'user': str, 'some': {'a': 2}}
# def validate_dict(dict_body, dict_config):
#     def check_(dict_body, dict_config):
#         check = True
#         for key, value in dict_body.items():
#             if key not in dict_config:
#                 check = False
#                 break

#             if isinstance(value, dict):
#                 if value == dict:
#                     check = check_(value, dict_config[key])
#                     if not check: break

#             else:
#                 if not isinstance(value, dict_config[key]):
#                     check = False
#                     break

#         return check
#     return check_(dict_body, dict_config)






# from pathlib import Path
# def read_image_as_bytes(image_path, fail_silently=True):
#     if not Path(image_path).exists(): 
#         if fail_silently: return None
#         else: raise ValueError(f"{image_path} does not exist")
    
#     with open(image_path, "rb") as image:
#         b = bytearray(image.read())

#     return b

# v = read_image_as_bytes('test/test user 1_selfie.png', False)
# v = read_image_as_bytes('AZYO_ENDPOINT/DB/test client/test user 2/test user 2_frontside.png', False)
# print(type(v), len(v))

# import requests
# resp = requests.post("http://103.93.17.125:5001/api/v2/docs",
#     files={"file": v, "file1": v},
#     data={'document_type': 'LICENCE', 'country': 'IND', 'state': 'MH',
#     'user': 'test user 2', 'code': '0000111100001111'})

# print(resp)
# print(resp.status_code)
# print(resp.content)
# print(resp.json())


import base64
# from AZYO_ENDPOINT.CORE.core.USER import UserDataHandler
# UDH = UserDataHandler()

path = "test/test user 3_frontside.png"


# with open('test/img.txt', 'w') as f:
    # f.write(image_read)