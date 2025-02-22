import { render } from "./views.js";

export class customPlaylist extends HTMLElement{

    #name;
    #audios = [];

    constructor(){
        super();
        this.attachShadow({ mode: 'open' });
    }

    get name(){
        return this.#name;
    }

    set name(value){
        this.#name = value;
    }

    get audios(){
        return this.#audios;
    }

    set audios(value){
        this.#audios = value;
    }
    get openPlaylist(){
        return this.shadowRoot.querySelector('.open-playlist');
    }

    get editButton(){
        return this.shadowRoot.querySelector('.open-edit');
    }

    connectedCallback() {
        this.#render();
        this.#setEvents();
        
    }

    #getTemplate(){
        return `
        <div class="playlist-container">
            <button class="open-playlist"></button>
            <button class="open-edit">⁝</button>
        </div>
    `;
    }

    #loadStyles(){
        const styles = document.createElement('style');
        styles.id = 'playlist-styles';
        styles.textContent = `
            .playlist-container {
                display: flex;
                align-items: center;
                width: 100%;
                margin-bottom: 5px;
                border-radius: 5px;
                background-color: rgb(136, 32, 89);
            }
            .open-playlist, .open-edit {
                background-color:rgb(136, 32, 89);
                padding: 18px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.3s, transform 0.2s;
                border:none;
                color:white;
            }

            .playlist-container:hover {
                    transform: scale(1.01);
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
            }

            .open-playlist {
                width: 90%;
                text-align: left;
                border-radius: 5px 0 0 5px;
            }

            .open-edit {
                font-size: 24px;
                padding: 12px;
                width: 10%;
                border-radius: 0 5px 5px 0;
            }

            .hide{
                display: none;
            }
            `;
        this.shadowRoot.appendChild(styles);
    }

    #setEvents(){
        const list = document.querySelector('custom-list');
        this.openPlaylist.addEventListener('click', async () => {
            await render('a', this.getAttribute('name'));
            await list.loadAudios(this.getAttribute('name'));
        });

        this.editButton.addEventListener('click', () => this.#openModalEdit());

    }

    #openModalEdit(){
        document.querySelector('modal-edit').openModal(this);
    }

    #render(){
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.shadowRoot.querySelector('.open-playlist').textContent = this.getAttribute('name');
        this.#loadStyles();
    }

    setHideEdit(){
        this.editButton.classList.add('hide');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'name':
                if (!newValue) return;
                this.name = newValue;
                break;
        }
    }
    static get observedAttributes() {
        return ['name'];
    }
}
customElements.define('custom-playlist', customPlaylist);