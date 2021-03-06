from os import stat
from django.core import exceptions
from ..models import Client, ClientUser, ClientUserResults, Country, State, DocumentType, Document
from django.db.models import Q
from .UTILS import AzyoOCRService, Request, FaceRecognition
from pathlib import Path
import base64
from numpy import array, mat
import requests
import random

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
    class UserUpdateError(Exception): pass
    def __init_user(self, user, client):
        # make sure client exists first while editing code here
        client_obj = self.get_client_object(client)
        user_root = self.__make_user_root(user, client_obj)
        try: self.__save_user_raw(user, client_obj, user_root)
        except Exception as err: 
            raise self.UserCreationError('Error creating the user')

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


class DocumentHandler():
    def get_country(self, code) -> Country:
        country_obj = Country.objects.filter(code=code).first()
        if not country_obj: return None

        return country_obj

    def get_state(self, code) -> State:
        state_obj = State.objects.filter(code=code).first()
        if not state_obj: return None

        return state_obj

    def get_document_type(self, code) -> DocumentType:
        doctype_obj = DocumentType.objects.filter(code=code).first()
        if not doctype_obj: return None

        return doctype_obj

    class DocumnetCreationError(Exception): pass
    class DocumnetUpdateError(Exception): pass
    def create_document(self, state_obj, doctype_obj):
        doc_obj = Document()
        doc_obj.state = state_obj
        doc_obj.documnet_type = doctype_obj
        Document.save(doc_obj)
        return doc_obj

    def document_exists(): pass


