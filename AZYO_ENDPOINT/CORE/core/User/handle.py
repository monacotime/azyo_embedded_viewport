from .controls import UserCoreControl
from pathlib import Path
from CORE.models import ClientUser, Client

class UserCoreHandle(UserCoreControl):

    def generate_user_data(self, user_name, client_obj: Client) -> Path:
        client_root = Path(client_obj.client_data)
        
        user_root: Path = client_root / user_name
        user_root.mkdir(exist_ok=True)

        return user_root

    