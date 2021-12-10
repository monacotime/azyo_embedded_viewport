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
        var wrapper = this.get_azyo_content_wrapper()
        var header = this.get_azyo_header()
        var body = this.get_azyo_body()
        var footer = this.get_azyo_footer()
        var error = this.get_azyo_error()
        var cc = this.get_azyo_cc()

        footer  = this.append_child(footer, error, cc)
        
        content = this.append_child(content, header, body, footer)
        wrapper = this.append_child(wrapper, content)

        return [wrapper, content, header, body, footer, error, cc]
    }

    get_azyo_content_wrapper() {
        var model_wrapper = this.create_div({'class': 'modal-dialog modal-dialog-centered modal-lg azyo-modal-dialog', 'role': 'document'})
        return model_wrapper
    }

    get_azyo_header() {
        var header = this.create_div({'class': 'modal-header azyo-modal-header'})
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

    get_back_to_event(detail) {
        return new CustomEvent("backto", {
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
            this.error.innerHTML = `<div style="color:red; text-align:center;">` + message + `</div>`
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

class GreetingsView extends AzyoView {
    render_view(root_div) {
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

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

        root_div.appendChild(wrapper)
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
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
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

        video_container.append(video)
        body.append(body_title, video_container)
        
        root_div.appendChild(wrapper)
    }

    init_view() {
        this.args['VideoUtils'].init_video(this.video)

        this.next_btn.addEventListener('click', ev => {

            var photo = this.args['VideoUtils'].takepicture(this.video)

            var req_body = this.args['creds']
            req_body['required'] = {"image": photo, "step": "SELFIE"}
            console.log(req_body)
            this.send_data("/test_api/", req_body, res => {
                console.log(res)
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

class DocTypeView extends AzyoView {
    render_view(root_div) {
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        header.innerHTML = `
        <h5 class="modal-title" id="exampleModalLabel">Select Document Type</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        body.innerHTML = `
        <h6 class="azyo-modal-body-title">
                    Demo Inc would like to confirm your identity
                </h6>
                <br>
                <div>
                    <div>
                        <ul>
                            <li>Prepare a valid government-issued identity document</li>
                            <li>Check if your device’s camera is uncovered and working</li>
                            <li>Be prepared to take a selfie and photos of your ID</li>
                        </ul>
                    </div>
                    <div style="margin-left: 40px; font-size: large;">
                        <span>
                            <h7>
                                Country:     
                            </h7>
                            <div class="dropdown">
                                <button class="btn btn-primary dropdown-toggle" type="button" id="country" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Select Country
                                </button>
                                <div class="dropdown-menu" aria-labelledby="country">
                                <button class="dropdown-item cou" type="button">IND</button>
                                <button class="dropdown-item cou" type="button">USA</button>
                                <button class="dropdown-item cou" type="button">CAN</button>
                                </div>
                            </div>
        
                            
                            <script>
                            
                            </script>
                        </span>
                        <br>
                        <span>
                            <h7>
                                State:
                            </h7>
                            <div class="dropdown">
                                <button class="btn btn-primary dropdown-toggle" type="button" id="state" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Select State
                                </button>
                                <div class="dropdown-menu" aria-labelledby="state">
                                <button class="dropdown-item sta" type="button">Delhi</button>
                                <button class="dropdown-item sta" type="button">MH</button>
                                <button class="dropdown-item sta" type="button">Chennai</button>
                                </div>
                            </div>
                            
                            <script>
                            
                            </script>
                        </span>
                        <br>
                        <span>
                            <h7>
                                Document:    
                            </h7>
                            <div class="dropdown">
                                <button class="btn btn-primary dropdown-toggle" type="button" id="document_type" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Select Document
                                </button>
                                <div class="dropdown-menu" aria-labelledby="document_type">
                                <button class="dropdown-item tp" type="button">Aadhaar Card</button>
                                <button class="dropdown-item tp" type="button">PANCARD</button>
                                <button class="dropdown-item tp" type="button">Passport</button>
                                <button class="dropdown-item tp" type="button">LICENCE</button>
                                </div>
                            </div>
        
                            
                            <script>
                            
                            </script>
                        </span>
                    </div>
                </div>
                `

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Upload Document"
        this.next_btn = next_btn

        footer.insertBefore(next_btn, cc)
        
        root_div.appendChild(wrapper)
    }

    init_view() {
        let links = document.querySelectorAll('.tp')
        let doctype = document.getElementById('document_type')
        links.forEach(element => element.addEventListener("click", function () {
            let text = element.innerText
            doctype.innerText = text
        }))

        let coulinks = document.querySelectorAll('.sta')
        let state = document.getElementById('state')
        coulinks.forEach(element => element.addEventListener("click", function () {
            let text = element.innerText
            state.innerText = text
        }))

        let stalinks = document.querySelectorAll('.cou')
        let country = document.getElementById('country')
        stalinks.forEach(element => element.addEventListener("click", function () {
            let text = element.innerText
            country.innerText = text
        }))


        this.next_btn.addEventListener('click', ev => {

            var req_body = this.args['creds']
            req_body['required'] = {'document_type': doctype.innerText, 'country': country.innerText, 'state': state.innerText, "step": "DOCTYPE"}
            console.log(req_body)
            this.send_data("/test_api/", req_body, res => {
                console.log(res)
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
        // var req_body = this.args['creds']
        // req_body['required'] = {'document_type': "LICENCE", 'country': 'IND', 'state': 'MH', "step": "DOCTYPE"}
        // this.send_data("/test_api/", req_body, res => console.log(res))
    }
}


class FrontsideView extends AzyoView {
    render_view(root_div) {
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Get your document's <strong>FRONT</strong> side ready</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`


        var body_title = document.createElement('h6')
        body_title.classList.add("azyo-modal-body-title")
        body_title.innerHTML = "Make sure your document is inside the frame"

        var video_container = document.createElement('div')
        video_container.classList.add("azyo_video_container")

        var video = document.createElement('video')
        this.video = video
        video.width = 640
        video.height = 480
        video.autoplay = "true"
        video.id = "azyo_vid"
        video.classList.add("azyo_videoElement")

        
        var flipcart = document.createElement('div')
        flipcart.setAttribute('class', "flip-card")
        flipcart.setAttribute('id', "allcard")
        flipcart.setAttribute('style', "position:absolute; opacity: 0.6; display: block;")
        flipcart.innerHTML = `
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <img id = "frontpiccard" src="https://raw.githubusercontent.com/monacotime/azyo_embedded_viewport/main/cardfront.png" alt="Avatar" style="width:370px;height:250px;">
            </div>
        </div>
        `

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Take Photo"
        this.next_btn = next_btn


        footer.insertBefore(next_btn, cc)

        video_container.append(flipcart, video)
        body.append(body_title, video_container)

        root_div.appendChild(wrapper)
    }

    init_view() {
        this.args['VideoUtils'].init_video(this.video)

        document.getElementById("allcard").style.display = "none";
        function hide() {
            document.getElementById("allcard").style.display = "none";
        }

        function disp(){
            document.getElementById('allcard').style.display = "block"
        }

        function rotates(){
            setTimeout(disp, 500);
            setTimeout(hide, 2500);
        }

        this.video.addEventListener('play', ev=> {
            rotates()
        })

        this.next_btn.addEventListener('click', ev => {

            var photo = this.args['VideoUtils'].takepicture(this.video)

            var req_body = this.args['creds']
            req_body['required'] = {"image": photo, "step": "FRONTSIDE"}
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


class BacksideView extends AzyoView {
    render_view(root_div) {
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        var header = document.createElement('div')
        header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Turn your ID card for capturing <strong>BACK</strong> side</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        var body_title = document.createElement('h6')
        body_title.classList.add("azyo-modal-body-title")
        body_title.innerHTML = "Make sure your document is inside the frame"

        var video_container = document.createElement('div')
        video_container.classList.add("azyo_video_container")

        var video = document.createElement('video')
        this.video = video
        video.width = 640
        video.height = 480
        video.autoplay = "true"
        video.id = "azyo_vid"
        video.classList.add("azyo_videoElement")

        var flipcart = document.createElement('div')
        flipcart.setAttribute('class', "flip-card")
        flipcart.setAttribute('id', "allcard")
        flipcart.setAttribute('style', "position:absolute; opacity: 0.6; display: block;")
        flipcart.innerHTML = `
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <img id = "frontpiccard" src="https://raw.githubusercontent.com/monacotime/azyo_embedded_viewport/main/cardfront.png" alt="Avatar" style="width:370px;height:250px;">
            </div>
            <div class="flip-card-back">
                <img id = "backpiccard" src="https://raw.githubusercontent.com/monacotime/azyo_embedded_viewport/main/cardback.png" alt="Avatar" style="width:370px;height:250px;">
            </div>
        </div>
        `

        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Take Photo"
        this.next_btn = next_btn

        footer.insertBefore(next_btn, cc)

        video_container.append(flipcart, video)
        body.append(body_title, video_container)
        root_div.appendChild(wrapper)
    }

    init_view() {
        this.args['VideoUtils'].init_video(this.video)
        
        document.getElementById("allcard").style.display = "none";
        function animate() {
            var card = document.querySelector('.flip-card-inner');
            card.classList.toggle('is-flipped');
        }
        function hide() {
            document.getElementById("allcard").style.display = "none";
        }
        function disp(){
            document.getElementById('allcard').style.display = "block"
        }

        function rotates(){
            setTimeout(disp, 150)
            setTimeout(animate, 1000);
            setTimeout(hide, 3000);
        }

        this.video.addEventListener('play', ev=> {
            rotates()
        })

        this.next_btn.addEventListener('click', ev => {

            var photo = this.args['VideoUtils'].takepicture(this.video)

            var req_body = this.args['creds']
            req_body['required'] = {"image": photo, "step": "BACKSIDE"}
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


class ResultGenView extends AzyoView {
    render_view(root_div) {
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error
        this.footer = footer
        this.cc = cc

        var link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('href', "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css")
        wrapper.insertBefore(link, content)

        header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Processing your data</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        body.innerHTML = `
        <h6 class="azyo-modal-body-title">
                    Please wait while we analyse your images
                </h6>
                <br>
                <div style="margin-left: 60px;">
                    <div>
                        <div class = "azyo-instr">
                            <i id = "ab" class="fa fa-circle-o-notch fa-spin"></i>
                            Processing Your Selfie
                        </div>
                    </div>
    
                    <div>
                        <div class = "azyo-instr">
                            <i id = "bb" class="fa fa-circle-o-notch fa-spin"></i>
                            Extracting Document Details
                        </div>
                    </div>

                    <div>
                        <div class = "azyo-instr">
                            <i id = "cb" class="fa fa-circle-o-notch fa-spin"></i>
                            Validating Results
                        </div>
                    </div>
                </div>
                <div class= "res_holder">
                    <div class = "res_img_holder">
                    <img id = "img1" class = "azyo_res_img" src="" alt="" />

                    </div>
                    <img id = "img2" class = "azyo_res_img" src="" alt="" />

                    </div>
                    <span id = "azyo_res">here is result</span>
                </div>
        `                
        var next_btn = document.createElement('button')
        this.next_btn = next_btn
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Thank You"

        footer.insertBefore(next_btn, cc)

        root_div.appendChild(wrapper)
    }

    init_view() {


        this.next_btn.addEventListener('click', ev => {

            var req_body = this.args['creds']
            req_body['required'] = {"step": "RESULTGEN"}
            console.log(req_body)
            this.send_data("/test_api/", req_body, res => {
                console.log(res)
                if (res['status'] !== 'success') {
                    this.detail['success'] = false
                    this.detail['name'] = res['error']
                    this.detail['message'] = res['error_comment']
                    this.next_btn.dispatchEvent(this.get_next_event(this.detail))
                }
                else {
                    this.detail['success'] = false
                    this.detail['message'] = 'I want to see response'
                    console.log(res)
                    this.next_btn.dispatchEvent(this.get_next_event(this.detail))
                }
            })
        })
        // var a = document.getElementById("ab")
        // var b = document.getElementById("bb")
        // var c = document.getElementById("cb")
        
        // var req_body = this.args['creds']
        // req_body['required'] = {"step": "RESULTGEN"}
        // console.log(req_body)
        // this.send_data("/test_api/", req_body, res => {
        //     if (res['status'] !== 'success') {
        //         this.detail['success'] = true
        //         this.detail['name'] = res['error']
        //         this.detail['message'] = res['error_comment']
        //         this.detail['to'] = 1

        //         this.next_btn.innerHTML = "Retry"
        //         this.footer.insertBefore(this.next_btn, this.cc)

        //         // this.next_btn.addEventListener('click', ev => {
        //         //     this.next_btn.dispatchEvent(this.get_back_to_event(this.detail))
        //         // })
        //     }
        //     else {
        //         this.detail['success'] = true
        //         c.setAttribute("class", "fa fa-check")

        //         result = res["step_response"]

        //         console.log(result)

        //         document.getElementById("img1").setAttribute("src", result["selfie_img"])
        //         document.getElementById("img2").setAttribute("src", result["ocr_img"])
        //         document.getElementById("img2").innerHTML = result["match_percentage"]

        //         this.next_btn.innerHTML = "Thank You"
        //         this.footer.insertBefore(this.next_btn, this.cc)

        //         // this.next_btn.addEventListener('click', ev => {
        //         //     this.next_btn.dispatchEvent(this.get_next_event(this.detail))
        //         // })
        //     }
        // })

        // setTimeout(function() {
        //     a.setAttribute("class", "fa fa-check")
        // }, 2000);
        // setTimeout(function() {
        //     b.setAttribute("class", "fa fa-check")
        // }, 2500);


    }
}


class ThankyouView extends AzyoView {
    render_view(root_div) {
        var [wrapper, content, header, body, footer, error, cc] = this.AVR.get_azyo_content()
        this.error = error

        header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Thank You</h5>
        <button type="button" class="close azyo-close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        body.innerHTML = "Your verification process is complete!"
        
        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        next_btn.innerHTML = "Thank You"

        footer.insertBefore(next_btn, cc)

        root_div.appendChild(wrapper)
    }
}