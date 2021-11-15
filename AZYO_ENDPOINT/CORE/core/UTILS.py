class Request:

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