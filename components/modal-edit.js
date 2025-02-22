import { deleteAudioToPlaylist, deletePlaylist } from "../services/indexeDB.js";
import { customAudio } from "./audio.js";
import { customPlaylist } from "./playlist.js";

class modalEdit extends HTMLElement{

    #instance = null;

    constructor(){
        super();
        this.attachShadow({ mode: 'open' });
    }

    get modal(){
        return this.shadowRoot.getElementById('modal-edit');
    }

    get nameBtn(){
        return this.shadowRoot.getElementById('name-btn');
    }

    get deleteBtn(){
        return this.shadowRoot.getElementById('delete-btn');
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
        <div id="modal-edit" class="modal">
            <div class="modal-content">
                <button id="name-btn" class="modal-btn">Cambiar nombre</button>
                <button id="delete-btn" class="modal-btn">Eliminar</button>
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
                    width: 200px;
                    max-width: 400px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
                    color: #fff;
                    font-family: Arial, sans-serif;
                    text-align: center;
                }

                .modal-btn {
                    font-size: 13px;
                    margin: 5px;
                    cursor: pointer;
                    background-color:rgb(38, 71, 102);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    transition: background 0.3s, transform 0.2s;
                    width: 160px;
                    place-self: center;
                }

                .modal-btn:hover {
                    background-color:rgb(28, 53, 77);
                    transform: scale(1.05);
                }
                .show {
                    display: grid;
                }`;
            this.shadowRoot.appendChild(styles);
    }

    #setEvents(){

        const modalEditName = document.querySelector('modal-edit-name');

        this.nameBtn.addEventListener('click', () => {
            modalEditName.openModal(this.instance);
            this.closeModal();
        });

        this.modal.addEventListener('click', (event) => { 
            if (event.target === this.modal) {
                this.closeModal()
            }
        });

        this.deleteBtn.addEventListener('click', () => {

            if (this.instance instanceof customPlaylist){

                deletePlaylist(this.instance.name);
                this.instance.remove();
                this.instance = null;

            } else if (this.instance instanceof customAudio){
                
                const playlistName = document.querySelector('h2').textContent;
                deleteAudioToPlaylist(playlistName, this.instance.name);
                this.instance.remove()
                this.instance = null;
                
            }else{
                console.error('No se pudo eliminar');
            }

            this.closeModal();
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
}  
customElements.define('modal-edit', modalEdit);