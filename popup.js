document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ url: '*://fpt.workplace.com/*' }, function (tabs) {
        // Found F@W tabs
        const button = document.getElementById('toggleButton');
        const noTab = document.getElementById('no-tab');
        if (tabs.length == 0) {
            noTab.style.display = 'block';
            button.style.display = "none";
            return;
        } else {
            noTab.style.display = 'none';
            button.style.display = "block";
        }
        console.log(`Found ${tabs.length} F@W tabs`);

        // Display UI properly
        let playingTab = tabs.find(tab => tab.audible);
        let isPlaying = playingTab !== undefined;
        showControlButton(playingTab);

        // Control button click listener
        button.addEventListener('click', function () {
            showControlButton(icon.classList.contains('bi-play-fill'));

            if (playingTab && isPlaying) {
                console.log('Pause tab', playingTab.url);
                chrome.tabs.sendMessage(playingTab.id, { message: 'Pause' });
                isPlaying = false;
            } else if (playingTab) {
                console.log('Play tab', playingTab.url);
                chrome.tabs.sendMessage(playingTab.id, { message: 'Play' });
                isPlaying = true;
            } else {
                // Play all tabs
                const tabPromises = tabs.map(tab => {
                    return new Promise((resolve) => {
                        chrome.tabs.sendMessage(tab.id, { message: 'Play' }, function (response) {
                            console.log('Response', response);
                            if (response && response.success) {
                                console.log('Play new tab', tab.url);
                                playingTab = tab;
                                isPlaying = true;
                            }
                            resolve();
                        });
                    });
                });
                
                Promise.all(tabPromises).then(() => {
                    console.log(`Promise all, url: ${playingTab}, isPlaying: ${isPlaying}`);
                    if (!isPlaying) {
                        const noVideo = document.getElementById('no-video');
                        noVideo.style.display = 'block';
                        showControlButton(false);
                    }
                });
            }
        });
    });
});

function showControlButton(isPlaying) {
    const icon = document.getElementById('icon');
    const label = document.getElementById('label');
    if (isPlaying) {
        // Show Pause button
        icon.classList.remove('bi-play-fill');
        icon.classList.add('bi-pause-fill');
        label.textContent = 'Pause';
    } else {
        // Show Play button
        icon.classList.remove('bi-pause-fill');
        icon.classList.add('bi-play-fill');
        label.textContent = 'Play';
    }
}
