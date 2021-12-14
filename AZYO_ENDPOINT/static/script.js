//coindcx 
//binance
//shufty
//onfeedo
//varif

var jquery = document.createElement('script')
jquery.setAttribute('src', "https://code.jquery.com/jquery-3.6.0.js")
jquery.setAttribute('integrity', "sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=")
jquery.setAttribute('crossorigin', "anonymous")
document.getElementsByTagName('head')[0].appendChild(jquery)


class AzyoViewPort {
    #current = 0
    #ends = null
    #views = null

    finish_on = null

    constructor(root_div, client_code, user_name, on_finish=null) {
        this.client_code = client_code
        this.user_name = user_name
        this.on_finish(on_finish)

        this.#init_root(root_div)

        var view_args = {'creds': {'client_code': this.client_code, 'user_name': this.user_name}}
        this.finished = new FineshedView(view_args)
        this.index = {
            'INITIALIZED': 0,
            'SELFIE': 0,
            'DOCTYPE': 2,
            'FRONTSIDE': 3,
            'BACKSIDE': 4,
            'RESULTGEN': 5,
        }

        var response = this.finished.check_results()
        if (response['status'] === 'complete') {
            this.kyc_number = response['kyc_number']
            this.finished.render_view(this.root, {'kyc_number': this.kyc_number})
            this.finished.init_view()
            this.after_finish()
        }
        else {

            var current_step = response['step']
            var current_index = this.index[current_step]
            this.register_views([
                [GreetingsView, {}],
                [SelfieView, {'VideoUtils': VideoUtils}],
                [DocTypeView, {}],
                [FrontsideView, {'VideoUtils': VideoUtils}],
                [BacksideView, {'VideoUtils': VideoUtils}],
                [ResultGenView, {}],
                // [ThankyouView, {}],
            ], (current_index===0)? true: false)
            
            if (current_index!==0) {
                this.init_view(current_index)
            }

        }
    }


    #init_root(root_div) {
        this.root = root_div
        this.root.addEventListener('next', ev=> {
            if (ev.detail['success']) this.next()
            else {
                console.log('Failed', ev.detail)
                ev.detail['view'].error_occured(ev.detail['name'], ev.detail['message'])
            }
        })
        
        this.root.addEventListener('backto', ev => {
            if (ev.detail['success']) {
                this.root.innerHTML = ""
                
                var view = ev.detail["view"]
                var payload = {
                    "step": "BACK",
                    "backto": "INITIALIZED"
                }

                var req_body = view.args['creds']
                req_body['required'] = payload

                view.send_data("/test_api/", req_body, res => {})

                this.init_view(ev.detail['to'])
            }
            else {
                console.log('Failed', ev.detail)
                ev.detail['view'].error_occured(ev.detail['name'], ev.detail['message'])
            }
        })
    }

    register_views(views, init_first=false) {
        var new_views = []
        views.forEach(view => {
            var View_Obj = view[0]
            var View_args = view[1]
            View_args['creds'] = {'client_code': this.client_code, 'user_name': this.user_name}
            view = new View_Obj(View_args)
            if (!(view instanceof AzyoView)) {
                throw Error(view.constructor.name + ' is invalid')
            }
            new_views.push(view)
        });

        this.#views = new_views
        this.#ends = this.#views.length - 1
        
        if(init_first) {this.init_first_view()}
    }

    init_first_view() {
        this.init_view(0)
    }

    init_view(index) {
        if(this.finished_()) {
            this.after_finish()
        }
        this.#current = index

        var initialized_view = this.#views[index]
        this.#set_view(initialized_view)
    }
    
    finished_() { return (this.#ends === this.#current)? true: false}

    #do_this_on_finished() {
        this.#set_view(this.finished)
    }

    next() {
        if(this.finished_()) {
            this.after_finish()
        }
        else {
            this.#unset_view(this.#views[this.#current])

            var new_current = this.#current + 1
            var next_view = this.#views[new_current]
            this.#set_view(next_view)
            this.#current += 1
        }
    }

    after_finish() {
        var result = this.finished.check_results(true)['results']
        this.finish_on(result)
    }

    on_finish(do_something) {
        this.finish_on = do_something
    }

    #set_view(view) {
        view.render_view(this.root)
        view.init_view()
    }

    #unset_view(view) {
        this.root.innerHTML = ""
        view.distroy_view()
    }

}
