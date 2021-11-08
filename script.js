
class AzyoView {
    init_view() {
        console.log('view was initialized')
    }
    
    distroy_view() {
        console.log('view was distroyed')
    }

    render_view() {
        console.log('view was rendered')
    }

}


class DemoView extends AzyoView {}
class FailView {}


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
        this.#ends = this.#views.length
        
        if(init_first) {this.init_first_view()}
    }

    init_first_view() {
        console.log(this.finished(), this.#current, this.#ends)
        console.log(this.#views[this.#current])
        if(this.finished()) this.#unset_view(this.#views[this.#current])
        this.#current = 0

        var first_view = this.#views[0]
        this.#set_view(first_view)

    }

    next() {
        if(!this.finished()) {
            on_finish()
        }
        else {
            this.#unset_view(this.#views[this.#current])

            var new_current = this.#current + 1
            var next_view = this.#views[new_current]
            this.#set_view(next_view)
        }
    }

    finished() { return this.#ends == this.#current}

    on_finish(do_something) {do_something()}

    #set_view(view) {
        console.log(view)
        view.render_view()
        view.init_view()
    }

    #unset_view(view) {view.distroy_view()}

}


const root = document.getElementById('root')
AV = new AzyoViewPort(root)
AV.register_views([
    DemoView
], true)

AV.on_finish(() => {console.log('FINISHED')})