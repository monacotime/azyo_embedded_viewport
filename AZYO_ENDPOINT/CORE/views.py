import json
from django.http import HttpRequest
from django.http.response import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .models import ClientUserResults

from .core.UTILS import Request, FaceRecognition
from .core.USER import UserDataHandler, UserHandle

from numpy import array


def test(request):
    try:
        user_data = {'client_code': '0000111100001111', 'user_name': 'test user 2'}
        UH = UserHandle()
        UDH = UserDataHandler()
        
    except Exception as err:
        raise err

    return HttpResponse('HELLO')

@method_decorator(csrf_exempt, name='dispatch')
class TestAPI(View):
    __request_config = {
        'client_code': str,
        'user_name': str,
        'required': dict
    }

    default_payload = {
        'status': 'success',
        'step_response': {},
        'error': '',
        'error_type': '',
        'error_comment': '',
        'comment': ''
    }

    class InvalidRequestData(Exception): pass
    def post(self, request: HttpRequest):

        try:
            # successfuly parse the request
            request_data = self.post_request_parser(request)
            request_status = Request.validate_dict(request_data, self.__request_config)
            if not request_status: raise self.InvalidRequestData('request data invalid')

            # getting default payload
            default_payload = self.default_payload

            # check if client exists
            '''we not doing this right now cause client check framework not present'''

            # if client exists handle the user for the client
            # try registering the user and handle user registration exceptions
            UH = UserHandle()
            user_data = { key: request_data[key] for key in UH.requirements.keys() }
            UH.register_user(user_data) # this logic is little strange for now but lets not waste time right now

        except UH.UserAlreadyExists as err:
            try:
                UDH = UserDataHandler()
                step_response = UDH.next_steps(user_data, request_data['required'])

                default_payload['step_response'] = step_response
                default_payload['comment'] = "Everything went well"

            except UDH.UserAlreadyExistsForClient as err:
                default_payload['status'] = 'failed'
                default_payload['error'] = 'UserAlreadyExistsForClient'
                default_payload['error_type'] = 'serious'
                default_payload['error_comment'] = f'client matches with user {err.user_name}'

            except UDH.FR.NoFaceDetected as err:
                default_payload['status'] = 'failed'
                default_payload['error'] = 'NoFaceDetected'
                default_payload['error_type'] = 'serious'
                default_payload['error_comment'] = 'No human face was detected inside the selfie'

            except UDH.StepRequiredDataInccorect as err:
                default_payload['status'] = 'failed'
                default_payload['error'] = 'StepRequiredDataInccorect'
                default_payload['error_type'] = 'serious'
                default_payload['error_comment'] = 'requirements data for the step is not correct'

            except UDH.UserResultUpdateError as err:
                default_payload['status'] = 'warn'
                default_payload['error'] = 'UserResultUpdateError'
                default_payload['error_type'] = '500'
                default_payload['error_comment'] = 'this is from our side, please try after sometimes'
                # this should not happen front end configuration failed
            
            except UDH.UserResultCreateError as err:
                default_payload['status'] = 'warn'
                default_payload['error'] = 'UserResultCreateError'
                default_payload['error_type'] = '500'
                default_payload['error_comment'] = 'this is from our side, please try after sometimes'
                # this should not happen front end configuration failed

            except UDH.StepAssertionFailed as err:
                default_payload['status'] = 'warn'
                default_payload['error'] = 'StepAssertionFailed'
                default_payload['error_type'] = 'Assertion'
                default_payload['error_comment'] = 'step meta data provided in requirements incorrect with the step'
                # this should not happen front end configuration failed
      
        except UH.ClientDoesNotExist as err:
            default_payload['status'] = 'failed'
            default_payload['error'] = 'ClientDoesNotExist'
            default_payload['error_type'] = 'serious'
            default_payload['error_comment'] = 'client invalid'

        except UH.InvalidUserData as err:
            default_payload['status'] = 'failed'
            default_payload['error'] = 'InvalidUserData'
            default_payload['error_type'] = 'serious'
            default_payload['error_comment'] = 'user required data invalid'

        except UH.UserCreationError as err:
            default_payload['status'] = 'failed'
            default_payload['error'] = 'UserCreationError'
            default_payload['error_type'] = '500'
            default_payload['error_comment'] = 'this is from our side, please try after sometimes'

        except self.InvalidRequestData as err:
            default_payload['status'] = 'failed'
            default_payload['error'] = 'InvalidRequestData'
            default_payload['error_type'] = 'serious'
            default_payload['error_comment'] = 'request data invalid'

        except Exception as err:
            default_payload['status'] = 'failed'
            default_payload['error'] = 'Server500'
            default_payload['error_type'] = '500'
            default_payload['error_comment'] = 'sorry for the inconvinience!'
            raise err

        return JsonResponse(default_payload)


    def post_request_parser(self, request: HttpRequest):
        return json.loads(request.body)