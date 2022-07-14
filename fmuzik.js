const fptWorkplace = "https://fpt.workplace.com";

let oldHref = "";

let activeFMuzik = false;
let activePlaylist = false;
let enableLoopVideo = false;
let fmuzikEverywhere = false;
let workplaceUrls = [];
let playlist = []; // [{id: fmuzikp123, videos: [{name: "12345", url: 'http://...'}]}]

let statusInit = false;

let popupPlaylist = document.querySelector(".fmuzik-popup-playlist");
let playlistPanel = document.querySelector(".fmuzik-playlist-panel");
let popupPlaylistSpinner = document.querySelector(".fmuzik-popup-playlist--spinner");

let currentPlaylistPlayer = [];
let currentIndexPlaylistVideo = -1;

//#region declear function
/**
 * Check condition to start FMuzik
 */
function checkStartCondition() {
  let result = false;

  if(!document.querySelector(".plugin.webkit")) { // Check not mini player
    if (fmuzikEverywhere) {
      // FMuzik alway active on all FPT Workplace URL
      result = true;
    } else if (workplaceUrls.length > 0) {
      const isViewerEl = document.querySelector("[data-pagelet=TahoeRightRail]");

      workplaceUrls.forEach((element) => {
        if (document.location.href.includes(element)) {
          result = true;
        } else if (isViewerEl) {
          // Mode viewer
          // get href on top right like: Vo Quang Nghia (GAM.DAP) > Nhac nhac nhac
          // TODO: Unavailble now
          const tmp = isViewerEl.firstElementChild.firstElementChild.firstElementChild.querySelectorAll("a[role=link]");
          if (tmp) {
            tmp.forEach((el) => {
              let hrefTmp = el.getAttribute("href");
              if (hrefTmp[hrefTmp.length - 1] == "/") {
                hrefTmp = hrefTmp.substring(0, hrefTmp.length - 1);
              }
    
              if (hrefTmp == element) {
                result = true;
              }
            });
          }
        }
      });
    }
  }
  return result;
}

/**
 * Close popup playlist
 */
function closePopupPlaylist() {
  const rowFmuzikPopupPlaylistMain = document.querySelector(".fmuzik-popup-playlist--main");
  if (rowFmuzikPopupPlaylistMain) {
    rowFmuzikPopupPlaylistMain.innerHTML = "";
  }
  popupPlaylist.classList.add("d-none");
}

/**
 * Show popup playlist
 */
function showPopupPlaylist() {
  popupPlaylist.classList.remove("d-none");
  const rowFmuzikPopupPlaylistMain = document.querySelector(".fmuzik-popup-playlist--main");
  if (rowFmuzikPopupPlaylistMain) {
    rowFmuzikPopupPlaylistMain.innerHTML = "";
  }
}

/**
 * Show popup playlist spinner
 */
function showPopupPlaylistSpinner() {
  popupPlaylistSpinner.classList.remove("d-none");
}

/**
 * Show popup playlist spinner
 */
function hidePopupPlaylistSpinner() {
  popupPlaylistSpinner.classList.add("d-none");
}

/**
 * Function show alert
 */
function showAlert(kind, msg) {
  const alert = document.querySelector(".fmuzik-alert");
  alert.classList.add("fmuzik-alert-" + kind);
  alert.innerText = msg;
}

/**
 * Function hide alert
 */
function hideAlert() {
  const alert = document.querySelector(".fmuzik-alert");
  setTimeout(() => {
    alert.className = "fmuzik-alert";
    alert.innerText = "";
  }, 1000);
}

/**
 * Create alert element
 */
function createAlertElement() {
  if (!document.querySelector(".fmuzik-alert")) {
    const alert = document.createElement("div");
    alert.classList.add("fmuzik-alert");
    document.querySelector("body").insertAdjacentElement("afterbegin", alert);
  }
}

let oldNumOfVideos = 0;
/**
 * Setup loop videos
 */
function setupLoopVideos(video) {
  if (enableLoopVideo) {
    video.loop = true;
  } else {
    video.loop = false;
  }
}

/**
 * Assign FMuzik id to video
 */
