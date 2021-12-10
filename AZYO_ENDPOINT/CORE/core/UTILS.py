from os import stat
import face_recognition
from pathlib import Path
from numpy import frombuffer, ndarray
import requests
import shutil


class Request:
    @staticmethod
    def save_requested_image(url: str, parent, name, extension='png'):
        try:
            save_here: Path = Path(parent) / name

            resp = requests.get(url, stream=True)
            if resp.status_code == 200:
                with save_here.open('wb') as f:
                    resp.raw.decode_content = True
                    shutil.copyfileobj(resp.raw, f)

            if not save_here.exists():
                return False, None
            
            return True, save_here

        except Exception as err:
            raise Exception
        

    @staticmethod
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


class FaceRecognition:

    class ImageDoesNotExists(Exception): pass
    class NoFaceDetected(Exception): pass
    @staticmethod
    def get_face_encodings(image_path):
        if not Path(image_path).exists(): raise FaceRecognition.ImageDoesNotExists('check image path')
        image_loaded = face_recognition.load_image_file(image_path)
        image_encodings = face_recognition.face_encodings(image_loaded)

        if not image_encodings: raise FaceRecognition.NoFaceDetected('No face was detected in selfie')    
        image_encodings = image_encodings[0]

        return image_encodings.tobytes()

    class InvalidStringEncoding(Exception): pass
    @staticmethod
    def get_encodings_from_str(encodings):
        if not isinstance(encodings, bytes): raise FaceRecognition.InvalidStringEncoding('encodings should be of type bytes')

        return frombuffer(encodings, dtype='float64')

    class InvalidEncoding(Exception): pass
    @staticmethod
    def compare_encodings(encoding1, encoding2):
        if not isinstance(encoding1, ndarray) and not isinstance(encoding2, ndarray):
            raise FaceRecognition.InvalidEncoding('encoding provided not ndarray')
        return face_recognition.compare_faces([encoding1], encoding2)

    @staticmethod
    def compare_distance(encoding1, encoding2):
        if not isinstance(encoding1, ndarray) and not isinstance(encoding2, ndarray):
            raise FaceRecognition.InvalidEncoding('encoding provided not ndarray')

        return face_recognition.face_distance([encoding1], encoding2)


class AzyoOCRService:
    domain_name = "http://103.93.17.125:5001/api/v2/docs"

    files_config = {
        'file': bytes, # front side
        'file1': bytes, # back side
    }

    data_config = {
        "document_type": str, # LICENCE
        "country": str, # IN
        "state": str, # Maharashtra
        "user": str, # username
        "code": str, # client code
    }

    @staticmethod
    def read_image_as_bytes(image_path, fail_silently=True):
        if not Path(image_path).exists(): 
            if fail_silently: return None
            else: raise ValueError(f"{image_path} does not exist")
        
        with open(image_path, "rb") as image:
            b = bytearray(image.read())

        return b

    class OCRFAILED(Exception): pass
    @staticmethod
    def get_ocr_data(files: dict, data: dict):
        if not Request.validate_dict(files, AzyoOCRService.files_config) and not Request.validate_dict(data, AzyoOCRService.data_config):
            raise AzyoOCRService.OCRFAILED('files / data received invalid')
        

        resp = requests.post(AzyoOCRService.domain_name,files=files,data=data)
        print(resp.status_code)
        if resp.status_code != 200:
            raise AzyoOCRService.OCRFAILED(f'Failed with status code: {resp.status_code}')
        else: 
            data = resp.json()
            print(data)
            formated = {}
            for fields, values in zip(data['fields_detected'], data['field_values']):
                formated[fields['value']] = values['value']
            formated['face_url'] = data['face_url']

            return formated