from django.core import exceptions
from ..models import Client, ClientUser, ClientUserResults
from django.db.models import Q
from .UTILS import AzyoOCRService, Request, FaceRecognition
from pathlib import Path
import base64
from numpy import array


class UserHandle:
    requirements = {
        'client_code': str,
        'user_name': str
    }

    
    class UserDoesNotExist(Exception): pass
    def get_user(self, user_data) -> ClientUser:
        # we assume client exists
        client_obj = self.get_client_object(user_data['client_code'])
        return ClientUser.objects.filter(client=client_obj, user_name=user_data['user_name']).first()

    def get_user_result_status(self, user_data):
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        return user_obj.result_status

    def update_user_result_status(self, result_status, user_data):
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        user_obj.result_status = str(result_status)
        user_obj.save()

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
        ''' Using Face Check '''
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
    FR = FaceRecognition()
    OCR = AzyoOCRService()

    # event_data_order = ['INITIALIZED', 'SELFIE', 'DOCTYPE', 'FRONTSIDE', 'BACKSIDE', 'FINISHED', 'RESULTGEN', 'RESULT', ]
    event_data_order = ['INITIALIZED', 'SELFIE', 'DOCTYPE', 'FRONTSIDE', 'BACKSIDE', 'FINISHED']
    # event_data_order = ['INITIALIZED', 'SELFIE', 'FRONTSIDE', 'BACKSIDE', 'RESULT', 'FINISHED']

    __result_status_next: dict

    __requirement_config = {
        'SELFIE': {'image': str, 'step': str},
        'DOCTYPE': {'document_type': str, 'country': str, 'state': str, 'step': str},
        'FRONTSIDE': {'image': str, 'step': str},
        'BACKSIDE': {'image': str, 'step': str},
        'RESULTGEN': {'step': str},
        'RESULT': {'image': str, 'step': str}, # Not decided yet
    }

    def __init__(self) -> None:
        self.__result_status_next = self.__init_result_status_next()

    class StepRequiredDataInccorect(Exception): pass
    class StepAssertionFailed(Exception): pass

    def next_steps(self, user_data, required_data) -> dict:
        next_step = self.get_user_next_status(user_data)
        user_root = Path(self.UH.get_user_root(user_data))

        print('##', next_step, required_data['step'])
        if next_step != required_data['step']:
            raise self.StepAssertionFailed('step meta received in the requirements does not match next steps')

        if not self.validate_step_required_data(next_step, required_data):
            raise self.StepRequiredDataInccorect('Incorrect requirements for the data')

        next_steps_where_performed = True

        if next_step=='SELFIE':
            self.selfie_step(user_root, user_data, required_data)

        elif next_step=='DOCTYPE':
            user_obj = self.UH.get_user(user_data)
            try:
                user_obj.country_code = required_data['country']
                user_obj.state_code = required_data['state']
                user_obj.document_type = required_data['document_type']
                user_obj.save()
            except Exception as err: raise self.UH.UserCreationError('user update error actualy!!')

        elif next_step=="FRONTSIDE":
            user_frontside_path = user_root / f"{user_data['user_name']}_frontside.png"
            self.save_base64str_to_file(required_data['image'], str(user_frontside_path))
        
        elif next_step=="BACKSIDE":
            user_backside_path = user_root / f"{user_data['user_name']}_backside.png"
            self.save_base64str_to_file(required_data['image'], str(user_backside_path))

        elif next_step=='RESULTGEN':
            self.ocr_step(user_root, user_data, required_data)

        elif next_step=="RESULT": pass
            # next steps here

        else:
            print('# Reached Next ELSE')
            next_steps_where_performed = False

        # update user status
        print('# updating result status >>', next_steps_where_performed)
        if next_steps_where_performed:
            print('# updating result status')
            self.UH.update_user_result_status(next_step, user_data)

        return {'comment': 'everything went well!'}

    class UserAlreadyExistsForClient(Exception): 
        def __init__(self, user_name): self.user_name = user_name
    def check_if_user_exists_for_client(self, user_data, user_selfie_encoding):
        user_selfie_encoding = self.FR.get_encodings_from_str(user_selfie_encoding)

        for user_results in self.get_all_selfie_result_for_user_client_generator(user_data):    
            test_encoding = self.FR.get_encodings_from_str(user_results.selfie_encodings)
            results = self.FR.compare_encodings(user_selfie_encoding, test_encoding)
            
            print('>>', results, type(results))
            
            if results[0]:
                user_name = user_results.user.user_name
                raise self.UserAlreadyExistsForClient(user_name)

    ''' -----------------------------------   OCR step ----------------------------------- '''

    class AZYOOCRFailed(Exception): pass
    def ocr_step(self, user_root, user_data, required_data):
        # get ocr files
        frontside = self.OCR.read_image_as_bytes(self.get_user_doc_frontside_image_path(user_data))
        backside = self.OCR.read_image_as_bytes(self.get_user_doc_backside_image_path(user_data))
        files = {'file1': frontside, 'file2': backside}

        # get ocr data
        user_name = user_data['user_name']
        client_code = user_data['client_code']
        user_obj = self.UH.get_user(user_data)
        data_config = {
            "document_type": user_obj.document_type, # LICENCE
            "country": user_obj.country_code, # IN
            "state": user_obj.state_code, # Maharashtra
            "user": user_name, # username
            "code": client_code, # client code
        }

        # do ocr
        data = self.OCR.get_ocr_data(files, data_config)

        # save image url provided by azyo service
        face_url = data['face_url']
        status, saved_here = Request.save_requested_image(face_url, user_root, f"{user_data['user_name']}_docprofilepic.png")

        # get docprofilepic encoding
        docprofilepic_encodings =  self.FR.get_face_encodings(saved_here)

        user_results = self.get_user_results(user_data)

        # compare and get Eucledian distance and status of face comparing
        status = self.FR.compare_encodings(user_results.selfie_encodings, docprofilepic_encodings)

        if status: # match
            E_distance = self.FR.compare_distance(user_results.selfie_encodings, docprofilepic_encodings)[0]
            confidence = (1 - E_distance) * 100
            ocr_result_status = status[0] # can be True/ False
        else: # does not match
            raise self.AZYOOCRFailed('OCR result comparsion error')

        # save docprofilepic encoding, confidance, ocr result status
        try:
            user_results.document_profile_pic_encodings = docprofilepic_encodings
            user_results.selfie_document_profile_pic_match_percentage = confidence
            user_results.ocr_result_status = ocr_result_status
            user_results.save()

        except Exception as err:
            raise self.UserResultUpdateError('user ocr result saving failed')

        # update results with match distance from ocr

    def get_user_doc_frontside_image_path(self, user_data, check_if_exists=False, return_as_str=True):
        user_obj = self.UH.get_user(user_data)
        if not user_obj: return None

        frontside_path = Path(user_obj.user_data) / f"{user_obj.user_name}_frontside.png"
        return frontside_path

    def get_user_doc_backside_image_path(self, user_data, check_if_exists=False, return_as_str=True):
        user_obj = self.UH.get_user(user_data)
        if not user_obj: return None

        backside_path = Path(user_obj.user_data) / f"{user_obj.user_name}_backside.png"
        return backside_path

    ''' -----------------------------------   OCR step ----------------------------------- '''
            
    ''' -----------------------------------   selfie step ----------------------------------- '''

    def selfie_step(self, user_root, user_data, required_data):
        try:
            # saving image
            user_selfie_path: Path = user_root / f"{user_data['user_name']}_selfie.png"
            self.save_base64str_to_file(required_data['image'], str(user_selfie_path))

            # if user results do not exist
            if not self.get_user_results(user_data):
                self.first_step(user_data)

            # save image encodings
            encodings = self.FR.get_face_encodings(user_selfie_path)
            self.check_if_user_exists_for_client(user_data, encodings)
            self.update_user_selfie_encoding_results(encodings, user_data)
        
        except self.UserAlreadyExistsForClient as err:
            user_selfie_path.unlink()
            raise err

        except self.FR.NoFaceDetected as err:
            user_selfie_path.unlink()
            print('*', user_selfie_path.exists())
            raise err

    def get_all_selfie_result_for_user_client_generator(self, user_data):
        user_obj = self.UH.get_user(user_data)
        if not user_obj: return None

        client_obj = user_obj.client
        result_id_list =  ClientUserResults.objects.filter(~Q(user=user_obj), client=client_obj).values_list('id', flat=True)
        for id in result_id_list:
            yield ClientUserResults.objects.filter(id=id).first()


    def get_all_selfie_result_encodings_for_user_client(self, user_data):
        user_obj = self.UH.get_user(user_data)
        if not user_obj: return None

        client_obj = user_obj.client
        return ClientUserResults.objects.filter(client=client_obj).values_list('selfie_encodings', flat=True)


    class UserResultUpdateError(Exception): pass
    def update_user_selfie_encoding_results(self, encodings: bytes, user_data):
        if not isinstance(encodings, bytes): return None

        try:
            results_obj = self.get_user_results(user_data)
            results_obj.selfie_encodings = encodings
            results_obj.save()

        except Exception as err:
            raise self.UserResultUpdateError('result selfie encoding update error')


    ''' -----------------------------------   selfie step ----------------------------------- '''


    def get_user_results(self, user_data) -> ClientUserResults:
        user_obj = self.UH.get_user(user_data)
        if not user_obj: return None

        return ClientUserResults.objects.filter(user=user_obj).first()

    def get_user_next_status(self, user_data):
        current_status = self.UH.get_user_result_status(user_data)
        if not current_status: return None
        return self.__result_status_next[current_status]
    
    # do this on the first view i.e view after initialize
    def first_step(self, user_data):
        try: self.create_result_raw(user_data)
        except Exception as err:
            raise self.UserResultCreateError('some problems creating user')

    class UserResultCreateError(Exception): pass
    def create_result_raw(self, user_data):
        user_obj =  self.UH.get_user(user_data)
        if not user_obj: return None

        results = ClientUserResults()
        results.user = user_obj
        results.client = user_obj.client
        ClientUserResults.save(results)


    def get_user_selfie_image_path(self, user_data, check_if_exists=False, return_as_str=True):
        user_obj = self.UH.get_user(user_data)
        if not user_obj: return None

        selfie_path = Path(user_obj.user_data) / f"{user_obj.user_name}_selfie.png"
        return selfie_path

    def validate_step_required_data(self, step, data):
        return Request.validate_dict(data, self.__requirement_config[step])

    # move this to UTILS next 
    def save_base64str_to_file(self, base64imagestr: str, file_name):
        strip_meta="data:image/png;base64,"
        if base64imagestr.startswith(strip_meta): base64imagestr = base64imagestr[len(strip_meta):]

        base64imagestr_encoded = str.encode(base64imagestr)
        with open(file_name, "wb") as fh:
            fh.write(base64.decodebytes(base64imagestr_encoded))

    def __init_result_status_next(self):
        result_status_next = {}
        temp = None
        for v in self.event_data_order:
            if not temp:
                temp = v
                continue

            result_status_next[temp] = v
            temp = v
        return result_status_next