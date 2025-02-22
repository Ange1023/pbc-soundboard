export class customAudio extends HTMLElement {
    #name;
    #pressed = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.audio = new Audio();
        this.audio.preload = 'auto';
        this.#name = "Audio";
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    get audioBtn() {
        return this.shadowRoot.querySelector('.audio-play');
    }

    get editBtn() {
        return this.shadowRoot.querySelector('.open-edit');
    }

    get audioContainer() {
        return this.shadowRoot.querySelector('.audio-container');
    }

    #setAudio(value) {
        this.audio.src = value;
    }

    connectedCallback() {
        this.#render();
        this.#setEvents();
    }

    #getTemplate() {
        return `
        <div class="audio-container">
            <button class="audio-play">Texto</button>
            <button class="open-edit">⁝</button>
        </div>
    `;
    }

    #loadStyles() {
        if (!document.getElementById('audio-styles')) {
            const styles = document.createElement('style');
            styles.id = 'audio-styles';
            styles.textContent = `
                .audio-container {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    margin-bottom: 5px;
                    border-radius: 5px;
                    transition: transform 0.1s, box-shadow 0.1s;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
                }

                .audio-play, 
                .open-edit {
                    background-color:rgb(134, 56, 121);
                    cursor: pointer;
                    transition: background 0.3s, transform 0.2s;
                    border:none;
                    color:white;
                }

                .audio-play {
                    padding: 18px;
                    width: 90%;
                    text-align: left;
                    border-radius: 5px 0 0 5px;
                    font-size: 14px;
                }
                
                .audio-container:hover {
                    transform: scale(1.01);
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
                }

                .active{
                    border: 1px solid white;
                }
                .open-edit {
                    font-size: 24px;
                    padding: 12px;
                    width: 10%;
                    border-radius: 0 5px 5px 0;
                }

                .selected {
                    transform: scale(0.95); /* Reduce ligeramente el tamaño */
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
                }
            `;
            this.shadowRoot.appendChild(styles);
        }
    }

    #setEvents() {
        this.editBtn.addEventListener('click', () => this.#openModalEdit());
        this.audioBtn.addEventListener('click', () => this.#handleAudio());
        this.audio.addEventListener('ended', () => this.#removeActive());

        let pressTimer;

        this.audioBtn.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                this.#pressed = true;

                if (this.audioContainer.classList.contains('selected')) {
                    this.removeSelected();
                } else {
                    this.setSelected();
                }
            }, 300);
        });

        this.audioBtn.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });

        this.audioBtn.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });
    }

    #openModalEdit() {
        document.querySelector('modal-edit').openModal(this);
    }

    #render() {
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.shadowRoot.querySelector('.audio-play').textContent = this.getAttribute('name');
        this.#loadStyles();
    }

    #handleAudio() {
        if (this.audioBtn.classList.contains('selected') || this.#pressed) {
            this.#pressed = false;
            return;
        }

        if (this.audio.paused) {
            this.audio.play();
            this.#setActive();
        } else {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.#removeActive();
        }
    }

    #setActive() {
        this.audioContainer.classList.add('active');
    }

    #removeActive() {
        this.audioContainer.classList.remove('active');
    }

    setSelected() {
        this.audioContainer.classList.add('selected');
        this.setAttribute('state', 'selected'); 
    }

    removeSelected() {
        this.audioContainer.classList.remove('selected');
        this.setAttribute('state', 'unselected');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'audio':
                this.#setAudio(newValue);
                break;
            case 'name':
                if (!newValue) return;
                this.name = newValue;
                break;
            case 'state':
                console.log(`state cambiado: ${newValue}`);
                break;
        }
    }

    static get observedAttributes() {
        return ['name', 'audio', 'state'];
    }
}

customElements.define('custom-audio', customAudio);
