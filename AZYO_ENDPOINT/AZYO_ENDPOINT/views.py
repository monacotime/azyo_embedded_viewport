from django.http import HttpRequest
from django.http.response import JsonResponse
from django.views import View

class TestAPI(View):

    def post(self, request: HttpRequest):
        request_data = self.post_request_parser(request)
        print(request_data, type(request_data))
        return JsonResponse({'status': 'success'})

    def post_request_parser(self, request: HttpRequest):
        request_data = request.POST
        return request_data