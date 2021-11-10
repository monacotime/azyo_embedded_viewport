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

    constructor(root_div, views=null) {
        this.root = root_div
        if (views) {
            register_views(views)
        }
    }

    register_views(views, init_first=false) {
        var new_views = []
        views.forEach(view => {
            view = new view()
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
        console.log('next')
        if(this.finished_()) {
            this.after_finish()
        }
        else {
            console.log('next else')
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
        next_btn.addEventListener('click', ev=> {this.next()})
        view.init_view()
    }

    #unset_view(view) {
        this.root.innerHTML = ""
        view.distroy_view()
    }

}


const root = document.getElementById('exampleModal')

AV = new AzyoViewPort(root)
AV.register_views([
    ModelView1,
    ModelView2,
    ModelView3,
], true)
AV.on_finish(() => {AV.init_first_view()})