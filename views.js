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

        footer.appendChild(error)
        footer.appendChild(cc)
        
        content = this.append_child(content, header, body, footer)
        // Array.from([header, body, footer]).forEach(el => {
        //     content.appendChild(el)
        // })

        return [content, header, body, footer, error]
    }

    append_child(...args) {
        var parent = args[0]
        Array.from(args.splice(1)).forEach(el => {
            parent.appendChild(el)
        })
        return parent
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


    append_child(...args) {}
}


class AzyoView {
    AVR = new AzyoViewRender()

    constructor(args) {this.init_args(args)}

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
}


class SomeView extends AzyoView {
   render_view(root_div) {
        var btn = document.createElement('btn')
        btn.classList = ['btn btn-primary']
        btn.innerHTML = 'Trigger NEXT'

        btn.addEventListener('click', ev => {
            btn.dispatchEvent(this.get_next_event({'success': false, 'name': '505', 'message': 'oops!!', 'view': this}))
        })

        var [content, header, body, footer, error] = this.AVR.get_azyo_content()
        this.error = error

        header.innerHTML = "Some Example Sample View"

        body.innerHTML = "This will become the body of the thing"
        
        // footer.innerHTML = "Footer Footer Footer"
        

        content.appendChild(btn)
        root_div.appendChild(content)
   }
}