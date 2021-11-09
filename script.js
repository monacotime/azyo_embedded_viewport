<<<<<<< HEAD
function create_div(class_name, content="") {
    var div = document.createElement('div')
    div.classList.add(class_name)
    if(content) div.innerHTML = content
    return div
}

=======
//coindcx 
//binance
//shufty
//onfeedo
//varif
>>>>>>> 1dc8642f13bd5db5736664aac90127bc5fe23fd8
class AzyoView {
    init_view() {
        console.log('view was initialized')
    }
    
    distroy_view() {
        console.log('view was distroyed')
    }

    render_view(root_div, next) {
        console.log('view was rendered')
        var btn = document.createElement('button')
        btn.innerHTML = "Next"
        
        root_div.appendChild(btn)
        return btn
    }
}

class VideoView extends AzyoView {
    render_view(root_div, next) {
        var div = document.createElement('div')
        var video = document.createElement('video')
        this.video = video
        video.autoplay = true
        video.id = "azyo_vid_x"
        video.classList.add("azyo_videoElement")
        div.appendChild(video)

        var btn = document.createElement('button')
        btn.innerHTML = "Next"

        root_div.appendChild(div)
        root_div.appendChild(btn)
        return btn
    }

    init_view() {
        var video = this.video
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
        }
    }

    distroy_view() {
        var video = this.video
        var stream = video.srcObject;
        var tracks = stream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }

        video.srcObject = null;
    }
}


class DemoView extends AzyoView {}
class Demo1View extends AzyoView {}
class Demo2View extends AzyoView {}


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
        var next_btn = view.render_view(this.root, this.next)
        next_btn.addEventListener('click', ev=> {this.next()})
        view.init_view()
    }

    #unset_view(view) {
        this.root.innerHTML = ""
        view.distroy_view()
    }

}


const root = document.getElementById('js_made')

AV = new AzyoViewPort(root)
AV.register_views([
    VideoView,
    Demo1View,
    Demo2View
], true)
AV.on_finish(() => {console.log('FINISHED')})