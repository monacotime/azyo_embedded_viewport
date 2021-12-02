from django.db.models import Model
from django.db.models.fields import BinaryField, CharField
from django.db import models

class Client(Model):
    client = CharField(max_length=16, unique=True, null=False)
    client_data = CharField(max_length=155, unique=True, null=False)
    client_name = CharField(max_length=155, unique=True, null=False,)

user_status_choice = (
    ('INITIALIZED', 'INITIALIZED'), 
    ('SELFIE', 'SELFIE'),
    ('FRONTSIDE', 'FRONTSIDE'),
    ('BACKSIDE', 'BACKSIDE'),
    ('RESULT', 'RESULT'),
    ('FINISHED', 'FINISHED')
)

class ClientUser(Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    user_name = CharField(max_length=55, unique=False, null=False)
    user_data = CharField(max_length=155, unique=True, null=False)
    result_status = CharField(max_length=30, choices=user_status_choice, default='INITIALIZED')
    country_code = CharField(max_length=5)
    state_code = CharField(max_length=5)
    document_type = models.CharField(max_length=55)


class ClientUserResults(Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    user = models.ForeignKey(ClientUser, on_delete=models.CASCADE)
    
    selfie_encodings = models.BinaryField(max_length=3000)
    
    document_profile_pic_encodings = models.BinaryField(max_length=3000)
    selfie_document_profile_pic_match_percentage = models.FloatField(default=0.0)
    ocr_result_status = models.BooleanField(default=False)
    
    kyc_number = models.CharField(max_length=20)