function assignFMuzikId(video) {
  if (!video.getAttribute("fmuzik_id")) {
    const newId = "" + (Math.floor(Math.random() * 1000) + 2) + (Math.floor(Math.random() * 1000) + 1);
    video.setAttribute("fmuzik_id", "fmuzik" + newId);

    let link = video.closest("[data-visualcompletion=ignore]")?.querySelector('a[href^="'+fptWorkplace+'"][role=link]');
      // video.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
      //   "a[role=link]"
      // );
    if (link) {
      // single in  newsfeed
      link = link.getAttribute("href");
      if (link[link.length - 1] == "/") {
        link = link.substring(0, link.length - 1);
      }
      video.setAttribute("fmuzik_video_url", link);
    } else {
      link = video.closest('a[href^="'+fptWorkplace+'"][role=link]');
      if (link) {
        link = link.getAttribute("href");
        if (link[link.length - 1] == "/") {
          link = link.substring(0, link.length - 1);
        }
        // album in newsfeed
        video.setAttribute("fmuzik_video_url", link);
      } else if (document.location.href.match(/\/videos\//g)) {
        if (
          document.querySelector("[data-name=media-viewer-nav-container]") ||
          document.querySelector("[data-pagelet=TahoeVideo]")
        ) {
          // albumn viewer or single video viewer
          const location = document.location;
          let pathname = location.pathname;
          if (pathname[pathname.length - 1] == "/") {
            pathname = pathname.substring(0, pathname.length - 1);
          }
          video.setAttribute("fmuzik_video_url", location.origin + pathname);
        }
      }
    }
  }
}

/**
 * Get indexof videourl in list videos
 */
function getIndexOfVideo(videos, videoUrl) {
  let result = -1;
  if (videos && videos.length > 0) {
    videos.forEach((element, index) => {
      // element = {url: "http...", name: "abc"}
      if (element.url == videoUrl) {
        result = index;
      }
    });
  }
  return result;
}

/**
 * Save video to a playlist
 */
function saveVideoToPlaylistWithCheckbox(e, videoUrl, playlistIndex) {
  const playlistId = e.target.getAttribute("fmuzik_playlist_id");
  const inputVideoName = document.getElementById("fmuzik-playlist-video-name");
  chrome.storage.sync.get("playlist", (data) => {
    let playlistTmp = data.playlist;
    if (playlistTmp && playlistTmp.length > 0) {
      let newPlaylist = playlistTmp;
      playlistTmp.forEach((element, index) => {
        if (element.id == playlistId) {
          const indexOfUrl = getIndexOfVideo(element.videos, videoUrl);
          if (e.target.checked) {
            if (!inputVideoName || inputVideoName.value == "" || inputVideoName.value == null) {
              e.target.checked = false;
              e.target.setAttribute("checked", "false");
              //e.preventDefault();
              showAlert("danger", "Vui lòng nhập tên gợi nhớ hợp lệ!");
              return setTimeout(() => {
                hideAlert();
              }, 1000);
            }
            // check exist
            if (indexOfUrl == -1) {
              newPlaylist[index].videos.push({ url: videoUrl, name: inputVideoName.value });
              showAlert("success", "Thêm video vào playlist '" + element.name + "' thành công!");
              setTimeout(() => {
                hideAlert();
              }, 1000);
            }
          } else {
            if (indexOfUrl > -1) {
              newPlaylist[index].videos.splice(indexOfUrl, 1);
              showAlert("success", "Xóa video khỏi playlist '" + element.name + "' thành công!");
              setTimeout(() => {
                hideAlert();
              }, 1000);
            }
          }
        }
      });

      chrome.storage.sync.set({ playlist: newPlaylist });
      // refresh playlist panel
      createPlaylistItems();
    }
  });
}

/**
 * Create new playlist
 */
function createNewPlaylist(fmuzik_id) {
  showPopupPlaylistSpinner();
  const input = document.getElementById("fmuzik-playlist-create");
  const inputVideoName = document.getElementById("fmuzik-playlist-video-name");
  if (!input || input.value == "" || input.value == null) {
    showAlert("danger", "Vui lòng nhập tên playlist hợp lệ!");
    setTimeout(() => {
      hideAlert();
    }, 1000);
  } else if (!inputVideoName || inputVideoName.value == "" || inputVideoName.value == null) {
    showAlert("danger", "Vui lòng nhập tên gợi nhớ hợp lệ!");
    setTimeout(() => {
      hideAlert();
    }, 1000);
  } else {
    // insert to playlist arr
    chrome.storage.sync.get("playlist", (data) => {
      playlist = data && data.playlist ? data.playlist : [];
      const newPlaylistId = "" + (Math.floor(Math.random() * 1000) + 1) + (Math.floor(Math.random() * 1000) + 2);

      const video = document.querySelector("video[fmuzik_id=" + fmuzik_id + "]");
      if (!video) {
        showAlert("danger", "Xảy ra lỗi gì đó rồi, không tìm thấy video để lưu vào playlist!");
        setTimeout(() => {
          hideAlert();
        }, 1000);
      } else {
        const playlistObj = {
          id: newPlaylistId,
          name: input.value,
          videos: [{ url: video.getAttribute("fmuzik_video_url"), name: inputVideoName.value }],
        };
        if (playlist.length > 0) {
          playlist.push(playlistObj);
        } else {
          playlist = [playlistObj];
        }
        chrome.storage.sync.set({
          playlist: playlist,
        });

        // refresh playlist panel
        createPlaylistItems();

        showAlert("success", "Đã thêm video vào playlist '" + input.value + "'!");
        closePopupPlaylist();
        return setTimeout(() => {
          hideAlert();
        }, 1000);
      }
    });
  }
  setTimeout(() => {
    hidePopupPlaylistSpinner();
  }, 500);
}

/**
 * Create popup content Save to playlist
 */
function createSaveToPlaylistElement(fmuzik_id) {
  const popupPlaylistContainer = document.querySelector(".fmuzik-popup-playlist--main");
  if (popupPlaylistContainer) {
    const buttonCreate = document.createElement("button");
    buttonCreate.id = "fmuzik-playlist-create-btn";
    buttonCreate.classList.add("fmuzik-form-btn");
    buttonCreate.innerText = "Thêm";
    buttonCreate.addEventListener("click", (e) => createNewPlaylist(fmuzik_id));
    popupPlaylistContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="fmuzik-playlist-save-to--container">
        <div class="fmuzik-row fmuzik-playlist-save-to--video-name">
          <div class="fmuzik-col fmuzik-form-group">
            <label class="fmuzik-form-label">Tên gợi nhớ (*): </label>
            <input type="text" id="fmuzik-playlist-video-name" class="fmuzik-form-input" placeholder="Nhập tên gợi nhớ (150 kí tự)">
          </div>
        </div>
        <div class="fmuzik-row fmuzik-playlist-save-to--top">
          <div class="fmuzik-col fmuzik-form-group">
            <label class="fmuzik-form-label">Lưu vào..</label>
          </div>
        </div>
        <div class="fmuzik-row fmuzik-playlist-save-to--main">
          <div class="fmuzik-col fmuzik-form-checkbox-group fmuzik-form-group">
          </div>
        </div>
        <div class="fmuzik-row fmuzik-playlist-save-to--bottom">
          <div class="fmuzik-col fmuzik-form-group">
            <label class="fmuzik-form-label">Tạo mới: </label>
            <input type="text" id="fmuzik-playlist-create" class="fmuzik-form-input" placeholder="Nhập tên playlist (150 kí tự)">
          </div>
        </div>
      </div>
      `
    );
    document
      .querySelector(".fmuzik-playlist-save-to--bottom")
      .firstElementChild.insertAdjacentElement("beforeend", buttonCreate);
  }
}

/**
 * Play video
 */
function playVideo(url, index) {
  currentIndexPlaylistVideo = index;

  const newUrl = encodeURIComponent(url);
  const iframe = `<iframe id="fmuzik-player" src="https://fpt.workplace.com/plugins/video.php?href=${newUrl}%2F&width=300&show_text=false&height=144&mute=0&autoplay=true&appId" width="300" height="144" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true">
  </iframe>
  `;
  const playlistPanelPlayerMask = document.querySelector(".fmuzik-playlist-panel--player-mask");
  playlistPanelPlayerMask.classList.add("fmuzik-playlist-panel--player-mask");
  playlistPanelPlayerMask.innerHTML = "";
  playlistPanelPlayerMask.insertAdjacentHTML("afterbegin", iframe);
  const player = document.querySelector("#fmuzik-player");

  player.addEventListener("load", (e) => {
    const video = player.contentWindow.document.body.querySelector("video");
    // unmuted
    video.muted = false;
    video.volume = 1.0;
    video.play();
    video.oncanplay = function () {
      video.defaultMuted = false;
      video.removeAttribute("muted");
      video.volume = 1.0;
    };

    video.addEventListener("ended", (e) => {
      // next video
      nextVideo(e);
    });
  });
}

/**
 * Select video
 */
function selectVideo(e, video, index) {
  e.preventDefault();
  // play video
  playVideo(video.url, index);
}

/**
 * Back from list video to playlist
 */
function backToPlaylist(e) {
  e.preventDefault();
  createPlaylistItems();
  if (document.querySelector(".fmuzik-playlist__controls")) {
    document.querySelector(".fmuzik-playlist__controls").remove();
  }
}

/**
 * Previous video
 */
function prevVideo(e) {
  e.preventDefault();
  const min = 0;
  const max = currentPlaylistPlayer.length - 1;

  let nextVideo = 0;
  if (currentIndexPlaylistVideo === -1 || currentIndexPlaylistVideo === min) {
    nextVideo = max;
  } else if (currentIndexPlaylistVideo > min) {
    nextVideo = currentIndexPlaylistVideo - 1;
  }

  const nextVideoItem = currentPlaylistPlayer[nextVideo];
  playVideo(nextVideoItem.url, nextVideo);
}

/**
 * Next video
 */
function nextVideo(e) {
  e.preventDefault();
  const min = 0;
  const max = currentPlaylistPlayer.length - 1;

  let nextVideo = 0;
  if (currentIndexPlaylistVideo === -1 || currentIndexPlaylistVideo === max) {
    nextVideo = min;
  } else if (currentIndexPlaylistVideo < max) {
    nextVideo = currentIndexPlaylistVideo + 1;
  }

  const nextVideoItem = currentPlaylistPlayer[nextVideo];
  playVideo(nextVideoItem.url, nextVideo);
}

/**
 * Create controls player
 */
function createControlsPlayerElement() {
  if (document.querySelector(".fmuzik-playlist__controls")) {
    document.querySelector(".fmuzik-playlist__controls").remove();
  }
  const controls = document.createElement("div");
  controls.classList.add("fmuzik-playlist__controls");

  const backToPlaylistBtn = document.createElement("button");
  backToPlaylistBtn.classList.add("fmuzik-playlist__controls--back");
  backToPlaylistBtn.innerHTML = `
    <i class="gg-arrow-left-o"></i>
  `;
  backToPlaylistBtn.addEventListener("click", (e) => backToPlaylist(e));

  const prevBtn = document.createElement("button");
  prevBtn.classList.add("fmuzik-playlist__controls--prev");
  prevBtn.innerHTML = `
    <i class="gg-play-track-prev-o"></i>
  `;
  prevBtn.addEventListener("click", (e) => prevVideo(e));

  const nextBtn = document.createElement("button");
  nextBtn.classList.add("fmuzik-playlist__controls--next");
  nextBtn.innerHTML = `
    <i class="gg-play-track-next-o"></i>
  `;
  nextBtn.addEventListener("click", (e) => nextVideo(e));

  controls.appendChild(backToPlaylistBtn);
  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);

  return controls;
}

/**
 * Delete video from playlist
 */
function deleteVideo(e, playlistId, video, index) {
  e.preventDefault();
  // delete video
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];
    let newPlaylist = playlist;
    let playlistItem = [];

    if (!playlist || playlist.length == 0) {
      showAlert("danger", "Xảy ra lỗi khi xóa video khỏi playlist!");
      return setTimeout(() => {
        hideAlert();
      }, 1000);
    } else {
      const videoUrl = video.url;
      playlist.forEach((playlistElement, i) => {
        if (
          playlistElement.videos &&
          playlistElement.videos.length > 0 &&
          videoUrl &&
          getIndexOfVideo(playlistElement.videos, videoUrl) > -1
        ) {
          const indexOfUrl = getIndexOfVideo(playlistElement.videos, videoUrl);
          newPlaylist[i].videos.splice(indexOfUrl, 1);
          playlistItem = newPlaylist[i];
          showAlert("success", "Xóa video khỏi playlist '" + playlistElement.name + "' thành công!");
          setTimeout(() => {
            hideAlert();
          }, 1000);
        }
      });
      playlist = newPlaylist;
      chrome.storage.sync.set({ playlist: newPlaylist });
      // create list videos
      createListVideosElement(playlistItem);
    }
  });
}

/**
 * Create list videos
 */
function createListVideosElement(playlistItem) {
  currentIndexPlaylistVideo = -1;
  const listPlayer = document.querySelector(".fmuzik-playlist-panel--list-player");
  listPlayer.classList.add("fmuzik-playlist-panel--list-player-video");
  const videos = playlistItem.videos && playlistItem.videos.length > 0 ? playlistItem.videos : [];
  listPlayer.innerHTML = "";
  const label = document.querySelector(".fmuzik-playlist-panel--player-label");
  label.innerText = `Playlist ${playlistItem.name}:`;
  label.insertAdjacentElement("beforebegin", createControlsPlayerElement());
  if (videos.length > 0) {
    currentPlaylistPlayer = videos;
    videos.forEach((element, index) => {
      const video = document.createElement("a");
      video.href = "javascript:void(0)";
      video.classList.add("fmuzik-playlist__item");
      video.setAttribute("fmuzik_playlist_id", index);
      video.innerHTML = `<span>${element.name}</span>`;
      video.addEventListener("click", (e) => selectVideo(e, element, index));

      const icon = document.createElement("i");
      icon.classList.add("fmuzik-playlist__item--icon", "gg-play-button-o");
      const spanTemp = document.createElement("div");
      spanTemp.appendChild(icon);
      video.insertAdjacentElement("afterbegin", spanTemp);

      const divTmp = document.createElement("div");
      divTmp.classList.add("fmuzik-playlist__item--wrap");
      divTmp.appendChild(video);

      const deleteBtnEl = document.createElement("button");
      deleteBtnEl.classList.add("fmuzik-playlist__item__delete-btn");
      deleteBtnEl.addEventListener("click", (e) => deleteVideo(e, playlistItem.id, element, index));
      divTmp.appendChild(deleteBtnEl);
      // insert item to list
      listPlayer.appendChild(divTmp);
    });
  } else {
    currentPlaylistPlayer = [];
  }
}

/**
 * Select playlist
 */
function selectPlaylist(e, playlistItem) {
  e.preventDefault();
  // create list videos
  createListVideosElement(playlistItem);
}

/**
 * Show player mask
 */
function showPlayerMask() {
  const listPlayer = document.querySelector(".fmuzik-playlist-panel--list-player");
  listPlayer.classList.add("fmuzik-playlist-panel--player-not-demand");

  const listPlayerMask = document.querySelector(".fmuzik-playlist-panel--player-mask");
  listPlayerMask.classList.remove("d-none");
}
/**
 * Hide player mask
 */
function hidePlayerMask() {
  const listPlayer = document.querySelector(".fmuzik-playlist-panel--list-player");
  const listPlayerMask = document.querySelector(".fmuzik-playlist-panel--player-mask");

  listPlayer.classList.remove("fmuzik-playlist-panel--player-not-demand");
  listPlayerMask.classList.add("d-none");
}

/**
 * Create playlist items element
 */
function createPlaylistItems() {
  const listPlayer = document.querySelector(".fmuzik-playlist-panel--list-player");
  listPlayer.classList.remove("fmuzik-playlist-panel--list-player-video");
  const listPlayerMask = document.querySelector(".fmuzik-playlist-panel--player-mask");
  listPlayer.innerHTML = "";
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data.playlist && data.playlist.length > 0 ? data.playlist : [];

    const label = document.querySelector(".fmuzik-playlist-panel--player-label");
    label.innerText = "Danh sách playlist của bạn:";
    if (playlist.length > 0) {
      listPlayer.classList.remove("fmuzik-playlist-panel--player-not-demand");
      playlist.forEach((element, index) => {
        const playlistItem = document.createElement("a");
        playlistItem.href = "javascript:void(0)";
        playlistItem.classList.add("fmuzik-playlist__item");
        playlistItem.innerHTML = `<span>${element.name}</span>`;
        playlistItem.addEventListener("click", (e) => selectPlaylist(e, element));

        const icon = document.createElement("i");
        icon.classList.add("fmuzik-playlist__item--icon", "gg-play-list");
        const spanTemp = document.createElement("div");
        spanTemp.appendChild(icon);
        playlistItem.insertAdjacentElement("afterbegin", spanTemp);

        const divTmp = document.createElement("div");
        divTmp.classList.add("fmuzik-playlist__item--wrap");
        divTmp.appendChild(playlistItem);
        // insert item to list
        listPlayer.appendChild(divTmp);
      });
    } else {
      showPlayerMask();
    }
  });
}

/**
 * Create playlist panel element
 */
function createPlaylistPanelElement() {
  const body = document.querySelector("body");

  if (activePlaylist && !playlistPanel && body) {
    playlistPanel = document.createElement("div");
    playlistPanel.classList.add("fmuzik-playlist-panel");

    const playlistPanelContainer = document.createElement("div");
    playlistPanelContainer.classList.add("fmuzik-playlist-panel--container");
    playlistPanel.appendChild(playlistPanelContainer);

    const playlistPanelPlayerMask = document.createElement("div");
    playlistPanelPlayerMask.classList.add("fmuzik-playlist-panel--player-mask");
    // playlistPanelPlayerMask.insertAdjacentHTML(
    //   "afterbegin",
    //   `
    //   <iframe id="fmuzik-player" src="https://fpt.workplace.com/plugins/video.php?href=https%3A%2F%2Ffpt.workplace.com%2F100069264112544%2Fvideos%2Fpcb.2172174176270675%2F590466318920822%2F&width=300&show_text=false&height=144&autoplay=true&appId" width="300" height="144" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>
    // `
    // );
    playlistPanelContainer.appendChild(playlistPanelPlayerMask);

    const playlistPanelPlayer = document.createElement("div");
    playlistPanelPlayer.classList.add("fmuzik-playlist-panel--player", "fmuzik-playlist-panel--player-not-demand");
    playlistPanelContainer.appendChild(playlistPanelPlayer);

    const playlistPanelPlayerLabel = document.createElement("div");
    playlistPanelPlayerLabel.classList.add("fmuzik-playlist-panel--player-label");
    playlistPanelPlayerLabel.innerText = "Danh sách playlist của bạn:";
    playlistPanelContainer.appendChild(playlistPanelPlayerLabel);

    const playlistPanelListPlayer = document.createElement("div");
    playlistPanelListPlayer.classList.add("fmuzik-playlist-panel--list-player");
    playlistPanelContainer.appendChild(playlistPanelListPlayer);

    const credit = document.createElement("div");
    credit.classList.add("row", "text-right", "text-muted", "fmuzik-credit");
    credit.innerText = "FMuzik by NhutTH4 =)";
    playlistPanelContainer.appendChild(credit);

    playlistPanel.appendChild(playlistPanelContainer);

    body.insertAdjacentElement("afterbegin", playlistPanel);
    // create playlist items element
    createPlaylistItems();
  } else if (!activePlaylist && body && playlistPanel) {
    playlistPanel.innerHTML = "";
  }
}

/**
 * Save video to playlist
 */
function saveVideoToPlaylist(e, fmuzik_id) {
  e.preventDefault();
  e.stopPropagation();

  showPopupPlaylistSpinner();
  showPopupPlaylist();
  createSaveToPlaylistElement(fmuzik_id);
  // prepare data
  const rowFmuzikPopupPlaylistMain = document.querySelector(".fmuzik-playlist-save-to--main");
  rowFmuzikPopupPlaylistMain.innerHTML = "";
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];

    if (!playlist || playlist.length == 0) {
      // add empty mask
      const maskEmpty = document.createElement("div");
      maskEmpty.classList.add("fmuzik-popup-playlist--empty");
      rowFmuzikPopupPlaylistMain.appendChild(maskEmpty);
    } else {
      const video = document.querySelector("video[fmuzik_id=" + fmuzik_id + "]");
      const videoUrl = video ? video.getAttribute("fmuzik_video_url") : "";
      playlist.forEach((playlistElement, index) => {
        const playlistEl = document.createElement("div");
        playlistEl.classList.add("fmuzik-col", "fmuzik-form-checkbox-group", "fmuzik-form-group");

        const playlistCheckboxEl = document.createElement("input");
        playlistCheckboxEl.setAttribute("type", "checkbox");
        playlistCheckboxEl.id = playlistElement.id;
        playlistCheckboxEl.setAttribute("fmuzik_playlist_id", playlistElement.id);
        playlistCheckboxEl.classList.add("fmuzik-form-checkbox-input");

        if (
          playlistElement.videos &&
          playlistElement.videos.length > 0 &&
          videoUrl &&
          getIndexOfVideo(playlistElement.videos, videoUrl) > -1
        ) {
          playlistCheckboxEl.setAttribute("checked", "true");
        }

        playlistCheckboxEl.addEventListener("change", (e) => saveVideoToPlaylistWithCheckbox(e, videoUrl, index));

        playlistEl.appendChild(playlistCheckboxEl);

        const playlistCheckboxLabelEl = document.createElement("label");
        playlistCheckboxLabelEl.classList.add("fmuzik-form-checkbox-label");
        playlistCheckboxLabelEl.innerText = playlistElement.name;
        playlistCheckboxLabelEl.setAttribute("for", playlistElement.id);

        playlistEl.appendChild(playlistCheckboxLabelEl);

        rowFmuzikPopupPlaylistMain.appendChild(playlistEl);
      });
    }
    setTimeout(() => {
      hidePopupPlaylistSpinner();
    }, 500);
  });
}

