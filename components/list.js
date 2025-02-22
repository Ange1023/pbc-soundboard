import { getAudios, dbEvents, getPlaylist, getAudiosFromPlaylist, exportPlaylist } from "../services/indexeDB.js";
import {customAudio} from './audio.js';
import {customPlaylist} from './playlist.js';

class CustomList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.audios = []; 
    }   

    get listContainer(){
        return this.shadowRoot.querySelector('.list');
    }

    get exportPlaylistBtn(){
        return document.getElementById('export-playlist-btn');
    }

    async connectedCallback() {
        this.#render();
        this.#setEvents();
        await this.loadAudios();
    }

    async loadAudios(playlistName = 'All') {
        if (playlistName === 'All') {
            this.audios = await getAudios();
            this.#renderAudios();
            return;
        } 
        this.audios = await getAudiosFromPlaylist(playlistName);
        this.#renderAudios();
    }

    async #loadPlaylistList() {
        this.playlist = await getPlaylist();
        this.#renderPlaylist();
    }

    #getTemplate() {
        return `
            <div class="list"></div>
        `;
    }

    #loadStyles() {

        const styles = document.createElement('style');
        styles.textContent = `
            .list {
                // border: 1px solid #00ff00;
                background-color: whites;
                width: 390px;
                height: 500px;
                padding: 10px;
                overflow-y: auto;
            }
            ::-webkit-scrollbar {
                width: 0px;
                height: 0px;
                background: transparent;
            }
        `;
        this.shadowRoot.appendChild(styles);
    }

    #setEvents(){

        const allPlaylistBtn = document.getElementById('all-playlist-btn');

        allPlaylistBtn.addEventListener('click', async () => {
            await this.#loadPlaylistList();
        });

        this.exportPlaylistBtn.addEventListener('click', async () => {
            const playlistName = document.querySelector('h2').textContent;
            await exportPlaylist(playlistName);
        });

        dbEvents.addEventListener('playlistDeleted', async () => {
            console.log('playlistDeleted');
            await this.#loadPlaylistList();
        });
        dbEvents.addEventListener('playlistAdded', async () => {
            console.log('playlistAdded');
            await this.#loadPlaylistList();
        });
        dbEvents.addEventListener('playlistUpdated', async () => {  
            console.log('playlistUpdated');
            await this.#loadPlaylistList();
        });
        
        dbEvents.addEventListener('audioRemovedFromPlaylist', async (event) => {
            console.log('audioRemovedFromPlaylist');
            await this.loadAudios(event.detail);
        });

        dbEvents.addEventListener('audioUpdated', async () => {
            console.log('audioUpdated');
            await this.loadAudios();
        });

        dbEvents.addEventListener('audioAddedToPlaylist', async (event) => {
            console.log('audioAddedToPlaylist');
            
            const playlistName = document.querySelector('h2').textContent;

            if(playlistName != event.detail) return console.log(`Se envio un audio de ${playlistName} a ${event.detail}`);
            await this.loadAudios(event.detail);
        });
    }

    #renderAudios() {

        this.listContainer.innerHTML = ''; 

        this.audios.forEach(audioData => {
            const audioElement = new customAudio();
            audioElement.setAttribute('name', audioData.name);
            audioElement.setAttribute('audio', URL.createObjectURL(new Blob([audioData.blob], { type: 'audio/mp3' })));
            this.listContainer.appendChild(audioElement);
        });
    }

    #renderPlaylist() {
        
        this.listContainer.innerHTML = ''; 

        this.playlist.forEach(playlistData => {
            const playlistElement = new customPlaylist();
            playlistElement.setAttribute('name', playlistData.name);

            this.listContainer.appendChild(playlistElement);
            if (playlistData.name == 'All') {
                playlistElement.setHideEdit();
            }
        });
    }

    #render() {
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.#loadStyles();
    }

    getAudiosSelected(){

        const selectedAudios = [...this.listContainer.querySelectorAll('custom-audio')]
        .filter(audio => audio.getAttribute('state') === 'selected');
    
        return selectedAudios;
    }
}

customElements.define('custom-list', CustomList);
