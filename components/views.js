
export const render = async (options = 'b', name = 'All Playlist') =>{

    let Abuttons = document.querySelectorAll('.a-option');
    let Bbuttons = document.querySelectorAll('.b-option');
    let title = document.getElementsByTagName('h2')[0];

    title.textContent = name;

    if(options == 'a'){
        
        Bbuttons.forEach(function(button) {
            button.style.display = 'none';
        });
        
        Abuttons.forEach(function(button) {
            button.style.display = 'block';
        });
    }else if (options == 'b'){
        
        Abuttons.forEach(function(button) {
            button.style.display = 'none';
        });
        
        Bbuttons.forEach(function(button) {
            button.style.display = 'block';
        });
    }
}

const allPlaylistBtn = document.getElementById('all-playlist-btn');

allPlaylistBtn.addEventListener('click', async () =>{
    await render();
});
