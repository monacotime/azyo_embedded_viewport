class AzyoViewRender {
    style = {
        'azyo-modal-header': `
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `
    }

    get_azyo_content() {
        var content = this.create_div({'class': 'modal-content azyo-modal-content'})
        var header = this.get_azyo_header()
        var body = this.get_azyo_body()
        var footer = this.get_azyo_footer()
        var error = this.get_azyo_error()
        var cc = this.get_azyo_cc()

        footer  = this.append_child(footer, error, cc)
        
        console.log(content)
        content = this.append_child(content, header, body, footer)
        console.log(content)

        return [content, header, body, footer, error, cc]
    }

    get_azyo_header() {
        var header = this.create_div({'class': 'modal-header azyo-modal-header'})
        header.setAttribute('style', this.style['azyo-modal-header'])
        return header
    }

    get_azyo_body() {
        var body = this.create_div({'class': 'modal-body azyo-modal-body'})
        return body
    }

    get_azyo_footer() {
        var body = this.create_div({'class': 'modal-footer azyo-moal-footer'})
        return body
    }

    get_azyo_cc() {
        var cc = document.createElement('p')
        cc.setAttribute('class', 'azyo-cc')
        cc.innerHTML = "Powered by AZYO"
        return cc
    }

    get_azyo_error() {
        var div = this.create_div()
        console.log(div)
        return div
    }

    create_div(attributes=Array) {
        var div = document.createElement('div')
        
        for (var att in attributes) {
            div.setAttribute(att, attributes[att])
        }

        return div
    }

    append_child(...args) {
        var parent = args[0]
        Array.from(args.splice(1)).forEach(el => parent.appendChild(el))
        return parent
    }
}


class AzyoView {
    AVR = new AzyoViewRender()

    constructor(args) {
        this.init_args(args)
        this.detail = {'success': false, 'name': '', 'message': '', 'view': this}
    }

    get_next_event(detail) {
        return new CustomEvent("next", {
            detail: detail,
            bubbles: true,
            cancelable: true,
            composed: false,
        });
    }

    init_args(args) {this.args = args}

    init_view() {
        console.log('view was initialized')
    }
    
    distroy_view() {
        console.log('view was distroyed')
    }

    render_view(root_div) {
        console.log('view rendered')
    }

    error_occured(name, message) {
        console.log(this.error)
        if (this.error) {
            this.error.innerHTML = ` ERROR: ` + name + ' || ' + message
        }
    }

    send_data(where, data, on_success) {
        $.ajax({
            url: where, 
            data: JSON.stringify(data),
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            processData: false,
            success: on_success,
            error: err => console.error('err')
        });
    }
}

class VideoUtils {

    static init_video(video) {
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

    static distroy_video(video) {
        var stream = video.srcObject;
        var tracks = stream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }

        video.srcObject = null;
    }

    static takepicture(video) {
        console.log(video)
        var height = video.height
        var width = video.width
        
        var canvas = document.createElement('canvas')
        var context = canvas.getContext('2d')

        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            return data
        }

        return null
    }
}


