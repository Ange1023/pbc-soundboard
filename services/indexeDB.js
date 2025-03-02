const DB_NAME = "MusicDB";
const DB_VERSION = 1;
let db = null; 

export const dbEvents = new EventTarget();

//Iniciar la bd
async function startDB() {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = async (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains("audios")) {
                const audioStore = database.createObjectStore("audios", { keyPath: "id", autoIncrement: true });
                audioStore.createIndex("by_name", "name", { unique: false });
            }

            if (!database.objectStoreNames.contains("playlists")) {
                const playlistStore = database.createObjectStore("playlists", { keyPath: "id", autoIncrement: true });
                playlistStore.createIndex("by_name", "name", { unique: true });
            }
            await createPlaylist("All");
            
        };

        request.onsuccess = (event) => {
            db = event.target.result; 
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("Error al abrir la base de datos:", event.target.error);
            reject(event.target.error);
        };
    });
}


window.addEventListener("load", async () => {
    await startDB();
});


// Agregar nuevo audio
export async function addAudio(name, file, playlistName) {
    const database = await startDB(); 
    const audioName = capitalize(name);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
        const transaction = database.transaction("audios", "readwrite");
        const store = transaction.objectStore("audios");

        const audioData = {
            name: audioName,
            blob: reader.result
        };

        store.add(audioData);

        transaction.oncomplete = async () => {
            
            await addAudioToPlaylist(playlistName, name);
        };
        transaction.onerror = (event) => console.error("Error al agregar audio:", event.target.error);
    };
}

//Agregar audio a una playlist
export async function addAudioToPlaylist(playlistName, audioName) {
    const database = await startDB();

    const name = capitalize(audioName);
    
    const playlist = await getPlaylistByName(playlistName);
    if (!playlist) {
        alert("Playlist no encontrada.");
        return;
    }
    
    const audio = await getAudioByName(name);
    if (!audio) {
        alert("Audio no encontrado.");
        return;
    }

    if (playlist.audios.includes(audio.id)) {
        alert("El audio ya está en la playlist.");
        return;
    }

    playlist.audios.push(audio.id); 

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.put(playlist);

        request.onsuccess = () => {
            console.log("Audio agregado a la playlist.");
            dbEvents.dispatchEvent(new CustomEvent("audioAddedToPlaylist", { detail: playlistName }));
            resolve(playlist);
        };
        request.onerror = () => reject(request.error);
    });
}

//Eliminar un audio de una playlist
export async function deleteAudioToPlaylist(playlistName, audioName) {
    const database = await startDB();
    
    if(playlistName === 'All') return await deleteAudio(audioName); 

    const playlist = await getPlaylistByName(playlistName);
    if (!playlist) {
        console.error("Playlist no encontrada.");
        return;
    }
    
    const audio = await getAudioByName(audioName);
    if (!audio) {
        console.log(audioName,audio);
        
        console.error("Audio no encontrado.");
        return;
    }


    const audioIndex = playlist.audios.indexOf(audio.id);
    if (audioIndex === -1) {
        console.error("El audio no está en la playlist");
        return;
    }

    playlist.audios.splice(audioIndex, 1);


    return new Promise((resolve, reject) => {
        const transaction = database.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.put(playlist);

        request.onsuccess = () => {
            console.log("Audio eliminado de la playlist.");

            dbEvents.dispatchEvent(new CustomEvent("audioRemovedFromPlaylist", { detail: playlistName }));
            resolve(playlist);
        };
        request.onerror = () => reject(request.error);
    });
}


//Obtener lista de audios
export async function getAudios() {
    const database = await startDB(); 

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("audios", "readonly");
        const store = transaction.objectStore("audios");
        const request = store.getAll();

        request.onsuccess = () =>{ 
            console.log(request.result);
            resolve(request.result);
        }
        request.onerror = () => reject(request.error);
    });
}

//Obtener lista de playlists
export async function getPlaylist() {
    const database = await startDB(); 

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("playlists", "readonly");
        const store = transaction.objectStore("playlists");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
}

//Obtener audio por nombre
async function  getAudioByName(name) {
    
    const audioName = capitalize(name);
    const database = await startDB();

    return new Promise((resolve, reject) => {

        const transaction = database.transaction("audios", "readonly");
        const store = transaction.objectStore("audios");
        const index = store.index("by_name");
        const request = index.get(audioName);

        request.onsuccess = () => {
            resolve(request.result)
        };
        request.onerror = () => reject(request.error);
    });
    
}

//Obtener playlist por nombre
async function getPlaylistByName(name) {
    const database = await startDB();
    const playlistName = capitalize(name);

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("playlists", "readonly");
        const store = transaction.objectStore("playlists");
        const index = store.index("by_name");
        const request = index.get(playlistName);
        
        request.onsuccess = () => {
            resolve(request.result)
        };
        request.onerror = () => reject(request.error);
    });
}

//Eliminar audio
export async function deleteAudio(name) {
    const database = await startDB();
    const audio = await getAudioByName(name);

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("audios", "readwrite");
        const store = transaction.objectStore("audios");
        const request = store.delete(audio.id);

        request.onsuccess = () =>{
            dbEvents.dispatchEvent(new CustomEvent("audioDeleted", { detail: name }));
            resolve(request.result);
        } 
        request.onerror = () => reject(request.error);
    });
}