/**
 * Setup save to playlist
 */
function setupSaveToPlaylist(video) {
  const buttonSaveToPlaylist = video.closest("[data-visualcompletion=ignore]")?.querySelector(".fmuzik__save-to-playlist--btn");
  const buttonSaveToPlaylistInMediaViewerMode = document.querySelector("[data-name=media-viewer-nav-container]");
  if (activePlaylist && !buttonSaveToPlaylist) {
    // add button save to playlist on top video
    const newButtonSaveToPlaylist = document.createElement("button");
    newButtonSaveToPlaylist.classList.add("fmuzik__save-to-playlist--btn");
    newButtonSaveToPlaylist.addEventListener("click", (e) => saveVideoToPlaylist(e, video.getAttribute("fmuzik_id")));

    // insert button on top of video
    if (buttonSaveToPlaylistInMediaViewerMode) {
      newButtonSaveToPlaylist.classList.add("fmuzik__save-to-playlist--btn__viewer-mode");
      buttonSaveToPlaylistInMediaViewerMode.insertAdjacentElement("afterbegin", newButtonSaveToPlaylist);
    } else {
      if (document.querySelector("[data-pagelet=TahoeVideo]") || document.querySelector("[data-name=media-viewer-nav-container]")) {
        newButtonSaveToPlaylist.classList.add("fmuzik__save-to-playlist--btn__viewer-mode");
      }
      if (document.querySelector("[data-name=media-viewer-nav-container]") && !document.querySelector("[data-pagelet=TahoeVideo]")) {
        // Mode viewer
        document.querySelector("[data-name=media-viewer-nav-container]").querySelector("[data-instancekey] [data-visualcompletion=ignore]").insertAdjacentElement(
          "afterbegin",
          newButtonSaveToPlaylist
        );
      } else {
        video.closest("[data-visualcompletion=ignore]")?.querySelector("[data-instancekey] [data-visualcompletion=ignore]").insertAdjacentElement(
          "afterbegin",
          newButtonSaveToPlaylist
        );
      }
    }
  } else if (!activePlaylist) {
    // remove button save to playlist on top video
    if (buttonSaveToPlaylist) {
      buttonSaveToPlaylist.remove();
    } else if (buttonSaveToPlaylistInMediaViewerMode) {
      const buttonInMediaViewerMode = buttonSaveToPlaylistInMediaViewerMode.querySelector(
        ".fmuzik__save-to-playlist--btn"
      );
      if (buttonInMediaViewerMode) {
        buttonInMediaViewerMode.remove();
      }
    }
  }
}