class UserDataHandler(UserHandle):
    FR = FaceRecognition()
    OCR = AzyoOCRService()
    DH = DocumentHandler()

    event_data_order = ['INITIALIZED', 'SELFIE', 'DOCTYPE', 'FRONTSIDE', 'BACKSIDE', 'RESULTGEN', 'FINISHED']

    __result_status_next: dict

    __requirement_config = {
        'SELFIE': {'image': str, 'step': str},
        'DOCTYPE': {'document_type': str, 'country': str, 'state': str, 'step': str},
        'FRONTSIDE': {'image': str, 'step': str},
        'BACKSIDE': {'image': str, 'step': str},
        'RESULTGEN': {'step': str},
        'RESULT': {'step': str}, # Not decided yet # canceled lol!
        'BACK': {'step': str, 'backto': str}
    }

    def __init__(self) -> None:
        self.__result_status_next = self.__init_result_status_next()

    def check_if_finished(self, user_data):
        user_obj = self.get_user(user_data)
        return True if user_obj.result_status == self.event_data_order[-1] else False
    
    class StepRequiredDataInccorect(Exception): pass
    class StepAssertionFailed(Exception): pass
    def next_steps(self, user_data, required_data) -> dict:
        
        if required_data['step'] == 'CHECK':
            if self.check_if_finished(user_data):
                if required_data:
                    result_obj = self.get_user_results(user_data)
                    kyc_number = result_obj.kyc_number
                    if 'operation' in required_data:
                        if 'GETRESULTS' == required_data['operation']:
                            match_percentage = result_obj.selfie_document_profile_pic_match_percentage
                            
                            selfie_path = self.get_user_selfie_image_path(user_data)
                            selfie_img_base64 = self.get_base64imgstr_from_file(selfie_path)

                            return {
                                'status': 'complete', 'kyc_number': kyc_number,
                                'results': {'match precentahe': match_percentage, 'selfie_image': selfie_img_base64},
                            }

                return {'status': 'complete', 'kyc_number': kyc_number}
            else: 
                current_step = self.get_user_next_status(user_data)
                return {'status': 'incomplete', 'step': current_step}

        next_step = self.get_user_next_status(user_data)
        user_root = Path(self.get_user_root(user_data))

        if required_data['step'] == 'BACK':
            # update step for the user
            user_obj = self.get_user(user_data)
            user_obj.result_status = required_data['backto']
            user_obj.save()
            return {'comment': 'everything went well!'}

        if next_step != required_data['step']:
            raise self.StepAssertionFailed('step meta received in the requirements does not match next steps')

        if not self.validate_step_required_data(next_step, required_data):
            raise self.StepRequiredDataInccorect('Incorrect requirements for the data')

        next_steps_where_performed = True

        return_data = {'comment': 'everything went well!'}
        if next_step=='SELFIE':
            self.selfie_step(user_root, user_data, required_data)

        elif next_step=='DOCTYPE':
            self.doctype_step(user_data, required_data)

        elif next_step=="FRONTSIDE":
            user_frontside_path = user_root / f"{user_data['user_name']}_frontside.png"
            self.save_base64str_to_file(required_data['image'], str(user_frontside_path))
        
        elif next_step=="BACKSIDE":
            user_backside_path = user_root / f"{user_data['user_name']}_backside.png"
            self.save_base64str_to_file(required_data['image'], str(user_backside_path))

        elif next_step=='RESULTGEN':
            return_data = self.ocr_step(user_root, user_data, required_data)
            kyc_number = str(random.randint(1000000000000000, 9999999999999999))
            return_data['kyc'] = kyc_number
            
            if return_data['match_status'] == 'true':
                next_step = 'FINISHED' # Doing it manually
            
                result_obj = self.get_user_results(user_data)
                result_obj.kyc_number = kyc_number
                result_obj.save()
                client_obj = self.get_client_object(user_data['client_code'])
                client_obj.completed_users += 1
                client_obj.save()

        else:
            print('# Reached Next ELSE')
            next_steps_where_performed = False

        # update user status
        print('# updating result status >>', next_steps_where_performed)
        if next_steps_where_performed:
            print('# updating result status')
            self.update_user_result_status(next_step, user_data)

        return return_data

    class UserAlreadyExistsForClient(Exception): 
        def __init__(self, user_name): self.user_name = user_name
    def check_if_user_exists_for_client(self, user_data, user_selfie_encoding):
        user_selfie_encoding = self.FR.get_encodings_from_str(user_selfie_encoding)

        for user_results in self.get_all_selfie_result_for_user_client_generator(user_data):    
            test_encoding = self.FR.get_encodings_from_str(user_results.selfie_encodings)
            results = self.FR.compare_encodings(user_selfie_encoding, test_encoding)
            
            if results[0]:
                user_name = user_results.user.user_name
                raise self.UserAlreadyExistsForClient(user_name)

    ''' -----------------------------------  DOCTYPE step ----------------------------------- '''
    
    class DocumentManagementError(Exception): pass
    def doctype_step(self, user_data, required_data):
        country_obj = self.DH.get_country(required_data['country'])
        state_obj = self.DH.get_state(required_data['state'])
        document_obj = self.DH.get_document_type(required_data['document_type'])

        if country_obj and state_obj: 
            if country_obj != state_obj.country:
                raise self.DocumentManagementError('state and country do not match')
        else: raise self.DocumentManagementError('country or state does not exist')
        
        doc_obj = self.if_document_exists_for_user(user_data)
        if not doc_obj:
            try:
                doc_obj = self.DH.create_document(state_obj, document_obj)
            except Exception as err:
                raise self.DH.DocumnetCreationError('document creation error')
        else:
            try:
                doc_obj.state = state_obj
                doc_obj.documnet_type = document_obj
                doc_obj.save()
            except Exception as err:
                raise self.DH.DocumnetUpdateError('document update error')


        try:
            user_obj = self.get_user(user_data)
            user_obj.document = doc_obj
            user_obj.save()
        except Exception as err: raise self.UserUpdateError('user update error actualy!!')

    def if_document_exists_for_user(self, user_data) -> Document:
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        return user_obj.document if user_obj.document else None

    ''' -----------------------------------  DOCTYPE step ----------------------------------- '''


    ''' -----------------------------------   OCR step ----------------------------------- '''

    class AZYOOCRFailed(Exception): pass
    class AZYOOCRFaceNotFound(Exception): pass
    def ocr_step(self, user_root, user_data, required_data):
        # # get ocr files
        # a = self.get_user_doc_frontside_image_path(user_data)
        # b = self.get_user_doc_backside_image_path(user_data)
        # print(Path(a).exists(), Path(b).exists())
        # frontside = self.OCR.read_image_as_bytes(self.get_user_doc_frontside_image_path(user_data))
        # backside = self.OCR.read_image_as_bytes(self.get_user_doc_backside_image_path(user_data))
        # files = {'file1': frontside, 'file2': backside}
        # print(type(files['file1']), len(files['file1']), type(files['file2']), len(files['file2']))

        # # get ocr data
        # user_name = user_data['user_name']
        # client_code = user_data['client_code']
        # user_obj = self.get_user(user_data)
        # data_config = {
        #     "document_type": user_obj.document.documnet_type.code, # LICENCE
        #     "country": user_obj.document.state.country.code, # IND
        #     "state": user_obj.document.state.code, # MH
        #     "user": user_name, # username
        #     "code": client_code, # client code
        # }
        # print(data_config)

        # # do ocr
        # # data = self.OCR.get_ocr_data(files, data_config)
        # resp = requests.post("http://103.93.17.125:5001/api/v2/docs",files=files,data=data_config)
        # print(resp.status_code)
        # if resp.status_code != 200:
        #     raise AzyoOCRService.OCRFAILED(f'Failed with status code: {resp.status_code}')
        # else: 
        #     data = resp.json()
        #     print(data)
        #     formated = {}
        #     for fields, values in zip(data['fields_detected'], data['field_values']):
        #         formated[fields['value']] = values['value']
        #     formated['face_url'] = data['face_url']

        # user_data = {'client_code': '0000111100001111', 'user_name': 'test user 2'}
        '''This was not meant to be like this'''
        front_path = self.get_user_doc_frontside_image_path(user_data)
        # print(front_path, type(front_path), Path(front_path).exists())
        back_path = self.get_user_doc_backside_image_path(user_data)
        # print(back_path, type(back_path), Path(back_path).exists())
        fv = self.OCR.read_image_as_bytes(front_path)
        bv = self.OCR.read_image_as_bytes(back_path)
        # print(len(fv), type(fv))
        # print(len(bv), type(bv))
        doc_obj = self.if_document_exists_for_user(user_data)
        # print(f'''
        # {doc_obj.documnet_type.code}, {type(doc_obj.documnet_type.code)}
        # {doc_obj.state.country.code}, {type(doc_obj.state.country.code)}
        # {doc_obj.state.code}, {type(doc_obj.state.code)}
        # ''')
        resp = requests.post("http://103.93.17.125:5001/api/v2/docs",
            files={"file": fv, "file1": bv},
            data={'document_type': doc_obj.documnet_type.code, 'country': doc_obj.state.country.code, 'state': doc_obj.state.code,
            'user': 'test user 2', 'code': '0000111100001111'})
        '''but this is what it is'''
        
        if resp.status_code != 200:
            raise Exception('not again')
        else:
            data = resp.json()
            # print(data)

        # data = formated
        if not 'face_url' in data:
            raise Exception('where is face?')
        # save image url provided by azyo service
        face_url = data['face_url']
        status, saved_here = Request.save_requested_image(face_url, user_root, f"{user_data['user_name']}_docprofilepic.png")
        if not status:
            raise self.AZYOOCRFaceNotFound('where is the face?')

        # get docprofilepic encoding
        docprofilepic_encodings =  self.FR.get_face_encodings(saved_here)
        docprofilepic_encodings = self.FR.get_encodings_from_str(docprofilepic_encodings)

        user_results = self.get_user_results(user_data)
        user_encodings = self.FR.get_encodings_from_str(user_results.selfie_encodings)

        # compare and get Eucledian distance and status of face comparing
        status = self.FR.compare_encodings(user_encodings, docprofilepic_encodings)

        if status: # match
            E_distance = self.FR.compare_distance(user_encodings, docprofilepic_encodings)[0]
            confidence = (1 - E_distance) * 100
            if confidence >= 60:
                status = [True]
            else:
                status = [False]
            ocr_result_status = status[0] # can be True/ False

        else: # does not match
            raise self.AZYOOCRFaceNotFound('OCR result comparsion error')

        # save docprofilepic encoding, confidance, ocr result status
        try:
            user_results.document_profile_pic_encodings = docprofilepic_encodings
            user_results.selfie_document_profile_pic_match_percentage = confidence
            user_results.ocr_result_status = ocr_result_status
            user_results.save()

        except Exception as err:
            raise self.UserResultUpdateError('user ocr result saving failed')

        results = {
            'selfie_img': self.get_base64imgstr_from_file(self.get_user_selfie_image_path(user_data)),
            'ocr_img': self.get_base64imgstr_from_file(self.get_user_docprofilepic_path(user_data)),
            'match_status': 'true' if ocr_result_status else 'false',
            'match_percentage': confidence
        }
        print("match Percet>>", results["match_percentage"])
        print(results["match_status"])

        # generate and save kyc number

        return results

    # update results with match distance from ocr
    def get_user_docprofilepic_path(self, user_data):
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        docprofilepic_path = Path(user_obj.user_data) / f"{user_obj.user_name}_docprofilepic.png"
        return docprofilepic_path

    def get_user_doc_frontside_image_path(self, user_data, check_if_exists=False, return_as_str=True):
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        frontside_path = Path(user_obj.user_data) / f"{user_obj.user_name}_frontside.png"
        return frontside_path

    def get_user_doc_backside_image_path(self, user_data, check_if_exists=False, return_as_str=True):
        user_obj = self.get_user(user_data)
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
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        client_obj = user_obj.client
        result_id_list =  ClientUserResults.objects.filter(~Q(user=user_obj), client=client_obj).values_list('id', flat=True)
        for id in result_id_list:
            yield ClientUserResults.objects.filter(id=id).first()


    def get_all_selfie_result_encodings_for_user_client(self, user_data):
        user_obj = self.get_user(user_data)
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
        user_obj = self.get_user(user_data)
        if not user_obj: return None

        return ClientUserResults.objects.filter(user=user_obj).first()

    def get_user_next_status(self, user_data):
        current_status = self.get_user_result_status(user_data)
        if not current_status: return None
        return self.__result_status_next[current_status]
    
    # do this on the first view i.e view after initialize
    def first_step(self, user_data):
        try: self.create_result_raw(user_data)
        except Exception as err:
            raise self.UserResultCreateError('some problems creating user')

    class UserResultCreateError(Exception): pass
    def create_result_raw(self, user_data):
        user_obj =  self.get_user(user_data)
        if not user_obj: return None

        results = ClientUserResults()
        results.user = user_obj
        results.client = user_obj.client
        ClientUserResults.save(results)


    def get_user_selfie_image_path(self, user_data, check_if_exists=False, return_as_str=True):
        user_obj = self.get_user(user_data)
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

    # move this to UTILS next
    def get_base64imgstr_from_file(self, path):
        with open(path, 'rb') as f:
            image_read = base64.b64encode(f.read()).decode('utf-8')

        return "data:image/png;base64," + image_read

    def from_file_get_base64str(self, path):
        attach_meta="data:image/png;base64,"

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