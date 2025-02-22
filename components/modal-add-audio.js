
import {addAudio} from '../services/indexeDB.js';

class modalAddAudio extends HTMLElement{

    constructor(){
        super();
        this.attachShadow({ mode: 'open' });
    }

    get modal(){
        return this.shadowRoot.getElementById('modal-add-audio');
    }

    get saveBtn(){
        return this.shadowRoot.getElementById('save-audio-btn');
    }

    get audioNameInput(){
        return this.shadowRoot.getElementById('audio-name');
    }

    set audioNameInput(value){
        this.audioNameInput.value = value;
    }

    get audioFileInput(){
        return this.shadowRoot.getElementById('audio-file');
    }

    set audioFileInput(value){
        this.audioFileInput.value = value;
    }

    connectedCallback() {
        this.#render();
        this.#setEvents();
    }  

    #getTemplate(){
        return `
        <div id="modal-add-audio" class="modal">
            <div class="modal-content">
                <label>Nombre del audio:</label>
                <input type="text" id="audio-name" placeholder="Ingrese el nombre del audio" required>
                <label>Archivo de audio:</label>
                <input type="file" id="audio-file">
                <button id="save-audio-btn" class="modal-btn">Guardar</button>
            </div>
        </div>`;
    }
    
    #loadStyles(){
    
            const styles = document.createElement('style');
            styles.textContent = `
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.6);
                    justify-content: center;
                    align-items: center;
                }

                .modal-content {
                    z-index: 1000;
                    background-color: #1e1e1e;
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid #444;
                    width: 80%;
                    max-width: 400px; 
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
                    color: #fff;
                    font-family: Arial, sans-serif;
                }

                label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #ccc;
                }

                input[type="text"],
                input[type="file"] {
                    width: 90%;
                    padding: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #555;
                    border-radius: 5px;
                    background-color: #2c2c2c;
                    color: #fff;
                    outline: none;
                }

                input[type="text"]::placeholder {
                    color: #999;
                }

                .modal-btn {
                    font-size: 13px;
                    cursor: pointer;
                    background-color:rgb(38, 71, 102);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    transition: background 0.3s, transform 0.2s;
                    width: fit-content;
                    place-self: center;
                }

                .modal-btn:hover {
                    background-color:rgb(28, 53, 77);
                    transform: scale(1.05);
                }
                    
                .show {
                    display: grid;
                }`
            this.shadowRoot.appendChild(styles);
    }

    #setEvents(){

        const addAudioBtn = document.getElementById('add-audio-btn');

        this.saveBtn.addEventListener('click', () => this.newAudio());
        addAudioBtn.addEventListener('click', () => this.openModal());
        this.modal.addEventListener('click', (event) => { 
            if (event.target === this.modal) {
                this.closeModal()
            }
        });

    }

    #render(){
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.#loadStyles();
    }

    closeModal(){
        this.modal.style.display = 'none';

    }

    openModal(instance){
        this.instance = instance;
        this.modal.style.display = 'grid';
    }

    newAudio() {

        const playlistName = document.querySelector('h2').textContent;

        const audioName = this.audioNameInput.value;
        const audioFile = this.audioFileInput.files[0];
    
        console.log("Audio agregado en la lista: ", playlistName);
    
        if (!audioName || !audioFile) {
            console.log("Faltan datos");
            return;
        }
        
        addAudio(audioName, audioFile, playlistName);


        this.audioNameInput.value = '';  
        this.audioFileInput.value = ''; 
        // const reader = new FileReader();
        // reader.onload = () => {
        //     const audio = new customAudio();
        //     audio.setAttribute('name', audioName);
        //     audio.setAttribute('audio', reader.result);
        //     document.querySelector('.list').appendChild(audio);
    
        //     audioNameInput.value = '';  
        //     audioFileInput.value = '';  
        // };
    
        // reader.readAsDataURL(audioFile);
        this.closeModal();
    }
    
}  
customElements.define('modal-add-audio', modalAddAudio);