/**
 * Setup videos
 */
function setupVideos() {
  const geminiLayoutEntity = document.querySelector("[data-pagelet=GeminiLayoutEntity]");
  const feed = geminiLayoutEntity ? geminiLayoutEntity.querySelector("[role=feed]") : null;

  const searchMode = document.location.pathname.match("/search/");

  // normal video in newsfeed
  let videos = feed ? feed.querySelectorAll("video") : [];

  if (document.querySelector("[data-name=media-viewer-nav-container]")) {
    // albumn viewer

    videos = document
      .querySelector("[data-name=media-viewer-nav-container]")
      .nextElementSibling.querySelectorAll("video");
  } else if (document.querySelector("[data-pagelet=TahoeVideo]")) {
    // single video viewer
    videos = document.querySelector("[data-pagelet=TahoeVideo]").querySelectorAll("video");
  } else if (geminiLayoutEntity && searchMode) {
    // Search mode
    const geminiLayoutEntityTmp = document.querySelectorAll("[data-pagelet=GeminiLayoutEntity]");
    if (geminiLayoutEntityTmp.length == 2) {
      // After enter search action
      videos = geminiLayoutEntityTmp[1].querySelectorAll("video");
    } else {
      videos = geminiLayoutEntity.querySelectorAll("video");
    }
  } else {
    const geminiLayoutEntityTmp = document.querySelectorAll("[data-pagelet=GeminiLayoutEntity]");
    let roleArticle = null;
    if (feed && geminiLayoutEntityTmp && geminiLayoutEntityTmp.length == 2) {
      roleArticle = geminiLayoutEntityTmp[1].querySelector("[role=main]")?.querySelector("[role=article]");
    } else if(!feed && geminiLayoutEntityTmp && geminiLayoutEntityTmp.length == 1) {
      roleArticle = geminiLayoutEntityTmp[0].querySelector("[role=main]")?.querySelector("[role=article]");
    }
    if (roleArticle) {
      // A post have a video
      videos = roleArticle.querySelectorAll("video");
    }
  }

  if (oldNumOfVideos == videos.length) {
    return;
  }

  oldNumOfVideos = videos.length;

  videos.forEach((video, index) => {
    /** assign fmuzik id to video */
    assignFMuzikId(video);
    // call setup loop video
    setupLoopVideos(video);
    /** setup save to playlist */
    setupSaveToPlaylist(video);
  });
}