//Cambiar nombre de un audio
export async function changeAudioName(oldName,newName) {
    const database = await startDB();
    const audio = await getAudioByName(oldName);
    const name = capitalize(newName);

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("audios", "readwrite");
        const store = transaction.objectStore("audios");
        const request = store.get(audio.id);

        request.onsuccess = () => {
            const data = request.result;
            data.name = name;
            store.put(data);
            resolve(data);

            dbEvents.dispatchEvent(new CustomEvent("audioUpdated", { detail: newName }));
        };
        request.onerror = () => reject(request.error);
    });
}

//Cambiar nombre a una playlist
export async function changePlaylistName(oldName,newName) {
    const database = await startDB();
    const playlist = await getPlaylistByName(oldName);
    const playlistName = capitalize(newName);

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.get(playlist.id);

        request.onsuccess = () => {
            const data = request.result;
            data.name = playlistName;
            store.put(data);
            resolve(data);

            dbEvents.dispatchEvent(new CustomEvent("playlistUpdated", { detail: newName }));
        };
        request.onerror = () => reject(request.error);
    });
}

//Obtener audios de una playlist
export async function getAudiosFromPlaylist(playlistName) {
    const database = await startDB();
    
    const playlist = await getPlaylistByName(playlistName);
    if (!playlist) {
        return console.error("Playlist no encontrada.");
    }

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("audios", "readonly");
        const store = transaction.objectStore("audios");
        const audios = [];

        let pending = playlist.audios.length;
        if (pending === 0) {
            resolve(audios);
            return;
        }

        playlist.audios.forEach((audioId) => {
            const request = store.get(audioId);

            request.onsuccess = () => {
                if (request.result) {
                    audios.push(request.result);
                }
                pending--;
                if (pending === 0) {
                    resolve(audios);
                }
            };

            request.onerror = () => {
                console.error("Error al obtener un audio.");
                pending--;
                if (pending === 0) {
                    resolve(audios);
                }
            };
        });
    });
}

//Crear una playlist
export async function createPlaylist(name) {
    const database = await startDB(); 
    const playlistName = capitalize(name);

    const transaction = database.transaction("playlists", "readwrite");
    const store = transaction.objectStore("playlists");

    const playlist = {
        name: playlistName,
        audios: []
    };

    store.add(playlist);

    transaction.oncomplete = () =>{
        console.log("Playlist creada.");
        dbEvents.dispatchEvent(new CustomEvent("playlistAdded", { detail: name }));
    }
    transaction.onerror = (event) => console.error("Error al crear la playlist:", event.target.error);
}

//Borrar una playlist
export async function deletePlaylist(name) {
    const database = await startDB();
    const playlist = await getPlaylistByName(name);

    return new Promise((resolve, reject) => {
        const transaction = database.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.delete(playlist.id);

        request.onsuccess = () => {
            dbEvents.dispatchEvent(new CustomEvent("playlistDeleted", { detail: name }));
            resolve(request.result);
        }
        request.onerror = () => reject(request.error);
    });
}

export async function exportPlaylist(playlistName) {
    console.log("Exportando playlist...");


    const playlist = await getPlaylistByName(playlistName);
    if (!playlist) {
        console.error("Playlist no encontrada.");
        return;
    }
    const audios = await getAudiosFromPlaylist(playlistName);
    const playlistData = {
        name: playlist.name,
        audios: audios.map(audio => ({
            name: audio.name,
            id: audio.id,
        
        }))
    };

    const jsonString = JSON.stringify(playlistData);

    const base64String = btoa(unescape(encodeURIComponent(jsonString)));

    const blob = new Blob([base64String], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${playlistName}.json`;
    
    link.click();

    console.log("Playlist exportada correctamente.");
}

export async function importPlaylist(file) {
  
    if (file.type !== 'application/json') {
        console.error('El archivo no es un archivo JSON válido.');
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async () => {
        try {
        
            const decodedContent = atob(reader.result);  
            const playlistData = JSON.parse(decodedContent);
            
            if (!playlistData || !playlistData.name || !playlistData.audios || !Array.isArray(playlistData.audios)) {
                console.error("El archivo JSON no tiene la estructura correcta.");
                return;
            }

            const database = await startDB();
            const transaction = database.transaction("playlists", "readwrite");
            const store = transaction.objectStore("playlists");

            const playlist = {
                name: playlistData.name,
                audios: []
            };

            const request = store.add(playlist);

            request.onsuccess = async () => {
                console.log("Playlist importada con éxito:", playlistData.name);

                const audios = playlistData.audios;

                for (const audioName of audios) {

                    const {name} = audioName;
                
                    const audio = await getAudioByName(name);
                    if (audio) {
                        
                        const playlist = await getPlaylistByName(playlistData.name);
                        playlist.audios.push(audio.id);

                        const playlistTransaction = database.transaction("playlists", "readwrite");
                        const playlistStore = playlistTransaction.objectStore("playlists");
                        playlistStore.put(playlist);
                    } else {
                        console.warn(`Audio no encontrado: ${audioName}`);
                    }
                }

                dbEvents.dispatchEvent(new CustomEvent("playlistAdded", { detail: playlistData.name }));
            };

            request.onerror = (event) => {
                console.error("Error al importar la playlist:", event.target.error);
            };
        } catch (error) {
            console.error("Error al leer el archivo JSON:", error);
        }
    };

    reader.onerror = () => {
        console.error("Error al leer el archivo.");
    };
}

const capitalize = (string)=> {
    return string.charAt(0).toUpperCase() + string.slice(1);
}