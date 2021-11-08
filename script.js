
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


function create_div(class_name, content="") {
    var div = document.createElement('div')
    div.classList.add(class_name)
    if(content) div.innerHTML = content
    return div
}

class Demoview1 extends AzyoView {
    render_view() {
        var azyo_container = create_div('azyo_container')
        var azyo_title = create_div('azyo_title', 'AZYO')
        var azyo_content = create_div('azyo_content', 'Lorem ifwfwq fqgre gbrhgwerh geqwghwer hrwh we gweg wegww gwe gweg g wegw')
        var azyo_start_button = create_div('azyo_start_button', `<a href="#" onclick="AV.next()">Start</a>`)
        Array.from([azyo_title, azyo_content, azyo_start_button]).forEach(el => {
            azyo_container.appendChild(el)
        })

        return azyo_container
    }
}

class Demoview2 extends AzyoView {
    render_view() {
        var azyo_container = create_div('azyo_container')
        var azyo_title = create_div('azyo_title', 'AZYO')
        var azyo_content = create_div('azyo_content', 'Something other than gibbrish!')
        var azyo_start_button = create_div('azyo_start_button', `<a href="#" onclick="AV.next()">Start</a>`)
        Array.from([azyo_title, azyo_content, azyo_start_button]).forEach(el => {
            azyo_container.appendChild(el)
        })

        return azyo_container
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
        if(this.finished()) this.#unset_view(this.#views[this.#current])
        this.#current = 0

        var first_view = this.#views[0]
        this.#set_view(first_view)
    }

    next() {
        console.log('next')
        if(this.finished()) {
            // this.on_finish()
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

    finished() { return this.#ends == this.#current}

    // on_finish(do_something) {do_something()}

    #set_view(view) {
        var render_div = view.render_view()
        console.log(render_div)
        this.root.appendChild(render_div)
        view.init_view()
    }

    #unset_view(view) {view.distroy_view()}

}


const root = document.getElementById('js_made')
AV = new AzyoViewPort(root)
AV.register_views([
    Demoview1,
    Demoview2
], true)

// AV.on_finish(() => {console.log('FINISHED')})