/**
 * Setup popup save playlist
 */
function setupPopupPlaylist() {
  if (activePlaylist && !popupPlaylist) {
    popupPlaylist = document.createElement("div");
    popupPlaylist.classList.add("fmuzik-popup-playlist");

    const popupPlaylistContainer = document.createElement("div");
    popupPlaylistContainer.classList.add("fmuzik-popup-playlist--container");

    popupPlaylistSpinner = document.createElement("div");
    popupPlaylistSpinner.classList.add("fmuzik-popup-playlist--spinner-container", "d-none");
    const popupPlaylistSpinnerMain = document.createElement("div");
    popupPlaylistSpinnerMain.classList.add("fmuzik-popup-playlist--spinner");
    popupPlaylistSpinner.appendChild(popupPlaylistSpinnerMain);
    popupPlaylistContainer.appendChild(popupPlaylistSpinner);

    const popupPlaylistCloseXBtn = document.createElement("button");
    popupPlaylistCloseXBtn.classList.add("fmuzik-popup-playlist--close-x");
    popupPlaylistCloseXBtn.innerText = "x";
    popupPlaylistCloseXBtn.addEventListener("click", (e) => closePopupPlaylist());
    popupPlaylistContainer.appendChild(popupPlaylistCloseXBtn);

    const rowFmuzikPopupPlaylistMain = document.createElement("div");
    rowFmuzikPopupPlaylistMain.classList.add("fmuzik-popup-playlist--main");
    popupPlaylistContainer.appendChild(rowFmuzikPopupPlaylistMain);

    popupPlaylist.appendChild(popupPlaylistContainer);
    document.querySelector("body").insertAdjacentElement("afterbegin", popupPlaylist);

    // createSaveToPlaylistElement();

    popupPlaylist.classList.add("d-none");
  } else {
  }
}

