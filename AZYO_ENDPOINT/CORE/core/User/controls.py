from CORE.models import ClientUser, Client

class UserCoreControl:
    CLIENTFAILED = -1
    USERFAILED = -1
    USERFAILSILENTLY = False

    '''
    ---------------------------------   CLIENTUSER  ---------------------------------
    
    *client          : Client
    *user_name       : str
    *user_data       : str | path to user data
    result_status   : choice[str] | indicates stage at which user is in
    document        : Document

    get :-
    M1  :   (user_name, client_code)
            =>  uses client handle

    ---------------------------------   ++++++++++  ---------------------------------
    '''





    '''
    ---------------------------------     GETTER    ---------------------------------
    '''
    def get_user(self, client_code, user_name) -> ClientUser:
        client_obj = self.get_client_object(client_code)
        if not client_obj: return self.CLIENTFAILED

        user = ClientUser.objects.filter(client=client_obj, user_name=user_name).first()
        if not user:
            if self.USERFAILSILENTLY: return self.USERFAILED
            else: raise self.UserDoesNotExist(f"user: {user_name} for client code: {client_code} does not exist")


        return user

    
    def user_exists(self, client_code, user_name):
        return False if self.get_user(client_code, user_name) == self.USERFAILED else True


    '''
    ---------------------------------     ++++++    ---------------------------------
    '''




    '''
    ---------------------------------     CREATE    ---------------------------------
    '''
    def create_user(self, user_name, client_obj, user_root) -> ClientUser:
        try:
            user = ClientUser()
            user.user_name = user_name
            user.client = client_obj
            user.user_data = user_root
            ClientUser.save(user)
            return user

        except Exception as err:
            if self.USERFAILSILENTLY: return self.USERFAILED
            else: raise self.UserCreationFailed(f'user creation failed | {err}')


    '''
    ---------------------------------     ++++++    ---------------------------------
    '''



    '''
    ---------------------------------     ERRORS    ---------------------------------
    '''
    class UserDoesNotExist(Exception): pass
    class UserCreationFailed(Exception): pass
    '''
    ---------------------------------     ++++++    ---------------------------------
    '''







    '''
    ================================= CLIENT HANDLER =================================

    comment:    Client Handler Functionalities here.
                For now no client handle implemented thats why functionalities
                are here later to move to client handle and made parent of this.
    '''

    class ClientDoesNotExist(Exception): pass
    def client_exists(self, client):
        return Client.objects.filter(client=client).exists()

    def get_client_object(self, client) -> Client:
        return Client.objects.filter(client=client).first()

    '''
    ================================= +++++++++++++++ =================================
    '''