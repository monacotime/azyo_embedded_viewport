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
    render_view(root_div) {
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

class ModelView1 extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")
        model_body.innerHTML = `...`

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer')
        
        var temp_btn = document.createElement('button')
        temp_btn.type="button"
        temp_btn.classList.add('btn', 'btn-secondary')
        temp_btn.dataset.dismiss = "modal"
        temp_btn.ariaLabel = "Close dialog"
        temp_btn.innerHTML = "Close"
        
        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        // next_btn.dataset.dismiss = "modal"
        // next_btn.ariaLabel = "Close dialog"
        next_btn.innerHTML = "Next"

        model_footer.append(temp_btn, next_btn)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)
        console.log(root_div)

        return next_btn
    }
}
class ModelView2 extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")
        model_body.innerHTML = `Model body 2`

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer')
        
        var temp_btn = document.createElement('button')
        temp_btn.type="button"
        temp_btn.classList.add('btn', 'btn-secondary')
        temp_btn.dataset.dismiss = "modal"
        temp_btn.ariaLabel = "Close dialog"
        temp_btn.innerHTML = "Close"
        
        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        // next_btn.dataset.dismiss = "modal"
        // next_btn.ariaLabel = "Close dialog"
        next_btn.innerHTML = "Next"

        model_footer.append(temp_btn, next_btn)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)
        console.log(root_div)

        return next_btn
    }
}
class ModelView3 extends AzyoView {
    render_view(root_div) {
        var model_wrapper = document.createElement('div')
        model_wrapper.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg')
        model_wrapper.role = "document"

        var model_content = document.createElement('div')
        model_content.classList.add('modal-content')

        var model_header = document.createElement('div')
        model_header.classList.add('modal-header')
        model_header.innerHTML = `<h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`

        
        var model_body = document.createElement('div')
        model_body.classList.add("modal-body")
        model_body.innerHTML = `Model body 3`

        var model_footer = document.createElement('div')
        model_footer.classList.add('modal-footer')
        
        var temp_btn = document.createElement('button')
        temp_btn.type="button"
        temp_btn.classList.add('btn', 'btn-secondary')
        temp_btn.dataset.dismiss = "modal"
        temp_btn.ariaLabel = "Close dialog"
        temp_btn.innerHTML = "Close"
        
        var next_btn = document.createElement('button')
        next_btn.type="button"
        next_btn.classList.add('btn', 'btn-primary')
        // next_btn.dataset.dismiss = "modal"
        // next_btn.ariaLabel = "Close dialog"
        next_btn.innerHTML = "Next"

        model_footer.append(temp_btn, next_btn)
        model_content.append(model_header, model_body, model_footer)
        model_wrapper.appendChild(model_content)
        root_div.appendChild(model_wrapper)
        console.log(root_div)

        return next_btn
    }
}