class SomeView extends AzyoView {
   render_view(root_div) {
        var btn = document.createElement('btn')
        btn.classList = ['btn btn-primary']
        btn.innerHTML = 'Trigger NEXT'

        btn.addEventListener('click', ev => {
            btn.dispatchEvent(this.get_next_event({'success': false, 'name': '505', 'message': 'oops!!', 'view': this}))
        })

        var [content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        header.innerHTML = "Some Example Sample View"

        body.innerHTML = "This will become the body of the thing"
        
        content.appendChild(btn)
        root_div.appendChild(content)
   }
}


class GreetingsView extends AzyoView {
    render_view(root_div) {
        var [content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        header.innerHTML = `
        <h5 class="modal-title" id="exampleModalLabel">Let's get you verified</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        body.innerHTML = `<h6>
        Demo Inc would like to confirm your identity.
        </h3>
        <br>
        <h7>
            BEFORE YOU START, PLEASE:
        </h7>
        <br>
        <ul>
            <li>Prepare a valid government-issued identity document</li>
            <li>Check if your device’s camera is uncovered and working</li>
            <li>Be prepared to take a selfie and photos of your ID</li>
        </ul>`


        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Start Session"
        this.next_btn = next_btn

        footer.insertBefore(next_btn, cc)

        model_wrapper.appendChild(content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }

    init_view() {
        this.next_btn.addEventListener('click', ev => {
            this.detail['success'] = true
            this.next_btn.dispatchEvent(this.get_next_event(this.detail))
        })
    }
}


class SelfieView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"
        
        var [content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Take a selfie</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        var body_title = document.createElement('h6')
        body_title.classList.add("azyo-modal-body-title")
        body_title.innerHTML = "Make sure that your face is in the frame and clearly visible."

        var video_container = document.createElement('div')
        video_container.classList.add("azyo_video_container")

        var video = document.createElement('video')
        this.video = video
        video.width = 640
        video.height = 480
        video.autoplay = "true"
        video.id = "azyo_vid"
        video.classList.add("azyo_videoElement")

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Take Photo"
        this.next_btn = next_btn

        footer.insertBefore(next_btn, cc)

        // video_container.append(svg, video, canvas)
        video_container.append(video)
        body.append(body_title, video_container)
        
        model_wrapper.appendChild(content)
        root_div.appendChild(model_wrapper)
    }

    init_view() {
        this.args['VideoUtils'].init_video(this.video)

        this.next_btn.addEventListener('click', ev => {

            var photo = this.args['VideoUtils'].takepicture(this.video)

            var req_body = this.args['creds']
            req_body['required'] = {"image": photo, "step": "SELFIE"}
            console.log(req_body)
            this.send_data("/test_api/", req_body, res => {
                if (res['status'] !== 'success') {
                    this.detail['success'] = false
                    this.detail['name'] = res['error']
                    this.detail['message'] = res['error_comment']
                    this.next_btn.dispatchEvent(this.get_next_event(this.detail))
                }
                else {
                    this.detail['success'] = true
                    this.next_btn.dispatchEvent(this.get_next_event(this.detail))
                }
            })
        })
    }

    distroy_view() {
        this.args['VideoUtils'].distroy_video(this.video)
    }
}


class FrontsideView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Get your document's <strong>FRONT</strong> side ready</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")

        var body_title = document.createElement('h6')
        body_title.classList.add("azyo-modal-body-title")
        body_title.innerHTML = "Make sure your document is inside the frame"

        var video_container = document.createElement('div')
        video_container.classList.add("azyo_video_container")

        var canvas = document.createElement('canvas')
        canvas.style.display = 'none'
        this.canvas = canvas
        this.context = canvas.getContext('2d')

        var video = document.createElement('video')
        this.video = video
        video.width = 640
        video.height = 480
        video.autoplay = "true"
        video.id = "azyo_vid"
        video.classList.add("azyo_videoElement")

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer', 'azyo-moal-footer')
        

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Take Photo"

        var p = document.createElement('p')
        p.classList.add('azyo-cc')
        p.innerHTML = "Powered by AZYO"

        model_footer.append(next_btn, p)
        video_container.append(video, canvas)
        model_body.append(body_title, video_container)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }

    init_view() {
        this.args['VideoUtils'].init_video(this.video)
    }

    distroy_view() {
        var photo = this.takepicture()
        var img = document.getElementById('selfie')
        img.setAttribute('src', photo)

        var req_body = this.args['creds']
        req_body['required'] = {"image": photo, "step": "FRONTSIDE"}
        this.send_data("/test_api/", req_body, res => console.log(res))

        this.args['VideoUtils'].distroy_video(this.video)
    }

    takepicture() {
        var height = this.video.height
        var width = this.video.width
        if (width && height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.context.drawImage(this.video, 0, 0, width, height);
    
            var data = this.canvas.toDataURL('image/png');
            return data
        }

        return null
    }
}