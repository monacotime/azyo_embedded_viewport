from ..models import Client, ClientUser
from .UTILS import Request
from pathlib import Path
import base64

class UserHandle:
    requirements = {
        'client_code': str,
        'user_name': str
    }

    class UserDoesNotExist(Exception): pass
    def get_user(self, user_data) -> ClientUser:
        # we assume client exists
        client_obj = self.get_client_object(user_data['client'])
        return ClientUser.objects.filter(client=client_obj, user_name=user_data['user']).first()

    def get_user_result_status(self, user_data):
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        return user_obj.result_status


    def get_user_root(self, user_data):
        user_obj = self.get_user(user_data)
        if not user_obj: return None
        return user_obj.user_data


    class UserAlreadyExists(Exception): pass
    def register_user(self, user_data, fail_silently=False):
        self.validate_user(user_data, fail_silently)

        client = user_data['client_code']
        user = user_data['user_name']

        if self.user_exists_for_client(user, client):
            raise self.UserAlreadyExists(f"user {user} already exists for the client")
        else:
            #Initialize User
            self.__init_user(user, client)
            raise self.UserAlreadyExists(f"user was created")

    class UserCreationError(Exception): pass
    def __init_user(self, user, client):
        # make sure client exists first while editing code here
        client_obj = self.get_client_object(client)
        user_root = self.__make_user_root(user, client_obj)
        try: self.__save_user_raw(user, client_obj, user_root)
        except Exception as err: raise self.UserCreationError('Error creating the user')

    
    def __save_user_raw(self, user_name, client_obj, user_root):
        # Not to be used outside validations not added
        user = ClientUser()
        user.user_name = user_name
        user.client = client_obj
        user.user_data = user_root
        ClientUser.save(user)

    def __make_user_root(self, user, client_obj):
        client_root = Path(client_obj.client_data)
        
        user_root: Path = client_root / user
        user_root.mkdir(exist_ok=True)

        return user_root

        
    def user_exists_for_client(self, user, client):
        client_object = self.get_client_object(client)
        if not client_object: return False
        
        return ClientUser.objects.filter(user_name=user, client=client_object).exists()

    def validate_user(self, user_data, fail_silently=False):
        if not self.validate_user_data(user_data) and not fail_silently:
            raise self.InvalidUserData(f'required userdata format includes {self.requirements}')

        client = user_data['client_code']
        if not self.client_exists(client) and not fail_silently:
            raise self.ClientDoesNotExist(f'client with id {client} does not exist')

    class InvalidUserData(Exception): pass
    def validate_user_data(self, user_data):
        return Request.validate_dict(user_data, self.requirements)

    class ClientDoesNotExist(Exception): pass
    def client_exists(self, client):
        return Client.objects.filter(client=client).exists()

    def get_client_object(self, client) -> Client:
        return Client.objects.filter(client=client).first()


class UserDataHandler:
    UH = UserHandle()

    event_data_order = ['INITIALIZED', 'SELFIE', 'FRONTSIDE', 'BACKSIDE', 'RESULT', 'FINISHED']

    __result_status_next = {
        'INITIALIZED': 'SELFIE',
        'SELFIE': 'FRONTSIDE', 'FRONTSIDE': 'BACKSIDE', 
        'BACKSIDE': 'RESULT', 'RESULT': 'FINISHED'
      }

    __requirement_config = {
        'SELFIE': {'image': str, 'step': str},
        'FRONTSIDE': {'image': str, 'step': str},
        'BACKSIDE': {'image': str, 'step': str},
        'RESULT': {'image': str, 'step': str}, # Not decided uet
    }

    def get_user_next_status(self, user_data):
        current_status = self.UH.get_user_result_status(user_data)
        if not current_status: return 'DOESNOTEXIST'
        return self.__result_status_next[current_status]

    class StepRequiredDataInccorect(Exception): pass
    class StepAssertionFailed(Exception): pass

    def next_steps(self, user_data, required_data) -> dict:
        next_step = self.get_user_next_status(user_data)
        user_root = self.UH.get_user_root(user_data)

        if not self.validate_step_required_data(next_step, required_data):
            raise self.StepRequiredDataInccorect('Incorrect requirements for the data')

        if next_step != required_data['step']:
            raise self.StepAssertionFailed('step meta received in the requirements does not match next steps')

        if next_step=='SELFIE':
            user_selfie_path = user_root / f"{user_data['user']}_selfie.png"
            self.save_base64str_to_file(required_data['image'], str(user_selfie_path))
        
        elif next_step=="FRONTSIDE":
            user_frontside_path = user_root / f"{user_data['user']}_frontside.png"
            self.save_base64str_to_file(required_data['image'], str(user_frontside_path))
        
        elif next_step=="BACKSIDE":
            user_backside_path = user_root / f"{user_data['user']}_backside.png"
            self.save_base64str_to_file(required_data['image'], str(user_backside_path))

        elif next_step=="RESULT": pass
            # next steps here

        return {'comment': 'everything went well!'}


    def validate_step_required_data(self, step, data):
        return Request.validate_dict(data, self.__requirement_config[step])

    def save_base64str_to_file(self, base64imagestr: str, file_name):
        strip_meta="data:image/png;base64,"
        if base64imagestr.startswith(strip_meta): base64imagestr = base64imagestr[len(strip_meta):]

        base64imagestr_encoded = str.encode(base64imagestr)
        with open(file_name, "wb") as fh:
            fh.write(base64.decodebytes(base64imagestr_encoded))