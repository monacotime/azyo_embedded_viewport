function create_div(class_name, content="") {
    var div = document.createElement('div')
    div.classList.add(class_name)
    if(content) div.innerHTML = content
    return div
}

//coindcx 
//binance
//shufty
//onfeedo
//varif

class AzyoViewPort {
    #current = 0
    #ends = null
    #views = null
    #STASH = []

    constructor(root_div, client_code, user_name, views=null) {
        this.#init_root(root_div)
        if (views) {register_views(views)}
        this.client_code = client_code
        this.user_name = user_name
    }

    #init_root(root) {
        this.root = root
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
        if(this.finished_()) this.#unset_view(this.#views[this.#current])
        this.#current = 0

        var first_view = this.#views[0]
        this.#set_view(first_view)
    }
    
    finished_() { return (this.#ends === this.#current)? true: false}

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

    on_finish(do_something) {
        this.after_finish = do_something
    }

    #set_view(view) {
        var next_btn = view.render_view(this.root)
        next_btn.addEventListener('click', ev => {this.next()})
        view.init_view()
    }

    #unset_view(view) {
        this.root.innerHTML = ""
        view.distroy_view()
    }

}


const root = document.getElementById('exampleModal')
 
AV = new AzyoViewPort(root, client_code="0000111100001111", user_name="test user 2")
AV.register_views([
    [GreetingsView, {}],
    [SelfieView, {'VideoUtils': VideoUtils}],
    [DocTypeView, {}],
    [FrontsideView, {'VideoUtils': VideoUtils}],
    [BacksideView, {'VideoUtils': VideoUtils}],
    // [GenerateResultsView, {}],
    [ThankyouView, {}]
], true)
AV.on_finish(() => {AV.init_first_view()})