/**
 * Init FMuzik extension
 */
function fmuzikInit() {
  setTimeout(() => {
    if (!activeFMuzik) {
      return;
    }

    /**
     * catch url changed
     * https://stackoverflow.com/a/46428962
     */
    let bodyList = document.querySelector("body");

    let observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        // if (oldHref != document.location.href) {
        //   oldHref = document.location.href;
        // }
        /* Changed ! your code here */
        if ((!statusInit && checkStartCondition()) || (oldHref != document.location.href && checkStartCondition())) {
          statusInit = true;
          oldHref = document.location.href;
          oldNumOfVideos = 0;
          // Start FMuzik here

          // Load module
          // Setup videos
          setupVideos();
          // setup alert
          createAlertElement();
          // Create layout panel
          // Setup popup playlist
          setupPopupPlaylist();
          // Setup playlist panel
          createPlaylistPanelElement();
        } else {
          if (oldHref != document.location.href) {
            statusInit = false;
            oldHref = document.location.href;
            /** reset list videos */
            oldNumOfVideos = 0;
            if (playlistPanel) {
              playlistPanel.classList.add("d-none");
            }
          }
        }
        if (statusInit && oldHref == document.location.href && checkStartCondition()) {
          // Trigger anything in DOM changed
          // Setup videos
          setupVideos();
          if (playlistPanel && playlistPanel.classList.contains("d-none")) {
            playlistPanel.classList.remove("d-none");
          }
        }
      });
    });

    let config = {
      // attributes: true,
      childList: true,
      subtree: true,
    };

    observer.observe(bodyList, config);
  }, 100);
}
//#endregion load function

//#region load function
chrome.storage.sync.get((data) => {
  if (data.workplaceUrl && data.workplaceUrl.length > 0) {
    workplaceUrls = data.workplaceUrl;
  }
  if (typeof data.active == "boolean" && data.active) {
    activeFMuzik = true;
    if (typeof data.fmuzikEverywhere == "boolean" && data.fmuzikEverywhere) {
      fmuzikEverywhere = true;
    }
  }
  if (typeof data.activePlaylist == "boolean" && data.activePlaylist) {
    activePlaylist = true;
    playlist = data.playlist;
  }
  if (typeof data.loopEnabled == "boolean" && data.loopEnabled) {
    enableLoopVideo = true;
  }

  fmuzikInit();
});
//#endregion load function
