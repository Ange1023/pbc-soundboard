
import { getPlaylist, addAudioToPlaylist, dbEvents } from "../services/indexeDB.js";

class modalAddToPlaylist extends HTMLElement{
    
    #instance = null;

    constructor(){
        super();
        this.attachShadow({ mode: 'open' });
    }

    get modal(){
        return this.shadowRoot.getElementById('modal-addTo-playlist');
    }

    get nameInput(){
        return this.shadowRoot.getElementById('name');
    }

    get saveBtn(){
        return this.shadowRoot.getElementById('save-btn');
    }

    get playlistSelect(){
        return this.shadowRoot.getElementById('playlist-select');
    }

    get instance(){
        return this.#instance;
    }

    set instance(value){
        this.#instance = value;
    }

    connectedCallback() {
        this.#render();
        this.#setEvents();
    }  

    #getTemplate(){
        return `
        <div id="modal-addTo-playlist" class="modal">
            <div class="modal-content">
                <label>Selecciona una playlist</label>
                <select id="playlist-select">
                </select>
                <button id="save-btn" class="modal-btn">Guardar</button>
            </div>
        </div>`;
    }
    
    #loadStyles() {
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
                text-align: center;
            }
    
            label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                color: #ccc;
            }
    
            select {
                width: 100%;
                padding: 8px;
                margin-bottom: 15px;
                border: 1px solid #555;
                border-radius: 5px;
                background-color: #2c2c2c;
                color: #fff;
                outline: none;
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
                background-color:rgb(32, 59, 85);
                transform: scale(1.05);
            }
    
            .show {
                display: grid;
            }`;
            this.shadowRoot.appendChild(styles);
    }

    #setEvents(){

        this.modal.addEventListener('click', (event) => { 
            if (event.target === this.modal) {
                this.closeModal()
            }
        });

        this.saveBtn.addEventListener('click', async () => {
            await this.#addToPlaylist() 
            this.closeModal()
        });

        dbEvents.addEventListener('playlistAdded', async () => {
            await this.#renderSelect();
        });

        dbEvents.addEventListener('playlistUpdated', async () => {
            await this.#renderSelect();
        });

        dbEvents.addEventListener('playlistDeleted', async () => {
            await this.#renderSelect();
        });
    }

    #render(){
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.#renderSelect();
        this.#loadStyles();
    }

    async #renderSelect (){

        const playlistList = await getPlaylist();

        this.playlistSelect.innerHTML = '';
        playlistList.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.name;
            option.textContent = playlist.name;
            this.playlistSelect.appendChild(option);
        });
    }

    async #addToPlaylist(){

        const playlistName = this.playlistSelect.value;
        await addAudioToPlaylist(playlistName,this.instance.name);
        }
    
    closeModal(){
        this.modal.style.display = 'none';
    }

    openModal(instance){
        this.instance = instance;
        this.modal.style.display = 'grid';
    }
}
customElements.define('modal-addto-playlist', modalAddToPlaylist);