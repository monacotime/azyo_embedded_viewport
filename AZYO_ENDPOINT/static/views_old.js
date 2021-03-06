class AzyoView {
    constructor(args) {this.init_args(args)}

    init_args(args) {this.args = args}

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
}

class GreetingsView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `
        <h5 class="modal-title" id="exampleModalLabel">Let's get you verified</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")
        model_body.innerHTML = `<h6>
        Demo Inc would like to confirm your identity.
        </h3>
        <br>
        <h7>
            BEFORE YOU START, PLEASE:
        </h7>
        <br>
        <ul>
            <li>Prepare a valid government-issued identity document</li>
            <li>Check if your device???s camera is uncovered and working</li>
            <li>Be prepared to take a selfie and photos of your ID</li>
        </ul>`

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer', 'azyo-moal-footer')


        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Start Session"

        var p = document.createElement('p')
        p.classList.add('azyo-cc')
        p.innerHTML = "Powered by AZYO"

        model_footer.append(next_btn, p)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }
}

class SelfieView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Take a selfie</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")

        var body_title = document.createElement('h6')
        body_title.classList.add("azyo-modal-body-title")
        body_title.innerHTML = "Make sure that your face is in the frame and clearly visible."

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

        var svg = document.createElement('svg')
        svg.classList.add("azyo-selfie-guide")
        svg.setAttribute('viewBox', "0 0 180 180")
        svg.setAttribute('width', 270)
        svg.setAttribute('height', 270)
        svg.setAttribute('fill', "none")
        svg.setAttribute('aria-hidden', true)
        svg.setAttribute('focusable', false)
        document.getElementById("test").appendChild(svg)

        var circle = document.createElement('circle')
        circle.setAttribute('opacity', 0.4)
        circle.setAttribute('cx', 90)
        circle.setAttribute('cy', 90)
        circle.setAttribute('r', 88)
        circle.setAttribute('stroke', 'black')
        circle.setAttribute('stroke-width', 4)
        svg.appendChild(circle)


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
        video_container.append(svg, video, canvas)
        model_body.append(body_title, video_container)
        console.log(model_body)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }

    init_view() {this.args['VideoUtils'].init_video(this.video)}

    distroy_view() {
        var photo = this.takepicture()
        var img = document.getElementById('selfie')
        img.setAttribute('src', photo)

        var req_body = this.args['creds']
        req_body['required'] = {"image": photo, "step": "SELFIE"}
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

class DocTypeView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `
        <h5 class="modal-title" id="exampleModalLabel">Select Document Type</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")
        model_body.innerHTML = `By default we passing <br> {'document_type': "LICENCE", 'country': 'IND', 'state': 'MH', "step": "DOCTYPE"}`

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer', 'azyo-moal-footer')

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Upload Document"

        var p = document.createElement('p')
        p.classList.add('azyo-cc')
        p.innerHTML = "Powered by AZYO"

        model_footer.append(next_btn, p)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }

    distroy_view() {
        var req_body = this.args['creds']
        req_body['required'] = {'document_type': "LICENCE", 'country': 'IND', 'state': 'MH', "step": "DOCTYPE"}
        this.send_data("/test_api/", req_body, res => console.log(res))
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

    init_view() {this.args['VideoUtils'].init_video(this.video)}

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


class BacksideView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Turn your ID card for capturing <strong>BACK</strong> side</h5>
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
        console.log(root_div)

        return next_btn
    }

    init_view() {this.args['VideoUtils'].init_video(this.video)}

    distroy_view() {
        var photo = this.takepicture()
        var img = document.getElementById('selfie')
        img.setAttribute('src', photo)
        
        var req_body = this.args['creds']
        req_body['required'] = {"image": photo, "step": "BACKSIDE"}
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


class GenerateResultsView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `
        <h5 class="modal-title" id="exampleModalLabel">Generating Results</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        this.model_body = model_body
        model_body.classList.add("modal-body")
        model_body.innerHTML = `Generating results please wait for atleast 5 sec`

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer', 'azyo-moal-footer')

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Upload Document"
        next_btn.style.display = "none"
        this.next_btn = next_btn

        var p = document.createElement('p')
        p.classList.add('azyo-cc')
        p.innerHTML = "Powered by AZYO"

        model_footer.append(next_btn, p)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }

    init_view() {
        var req_body = this.args['creds']
        req_body['required'] = {"step": "RESULTGEN"}

        setTimeout(() => {
            this.send_data("/test_api/", req_body, res => console.log(res))
        }, 5000)
        setTimeout(() => {
            this.next_btn.click()
        }, 6000)
    }
}


class ThankyouView extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg', 'azyo-modal-dialog')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content', 'azyo-modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header', 'azyo-modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Thank You</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

 
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")

        var body_title = document.createElement('h6')
        body_title.classList.add("azyo-modal-body-title")
        body_title.innerHTML = "Your verification process is complete!"

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer', 'azyo-moal-footer')
        
        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Thank You"

        var p = document.createElement('p')
        p.classList.add('azyo-cc')
        p.innerHTML = "Powered by AZYO"

        model_footer.append(next_btn, p)
        model_body.append(body_title)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)

        return next_btn
    }
}