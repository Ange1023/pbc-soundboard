import { importPlaylist } from "../services/indexeDB.js";
class modalImport extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    get modal() {
        return this.shadowRoot.getElementById('modal-import');
    }

    get fileInput() {
        return this.shadowRoot.getElementById('file');
    }

    get importBtn() {
        return document.getElementById('import-playlist-btn');
    }
    get saveBtn(){
        return this.shadowRoot.getElementById('save-btn');
    }
    connectedCallback() {
        this.#render();
        this.#setEvents();
    }

    #getTemplate() {
        return `
        <div id="modal-import" class="modal">
            <div class="modal-content">
                <label>Importar Archivo:</label>
                <input type="file" id="file" accept=".json">
                <button id="save-btn" class="modal-btn">Importar</button>
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
            }`;
        this.shadowRoot.appendChild(styles);
    }

    #setEvents() {
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        this.importBtn.addEventListener('click', () => this.openModal());
        this.saveBtn.addEventListener('click', async () => this.#importPlaylist());
    }

    async #importPlaylist() {

        const file = this.fileInput.files[0];

        if(!file) return alert('No se ha seleccionado un archivo');

        if (file === 'audio/mpeg') {
                await importPlaylist(file);
                this.closeModal();
        } else {
            alert('El archivo no es valido');
        }
    }
    
    #render() {
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.#loadStyles();
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    openModal() {
        this.modal.style.display = 'grid';
    }
}

customElements.define('modal-import', modalImport);