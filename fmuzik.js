const fptWorkplace = "https://fpt.workplace.com";

let oldHref = "";

let activeFMuzik = false;
let activePlaylist = false;
let enableLoopVideo = false;
let fmuzikEverywhere = false;
let workplaceUrls = [];
let playlist = [];
// example:
// {id: string, name: string, videos: [{name: string, url: string}]}
// [
//   {
//     id: "fmuzikp123",
//     name: "FMuzik P Name 123",
//     videos: [
//       {
//         name: "12345",
//         url: 'http://...'
//       }
//     ]
//   }
// ]

let statusInit = false;

let popupPlaylist = document.querySelector(".fmuzik-popup-playlist");
let playlistPanel = document.querySelector(".fmuzik-playlist-panel");
let popupPlaylistSpinner = document.querySelector(
  ".fmuzik-popup-playlist--spinner"
);

const MSG_TYPE = {
  DANGER: "danger",
  SUCCESS: "success",
};
const MSG = {
  DEL_PLAYLIST_SUCCESS: "Xóa playlist thành công!",
  WRONG_VIDEO_NAME: "Vui lòng nhập tên video hợp lệ!",
  WRONG_PLAYLIST_NAME: "Vui lòng nhập tên playlist hợp lệ!",
  DEL_VIDEO_PLAYLIST_ERROR: "Xảy ra lỗi khi xóa video khỏi playlist!",
  SAVE_VIDEO_PLAYLIST_ERROR_NOT_FOUND:
    "Xảy ra lỗi gì đó rồi, không tìm thấy video để lưu vào playlist!",
  DEL_PLAYLIST_ERROR: "Xảy ra lỗi khi xóa playlist!",
  REORDER_PLAYLIST_VIDEO_ERROR_ON_SAVE:
    "Xảy ra lỗi khi lưu playlist khi reorder!",
};

let currentPlaylistPlayer = [];
let currentPlaylistId = -1;
let currentIndexPlaylistVideo = -1;

const modeDev = true;

//#region declear function

/**
 * Log to console in development
 * @param {*} content
 */
function log(content) {
  if (modeDev) {
    console.log(content);
  }
}

/**
 * Check condition to start FMuzik
 */
function checkStartCondition() {
  let result = false;

  if (!document.querySelector(".plugin.webkit")) {
    // Check not mini player
    if (fmuzikEverywhere) {
      // FMuzik alway active on all FPT Workplace URL
      result = true;
    } else if (workplaceUrls.length > 0) {
      const isViewerEl = document.querySelector(
        "[data-pagelet=TahoeRightRail]"
      );

      workplaceUrls.forEach((element) => {
        if (document.location.href.includes(element)) {
          result = true;
        } else if (isViewerEl) {
          // Mode viewer
          // get href on top right like: Vo Quang Nghia (GAM.DAP) > Nhac nhac nhac
          // TODO: Unavailble now
          const tmp =
            isViewerEl.firstElementChild.firstElementChild.firstElementChild.querySelectorAll(
              "a[role=link]"
            );
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
  const rowFmuzikPopupPlaylistMain = document.querySelector(
    ".fmuzik-popup-playlist--main"
  );
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
  const rowFmuzikPopupPlaylistMain = document.querySelector(
    ".fmuzik-popup-playlist--main"
  );
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
    const newId =
      "" +
      (Math.floor(Math.random() * 1000) + 2) +
      (Math.floor(Math.random() * 1000) + 1);
    video.setAttribute("fmuzik_id", "fmuzik" + newId);

    let link = video
      .closest("[data-visualcompletion=ignore]")
      ?.querySelector('a[href^="' + fptWorkplace + '"][role=link]');
    // video.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
    //   "a[role=link]"
    // );
    let contents = [];
    if (link) {
      // single in  newsfeed
      link = link.getAttribute("href");

      // format link video
      link = formatLinkVideo(link);

      video.setAttribute("fmuzik_video_url", link);
      log(video);
      contents = getContentsOfPostByVideoEl(video);
      saveContentsToVideo(video, contents);
    } else {
      link = video.closest('a[href^="' + fptWorkplace + '"][role=link]');
      if (link) {
        link = link.getAttribute("href");
        // format link video
        link = formatLinkVideo(link);
        // album in newsfeed
        video.setAttribute("fmuzik_video_url", link);
        log(video);
        contents = getContentsOfPostByVideoEl(video);
        saveContentsToVideo(video, contents);
      } else if (document.location.href.match(/\/videos\//g)) {
        if (
          document.querySelector("[data-name=media-viewer-nav-container]") ||
          document.querySelector("[data-pagelet=TahoeVideo]")
        ) {
          // albumn viewer or single video viewer
          const location = document.location;
          let pathname = location.pathname;

          // format link video
          pathname = formatLinkVideo(pathname);

          video.setAttribute("fmuzik_video_url", location.origin + pathname);
          log(video);
          contents = getContentsOfPostByVideoEl(video);
          saveContentsToVideo(video, contents);
        }
      }
    }
  } else {
    if (
      video.getAttribute("fmuzik_id") &&
      !video.getAttribute("fmuzik_video_url")
    ) {
      let link = video
        .closest("[data-visualcompletion=ignore]")
        ?.querySelector('a[href^="' + fptWorkplace + '"][role=link]');
      let contents = [];
      if (link) {
        // single in  newsfeed
        link = link.getAttribute("href");

        // format link video
        link = formatLinkVideo(link);

        video.setAttribute("fmuzik_video_url", link);
        log(video);
        contents = getContentsOfPostByVideoEl(video);
        saveContentsToVideo(video, contents);
      } else {
        link = video.closest('a[href^="' + fptWorkplace + '"][role=link]');
        if (link) {
          link = link.getAttribute("href");

          // format link video
          link = formatLinkVideo(link);

          // album in newsfeed
          video.setAttribute("fmuzik_video_url", link);
          log(video);
          contents = getContentsOfPostByVideoEl(video);
          saveContentsToVideo(video, contents);
        } else if (document.location.href.match(/\/videos\//g)) {
          if (
            document.querySelector("[data-name=media-viewer-nav-container]") ||
            document.querySelector("[data-pagelet=TahoeVideo]")
          ) {
            // albumn viewer or single video viewer
            const location = document.location;
            let pathname = location.pathname;

            // format link video
            pathname = formatLinkVideo(pathname);

            video.setAttribute("fmuzik_video_url", location.origin + pathname);
            log(video);
            contents = getContentsOfPostByVideoEl(video);
            saveContentsToVideo(video, contents);
          }
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
      if (formatLinkVideo(element.url) == formatLinkVideo(videoUrl)) {
        result = index;
      }
    });
  }
  return result;
}

/**
 const contents = * getContentsOfPostByVideoEl
 * Get div container of video which has id -> get previousElementSibling has dir="auto"
 * @param {Element} video
 * @returns {Array} contents arr
 */
function getContentsOfPostByVideoEl(video) {
  const parentHasId = video?.closest("div[id]");
  if (parentHasId) {
    log(parentHasId);
    const prevSibling = parentHasId.previousElementSibling;
    const prevSiblingAttrDir = prevSibling?.getAttribute("dir");
    if (prevSibling && prevSiblingAttrDir && prevSiblingAttrDir == "auto") {
      log(prevSibling);
      const prevSiblingSpanElArr = prevSibling.querySelectorAll("span");
      const prevSiblingContentArr = [];
      if (prevSiblingSpanElArr && prevSiblingSpanElArr.length > 0) {
        prevSiblingSpanElArr.forEach((text) => {
          if (text.textContent) {
            prevSiblingContentArr.push(text.textContent);
          }
        });
      }
      log(prevSiblingContentArr);
      // remove first element in arr:
      // ['#nhachoaNgoan hồnTin', '#nhachoa', '#nhachoa', '#nhachoa', 'Ngoan hồn', 'Tin']
      // 0: "#nhachoaNgoan hồnTin"
      // 1: "#nhachoa"
      // 2: "#nhachoa"
      // 3: "#nhachoa"
      // 4: "Ngoan hồn"
      // 5: "Tin"
      // =>
      // 0: "#nhachoa"
      // 1: "#nhachoa"
      // 2: "#nhachoa"
      // 3: "Ngoan hồn"
      // 4: "Tin"
      prevSiblingContentArr.shift();
      // remove duplicate
      // =>
      // 0: "#nhachoa"
      // 1: "Ngoan hồn"
      // 2: "Tin"
      // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
      const newPrevSiblingContentArr = [...new Set(prevSiblingContentArr)];
      log(newPrevSiblingContentArr);
      return newPrevSiblingContentArr;
    }
  }
  return [];
}

/**
 * setupPlaylistVideoNameSuggestion
 * Setup suggestion of video name input
 * @param {string} fmuzik_id
 * @link https://developer.mozilla.org/en-US/docs/Web/API/HTMLDataListElement
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
 */
function setupPlaylistVideoNameSuggestion(fmuzik_id) {
  // fmuzikVideoContents
  // id list: fmuzik-playlist-video-name-suggest
  const datalistEl = document.getElementById(
    "fmuzik-playlist-video-name-suggest"
  );
  log("setupPlaylistVideoNameSuggestion");
  log(datalistEl);
  if (datalistEl) {
    datalistEl.innerHTML = "";
    const video = document.querySelector("video[fmuzik_id=" + fmuzik_id + "]");
    if (video && "fmuzikVideoContents" in video.dataset) {
      const fmuzikVideoContents =
        JSON.parse(video.dataset.fmuzikVideoContents) ?? [];
      fmuzikVideoContents.forEach((text) => {
        const newOptionEl = document.createElement("option");
        newOptionEl.value = text;
        datalistEl.appendChild(newOptionEl);
      });
    }
  }
}

/**
 * saveContentsToVideo
 * Save contents of video to HTMLElement data-contents
 * @param {HTMLVideoElement} video
 * @param {Array} contents
 * @link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
 */
function saveContentsToVideo(video, contents) {
  video.dataset.fmuzikVideoContents = JSON.stringify(contents);
}

/**
 * Save video to a playlist
 */
function saveVideoToPlaylistWithCheckbox(e, videoUrl, playlistIndex) {
  showPopupPlaylistSpinner();
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
            if (
              !inputVideoName ||
              inputVideoName.value == "" ||
              inputVideoName.value == null
            ) {
              e.target.checked = false;
              e.target.setAttribute("checked", "false");
              //e.preventDefault();
              showAlert(MSG_TYPE.DANGER, MSG.WRONG_VIDEO_NAME);
              inputVideoName.focus();
              setTimeout(() => {
                hidePopupPlaylistSpinner();
              }, 500);
              return setTimeout(() => {
                hideAlert();
              }, 1000);
            }
            // check exist
            if (indexOfUrl == -1) {
              newPlaylist[index].videos.push({
                url: videoUrl,
                name: inputVideoName.value,
              });
              showAlert(
                MSG_TYPE.SUCCESS,
                "Thêm video vào playlist '" + element.name + "' thành công!"
              );
              setTimeout(() => {
                hidePopupPlaylistSpinner();
                closePopupPlaylist();
              }, 600);
              setTimeout(() => {
                hideAlert();
              }, 1000);
            }
          } else {
            if (indexOfUrl > -1) {
              newPlaylist[index].videos.splice(indexOfUrl, 1);
              showAlert(
                MSG_TYPE.SUCCESS,
                "Xóa video khỏi playlist '" + element.name + "' thành công!"
              );
              setTimeout(() => {
                hidePopupPlaylistSpinner();
              }, 600);
              setTimeout(() => {
                hideAlert();
              }, 1000);
            }
          }
        }
      });

      chrome.storage.sync.set({ playlist: newPlaylist });
      setTimeout(() => {
        // refresh playlist panel
        createPlaylistItems();
      }, 500);
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
    showAlert(MSG_TYPE.DANGER, MSG.WRONG_PLAYLIST_NAME);
    input.focus();
    setTimeout(() => {
      hideAlert();
    }, 1000);
  } else if (
    !inputVideoName ||
    inputVideoName.value == "" ||
    inputVideoName.value == null
  ) {
    showAlert(MSG_TYPE.DANGER, MSG.WRONG_VIDEO_NAME);
    inputVideoName.focus();
    setTimeout(() => {
      hideAlert();
    }, 1000);
  } else {
    // insert to playlist arr
    chrome.storage.sync.get("playlist", (data) => {
      playlist = data && data.playlist ? data.playlist : [];
      const newPlaylistId =
        "" +
        (Math.floor(Math.random() * 1000) + 1) +
        (Math.floor(Math.random() * 1000) + 2);

      const video = document.querySelector(
        "video[fmuzik_id=" + fmuzik_id + "]"
      );
      if (!video) {
        showAlert(MSG_TYPE.DANGER, MSG.SAVE_VIDEO_PLAYLIST_ERROR_NOT_FOUND);
        setTimeout(() => {
          hideAlert();
        }, 1000);
      } else {
        const playlistObj = {
          id: newPlaylistId,
          name: input.value,
          videos: [
            {
              url: video.getAttribute("fmuzik_video_url"),
              name: inputVideoName.value,
            },
          ],
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

        showAlert(
          MSG_TYPE.SUCCESS,
          "Đã thêm video vào playlist '" + input.value + "'!"
        );

        setTimeout(() => {
          hidePopupPlaylistSpinner();
          closePopupPlaylist();
        }, 600);

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
  const popupPlaylistContainer = document.querySelector(
    ".fmuzik-popup-playlist--main"
  );
  if (popupPlaylistContainer) {
    const buttonCreate = document.createElement("button");
    buttonCreate.id = "fmuzik-playlist-create-btn";
    buttonCreate.classList.add("fmuzik-form-btn");
    buttonCreate.innerText = "Tạo";
    buttonCreate.addEventListener("click", (e) => createNewPlaylist(fmuzik_id));
    popupPlaylistContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="fmuzik-playlist-save-to--container">
        <div class="fmuzik-row fmuzik-playlist-save-to--video-name">
          <div class="fmuzik-col fmuzik-form-group">
            <label class="fmuzik-form-label">Tên video này?<span class="text-danger">*</span>: </label>
            <input type="text" id="fmuzik-playlist-video-name" class="fmuzik-form-input" placeholder="Nhập tên gợi nhớ (< 150 kí tự)"
            list="fmuzik-playlist-video-name-suggest" autocomplete="off">
            <datalist id="fmuzik-playlist-video-name-suggest" role="listbox">
              <option value="content">
            </datalist>
          </div>
        </div>
        <div class="fmuzik-row fmuzik-playlist-save-to--top">
          <div class="fmuzik-col fmuzik-form-group">
            <label class="fmuzik-form-label">Chọn playlist để lưu video..</label>
          </div>
        </div>
        <div class="fmuzik-row fmuzik-playlist-save-to--main">
          <div class="fmuzik-col fmuzik-form-checkbox-group fmuzik-form-group">
          </div>
        </div>
        <div class="fmuzik-row fmuzik-playlist-save-to--bottom">
          <div class="fmuzik-col fmuzik-form-group">
            <label class="fmuzik-form-label">Tạo playlist: </label>
            <input type="text" id="fmuzik-playlist-create" class="fmuzik-form-input" placeholder="Nhập tên playlist (< 150 kí tự)">
          </div>
        </div>
      </div>
      `
    );
    document
      .querySelector(".fmuzik-playlist-save-to--bottom")
      .firstElementChild.insertAdjacentElement("beforeend", buttonCreate);

    //Setup suggestion of video name input
    setupPlaylistVideoNameSuggestion(fmuzik_id);
  }
}

/**
 * Play video
 * @link https://developers.facebook.com/docs/plugins/embedded-video-player/
 */
function playVideo(url, index) {
  currentIndexPlaylistVideo = index;

  const currentVideoElInList = document.querySelector(
    `[fmuzik_playlist_video_id="${index}"]`
  );
  const playListId =
    (currentVideoElInList
      ? currentVideoElInList.getAttribute("fmuzik_playlist_id")
      : "") ?? "";

  const newUrl = encodeURIComponent(url);
  const iframe = `<iframe id="fmuzik-player" 
    src="https://fpt.workplace.com/plugins/video.php?href=${newUrl}%2F&width=300&show-text=false&height=144&mute=0&autoplay=true&show-captions=false&appId" 
    width="300" height="144" 
    style="border:none;overflow:hidden" 
    scrolling="no" 
    frameborder="0" 
    allowfullscreen="true" 
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" 
    allowFullScreen="true" 
    data-show-captions="false" 
    data-show-text="false"
    data-fmuzik-playlist-id="${playListId}"
    data-fmuzik-playlist-video-id="${index}"
    data-fmuzik-playlist-video-url="${url}">
  </iframe>
  `;
  const playlistPanelPlayerMask = document.querySelector(
    ".fmuzik-playlist-panel--player-mask"
  );
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
function selectVideo(e, video, index, playlistId) {
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
      showAlert(MSG_TYPE.DANGER, MSG.DEL_VIDEO_PLAYLIST_ERROR);
      return setTimeout(() => {
        hideAlert();
      }, 1000);
    } else {
      const videoUrl = video.url;
      let hasDeleted = false;
      playlist.forEach((playlistElement, i) => {
        if (
          playlistElement.id == playlistId &&
          playlistElement.videos &&
          playlistElement.videos.length > 0 &&
          videoUrl &&
          getIndexOfVideo(playlistElement.videos, videoUrl) > -1
        ) {
          const indexOfUrl = getIndexOfVideo(playlistElement.videos, videoUrl);
          newPlaylist[i].videos.splice(indexOfUrl, 1);
          playlistItem = newPlaylist[i];
          hasDeleted = true;
          showAlert(
            MSG_TYPE.SUCCESS,
            "Xóa video khỏi playlist '" + playlistElement.name + "' thành công!"
          );
          setTimeout(() => {
            hideAlert();
          }, 1000);
        }
      });
      if (!hasDeleted) {
        showAlert(
          MSG_TYPE.DANGER,
          "Xóa video khỏi playlist '" + playlistElement.name + "' thất bại!"
        );
        setTimeout(() => {
          hideAlert();
        }, 1000);
      }
      playlist = newPlaylist;
      chrome.storage.sync.set({ playlist: newPlaylist });
      setTimeout(() => {
        // create list videos
        createListVideosElement(playlistItem);
        // if (playlistItem && playlistItem.length > 0) {
        // }
      }, 500);
    }
  });
}

/**
 * Delete playlist
 */
function deletePlaylist(e, playlistId, index) {
  e.preventDefault();
  // delete playlist
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];
    let playlists = [];

    if (!playlist || playlist.length == 0) {
      showAlert(MSG_TYPE.DANGER, MSG.DEL_PLAYLIST_ERROR);
      return setTimeout(() => {
        hideAlert();
      }, 1000);
    } else {
      playlists = playlist.filter((p, i) => p.id != playlistId);
      if (playlists.length != playlist.length) {
        showAlert(MSG_TYPE.SUCCESS, MSG.DEL_PLAYLIST_SUCCESS);
        setTimeout(() => {
          hideAlert();
        }, 1000);
      } else {
        showAlert(MSG_TYPE.DANGER, MSG.DEL_PLAYLIST_ERROR);
        return setTimeout(() => {
          hideAlert();
        }, 1000);
      }
      playlist = playlists;
      chrome.storage.sync.set({ playlist: playlists });
      // create list playlist
      createPlaylistItems();
    }
  });
}

/**
 * Create list videos
 * @param {{id: string, name: string, videos: [{name: string, url: string}]}} playlist
 */
function createListVideosElement(playlist) {
  currentIndexPlaylistVideo = -1;
  const listPlayer = document.querySelector(
    ".fmuzik-playlist-panel--list-player"
  );
  listPlayer.classList.add("fmuzik-playlist-panel--list-player-video");
  const videos =
    playlist.videos && playlist.videos.length > 0 ? playlist.videos : [];
  listPlayer.innerHTML = "";
  const label = document.querySelector(".fmuzik-playlist-panel--player-label");
  label.innerText = `Playlist ${playlist.name}:`;
  label.insertAdjacentElement("beforebegin", createControlsPlayerElement());
  if (videos.length > 0) {
    currentPlaylistPlayer = videos;
    currentPlaylistId = playlist.id;
    videos.forEach((element, index) => {
      const video = document.createElement("a");
      video.href = "javascript:void(0)";
      video.classList.add("fmuzik-playlist__item");
      video.setAttribute("fmuzik_playlist_id", playlist.id);
      video.setAttribute("fmuzik_playlist_video_id", index);
      video.setAttribute("fmuzik_playlist_video_url", element.url);
      video.setAttribute("fmuzik_playlist_video_name", element.name);
      video.innerHTML = `<span title="${element.name}">${element.name}</span>`;
      video.addEventListener("click", (e) =>
        selectVideo(e, element, index, playlist.id)
      );

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
      deleteBtnEl.setAttribute("title", "Xóa video này?");
      deleteBtnEl.addEventListener("click", (e) =>
        deleteVideo(e, playlist.id, element, index)
      );
      divTmp.appendChild(deleteBtnEl);
      // insert item to list
      listPlayer.appendChild(divTmp);
    });
  } else {
    currentPlaylistPlayer = [];
    currentPlaylistId = -1;
  }

  // Setup drag and drop playlist videos
  setupDragAndDropVideoList();
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
  const listPlayer = document.querySelector(
    ".fmuzik-playlist-panel--list-player"
  );
  listPlayer.classList.add("fmuzik-playlist-panel--player-not-demand");

  const listPlayerMask = document.querySelector(
    ".fmuzik-playlist-panel--player-mask"
  );
  listPlayerMask.classList.remove("d-none");
}
/**
 * Hide player mask
 */
function hidePlayerMask() {
  const listPlayer = document.querySelector(
    ".fmuzik-playlist-panel--list-player"
  );
  const listPlayerMask = document.querySelector(
    ".fmuzik-playlist-panel--player-mask"
  );

  listPlayer.classList.remove("fmuzik-playlist-panel--player-not-demand");
  listPlayerMask.classList.add("d-none");
}

/**
 * Create playlist items element
 */
function createPlaylistItems() {
  const listPlayer = document.querySelector(
    ".fmuzik-playlist-panel--list-player"
  );
  listPlayer.classList.remove("fmuzik-playlist-panel--list-player-video");
  const listPlayerMask = document.querySelector(
    ".fmuzik-playlist-panel--player-mask"
  );
  listPlayer.innerHTML = "";
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data.playlist && data.playlist.length > 0 ? data.playlist : [];

    const label = document.querySelector(
      ".fmuzik-playlist-panel--player-label"
    );
    label.innerText = "Danh sách playlist của bạn:";
    if (playlist.length > 0) {
      listPlayer.classList.remove("fmuzik-playlist-panel--player-not-demand");
      playlist.forEach((element, index) => {
        const playlistItem = document.createElement("a");
        playlistItem.href = "javascript:void(0)";
        playlistItem.classList.add("fmuzik-playlist__item");
        playlistItem.innerHTML = `<span title="${element.name}">${element.name}</span>`;
        playlistItem.addEventListener("click", (e) =>
          selectPlaylist(e, element)
        );

        const icon = document.createElement("i");
        icon.classList.add("fmuzik-playlist__item--icon", "gg-play-list");
        const spanTemp = document.createElement("div");
        spanTemp.appendChild(icon);
        playlistItem.insertAdjacentElement("afterbegin", spanTemp);

        const divTmp = document.createElement("div");
        divTmp.classList.add("fmuzik-playlist__item--wrap");
        divTmp.appendChild(playlistItem);

        const deleteBtnEl = document.createElement("button");
        deleteBtnEl.classList.add("fmuzik-playlist__item__delete-btn");
        deleteBtnEl.setAttribute("title", "Xóa playlist này?");
        deleteBtnEl.addEventListener("click", (e) =>
          deletePlaylist(e, element.id, index)
        );
        divTmp.appendChild(deleteBtnEl);
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

    const playlistPanelLock = document.createElement("div");
    playlistPanelLock.classList.add("fmuzik-playlist-panel--lock");
    playlistPanel.appendChild(playlistPanelLock);

    const playlistPanelContainer = document.createElement("div");
    playlistPanelContainer.classList.add("fmuzik-playlist-panel--container");
    playlistPanel.appendChild(playlistPanelContainer);

    const playlistPanelToggle = document.createElement("div");
    playlistPanelToggle.classList.add("fmuzik-playlist-panel--toggle");

    const buttonHidePlaylistPanel = document.createElement("button");
    buttonHidePlaylistPanel.classList.add("btn-hide");
    buttonHidePlaylistPanel.setAttribute("title", "Ẩn FMuzik");
    buttonHidePlaylistPanel.innerHTML = `<svg width="27px" height="27px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zm4 6h5V7l5 5-5 5v-4H7v-2z"/></svg>`;
    buttonHidePlaylistPanel.addEventListener("click", (e) =>
      togglePlaylistPanel(e, true)
    );
    playlistPanelToggle.appendChild(buttonHidePlaylistPanel);

    const buttonShowPlaylistPanel = document.createElement("button");
    buttonShowPlaylistPanel.classList.add("btn-show");
    buttonShowPlaylistPanel.setAttribute("title", "Hiện FMuzik");
    buttonShowPlaylistPanel.addEventListener("click", (e) =>
      togglePlaylistPanel(e, false)
    );
    playlistPanelToggle.appendChild(buttonShowPlaylistPanel);

    playlistPanel.appendChild(playlistPanelToggle);

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
    playlistPanelPlayer.classList.add(
      "fmuzik-playlist-panel--player",
      "fmuzik-playlist-panel--player-not-demand"
    );
    playlistPanelContainer.appendChild(playlistPanelPlayer);

    const playlistPanelPlayerLabel = document.createElement("div");
    playlistPanelPlayerLabel.classList.add(
      "fmuzik-playlist-panel--player-label"
    );
    playlistPanelPlayerLabel.innerText = "Danh sách playlist của bạn:";
    playlistPanelContainer.appendChild(playlistPanelPlayerLabel);

    const playlistPanelListPlayer = document.createElement("div");
    playlistPanelListPlayer.classList.add("fmuzik-playlist-panel--list-player");
    playlistPanelContainer.appendChild(playlistPanelListPlayer);

    const credit = document.createElement("div");
    credit.classList.add("row", "text-right", "text-muted", "fmuzik-credit");
    credit.innerHTML = `FMuzik by NhutTH4 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" xmlns:v="https://vecta.io/nano" style="position: relative;bottom: -4px;fill: #fff;"><path d="M10 22a8 8 0 1 1 0-16 8 8 0 1 1 0 16zm0-2a6 6 0 1 0 0-12 6 6 0 1 0 0 12zm3-5a3 3 0 1 1-6 0h6zm-5-2a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 1 1 0 2zm6.625-5c-.827-.18-3.375-1.59-3.375-4.125 0-1.036.839-1.875 1.875-1.875a1.87 1.87 0 0 1 1.5.75 1.87 1.87 0 0 1 1.5-.75C21.161 2 22 2.839 22 3.875 22 6.41 19.452 7.82 18.625 8z" fill-rule="evenodd"></path></svg>`;
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
function saveVideoToPlaylist(e, video) {
  const fmuzik_id = video.getAttribute("fmuzik_id");
  e.preventDefault();
  e.stopPropagation();

  showPopupPlaylistSpinner();
  showPopupPlaylist();
  createSaveToPlaylistElement(fmuzik_id);
  // prepare data
  const rowFmuzikPopupPlaylistMain = document.querySelector(
    ".fmuzik-playlist-save-to--main"
  );
  rowFmuzikPopupPlaylistMain.innerHTML = "";

  // const video = document.querySelector("video[fmuzik_id=" + fmuzik_id + "]");
  const videoUrl = video ? video.getAttribute("fmuzik_video_url") : "";

  // if videoUrl, try to refresh get videoUrl
  if (!videoUrl) {
    assignFMuzikId(video);
  }

  setTimeout(() => {
    chrome.storage.sync.get("playlist", (data) => {
      playlist = data && data.playlist ? data.playlist : [];

      if (!playlist || playlist.length == 0) {
        // add empty mask
        const maskEmpty = document.createElement("div");
        maskEmpty.classList.add("fmuzik-popup-playlist--empty");
        rowFmuzikPopupPlaylistMain.appendChild(maskEmpty);
      } else {
        setTimeout(() => {
          playlist.forEach((playlistElement, index) => {
            const playlistEl = document.createElement("div");
            playlistEl.classList.add(
              "fmuzik-col",
              "fmuzik-form-checkbox-group",
              "fmuzik-form-group"
            );

            const playlistCheckboxEl = document.createElement("input");
            playlistCheckboxEl.setAttribute("type", "checkbox");
            playlistCheckboxEl.id = playlistElement.id;
            playlistCheckboxEl.setAttribute(
              "fmuzik_playlist_id",
              playlistElement.id
            );
            playlistCheckboxEl.classList.add("fmuzik-form-checkbox-input");

            if (
              playlistElement.videos &&
              playlistElement.videos.length > 0 &&
              videoUrl &&
              getIndexOfVideo(playlistElement.videos, videoUrl) > -1
            ) {
              playlistCheckboxEl.setAttribute("checked", "true");
            }

            playlistCheckboxEl.addEventListener("change", (e) =>
              saveVideoToPlaylistWithCheckbox(e, videoUrl, index)
            );

            playlistEl.appendChild(playlistCheckboxEl);

            const playlistCheckboxLabelEl = document.createElement("label");
            playlistCheckboxLabelEl.classList.add("fmuzik-form-checkbox-label");
            playlistCheckboxLabelEl.innerText = playlistElement.name;
            playlistCheckboxLabelEl.setAttribute("for", playlistElement.id);

            playlistEl.appendChild(playlistCheckboxLabelEl);

            rowFmuzikPopupPlaylistMain.appendChild(playlistEl);
          });
        }, 500);
      }
      setTimeout(() => {
        hidePopupPlaylistSpinner();
      }, 500);
    });
  }, 600);
}

/**
 * Setup save to playlist
 */
function setupSaveToPlaylist(video) {
  const buttonSaveToPlaylist = video
    .closest("[data-visualcompletion=ignore]")
    ?.querySelector(".fmuzik__save-to-playlist--btn");
  const buttonSaveToPlaylistInMediaViewerMode = document.querySelector(
    "[data-name=media-viewer-nav-container]"
  );
  if (activePlaylist && !buttonSaveToPlaylist) {
    // add button save to playlist on top video
    const newButtonSaveToPlaylist = document.createElement("button");
    newButtonSaveToPlaylist.classList.add("fmuzik__save-to-playlist--btn");
    newButtonSaveToPlaylist.addEventListener("click", (e) =>
      saveVideoToPlaylist(e, video)
    );

    // insert button on top of video
    if (buttonSaveToPlaylistInMediaViewerMode) {
      newButtonSaveToPlaylist.classList.add(
        "fmuzik__save-to-playlist--btn__viewer-mode"
      );
      buttonSaveToPlaylistInMediaViewerMode.insertAdjacentElement(
        "afterbegin",
        newButtonSaveToPlaylist
      );
    } else {
      if (
        document.querySelector("[data-pagelet=TahoeVideo]") ||
        document.querySelector("[data-name=media-viewer-nav-container]")
      ) {
        newButtonSaveToPlaylist.classList.add(
          "fmuzik__save-to-playlist--btn__viewer-mode"
        );
      }
      if (
        document.querySelector("[data-name=media-viewer-nav-container]") &&
        !document.querySelector("[data-pagelet=TahoeVideo]")
      ) {
        // Mode viewer
        document
          .querySelector("[data-name=media-viewer-nav-container]")
          .querySelector("[data-instancekey] [data-visualcompletion=ignore]")
          .insertAdjacentElement("afterbegin", newButtonSaveToPlaylist);
      } else {
        video
          .closest("[data-visualcompletion=ignore]")
          ?.querySelector("[data-instancekey] [data-visualcompletion=ignore]")
          .insertAdjacentElement("afterbegin", newButtonSaveToPlaylist);
      }
    }
  } else if (!activePlaylist) {
    // remove button save to playlist on top video
    if (buttonSaveToPlaylist) {
      buttonSaveToPlaylist.remove();
    } else if (buttonSaveToPlaylistInMediaViewerMode) {
      const buttonInMediaViewerMode =
        buttonSaveToPlaylistInMediaViewerMode.querySelector(
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
  const geminiLayoutEntity = document.querySelector(
    "[data-pagelet=GeminiLayoutEntity]"
  );
  const feed = geminiLayoutEntity
    ? geminiLayoutEntity.querySelector("[role=feed]")
    : null;

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
    videos = document
      .querySelector("[data-pagelet=TahoeVideo]")
      .querySelectorAll("video");
  } else if (geminiLayoutEntity && searchMode) {
    // Search mode
    const geminiLayoutEntityTmp = document.querySelectorAll(
      "[data-pagelet=GeminiLayoutEntity]"
    );
    if (geminiLayoutEntityTmp.length == 2) {
      // After enter search action
      videos = geminiLayoutEntityTmp[1].querySelectorAll("video");
    } else {
      videos = geminiLayoutEntity.querySelectorAll("video");
    }
  } else {
    const geminiLayoutEntityTmp = document.querySelectorAll(
      "[data-pagelet=GeminiLayoutEntity]"
    );
    let roleArticle = null;
    if (feed && geminiLayoutEntityTmp && geminiLayoutEntityTmp.length == 2) {
      roleArticle = geminiLayoutEntityTmp[1]
        .querySelector("[role=main]")
        ?.querySelector("[role=article]");
    } else if (
      !feed &&
      geminiLayoutEntityTmp &&
      geminiLayoutEntityTmp.length == 1
    ) {
      roleArticle = geminiLayoutEntityTmp[0]
        .querySelector("[role=main]")
        ?.querySelector("[role=article]");
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
 * Format link video
 * @param {string} link
 * @returns
 */
function formatLinkVideo(link) {
  let result = link;

  // https://fpt.workplace.com/100013058827938/videos/1110217093266592/?idorvanity=983546785133426
  // => https://fpt.workplace.com/100013058827938/videos/1110217093266592
  result = result.replace(/\/\?[a-zA-Z]+\=.+$/g, "");

  // https://fpt.workplace.com/100013058827938/videos/1110217093266592/
  // => https://fpt.workplace.com/100013058827938/videos/1110217093266592
  if (result[result.length - 1] == "/") {
    result = result.substring(0, result.length - 1);
  }

  return result;
}

/**
 * setupDragAndDropVideoList
 * @description Setup drag and drop playlist videos to re-order or sort the list
 * @link https://codepen.io/artemveremienko/details/BajdoJO
 */
function setupDragAndDropVideoList() {
  const tasksListElement = document.querySelector(
    ".fmuzik-playlist-panel--list-player.fmuzik-playlist-panel--list-player-video"
  );
  const taskElements = tasksListElement?.querySelectorAll(
    ".fmuzik-playlist__item--wrap"
  );

  if (taskElements) {
    for (const task of taskElements) task.draggable = true;

    tasksListElement.addEventListener("dragstart", (evt) => {
      if (evt.target.classList.contains("fmuzik-playlist__item--wrap")) {
        evt.target.classList.add("fmuzik-playlist__item--wrap__selected");
      } else {
        const itemWrapTmp = evt.target.closest(".fmuzik-playlist__item--wrap");
        if (itemWrapTmp) {
          itemWrapTmp.classList.add("fmuzik-playlist__item--wrap__selected");
        }
      }
    });

    tasksListElement.addEventListener("dragend", (evt) => {
      if (evt.target.classList.contains("fmuzik-playlist__item--wrap")) {
        evt.target.classList.remove("fmuzik-playlist__item--wrap__selected");
      } else {
        const itemWrapTmp = evt.target.closest(".fmuzik-playlist__item--wrap");
        if (itemWrapTmp) {
          itemWrapTmp.classList.remove("fmuzik-playlist__item--wrap__selected");
        }
      }
    });

    tasksListElement.addEventListener("dragover", (evt) => {
      evt.preventDefault();

      const activeElement = tasksListElement.querySelector(
        ".fmuzik-playlist__item--wrap__selected"
      );
      let currentElement = evt.target;
      if (!currentElement.classList.contains("fmuzik-playlist__item--wrap")) {
        const itemWrapTmp = evt.target.closest(".fmuzik-playlist__item--wrap");
        if (itemWrapTmp) {
          currentElement = itemWrapTmp;
        } else {
          log("Opps! Sth wrong when handle dragover");
        }
      }

      const isMoveable =
        activeElement !== currentElement &&
        currentElement.classList.contains("fmuzik-playlist__item--wrap");

      if (!isMoveable) return;

      const nextElement = getNextElement(evt.clientY, currentElement);

      if (
        (nextElement && activeElement === nextElement.previousElementSibling) ||
        activeElement === nextElement
      ) {
        return;
      }

      tasksListElement.insertBefore(activeElement, nextElement);
      // Re-order playlist videos
      reorderPlaylistVideos();
    });
  }
}

/**
 * getNextElement
 * @param {*} cursorPosition
 * @param {*} currentElement
 * @returns {HTMLElement} nextElement
 * @link https://codepen.io/artemveremienko/details/BajdoJO
 */
function getNextElement(cursorPosition, currentElement) {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter =
    currentElementCoord.y + currentElementCoord.height / 2;

  const nextElement =
    cursorPosition < currentElementCenter
      ? currentElement
      : currentElement.nextElementSibling;

  return nextElement;
}

/**
 * reorderPlaylistVideos
 * @description Re-order playlist videos after order by drag video of list
 */
function reorderPlaylistVideos() {
  // 1. get current video HTMLElement list
  const listPlayerVideoEl = document.querySelector(
    ".fmuzik-playlist-panel--list-player.fmuzik-playlist-panel--list-player-video"
  );
  const videoItemWrapElArr = listPlayerVideoEl.querySelectorAll(
    ".fmuzik-playlist__item--wrap"
  );
  if (!videoItemWrapElArr || videoItemWrapElArr.length <= 1) {
    return;
  }
  const newPlaylistPlayer = [];
  const fmuzilPlayerEl = document.getElementById("fmuzik-player");

  let currentPlaylistOrderedId = "";

  for (let index = 0; index < videoItemWrapElArr.length; index++) {
    const videoItemWrapEl = videoItemWrapElArr[index];
    const videoItemEl = videoItemWrapEl.querySelector(".fmuzik-playlist__item");
    const videoItem = {
      name: videoItemEl.getAttribute("fmuzik_playlist_video_name"),
      url: videoItemEl.getAttribute("fmuzik_playlist_video_url"),
    };
    // 2. update position of currentPlaylistPlayer
    videoItemEl.setAttribute("fmuzik_playlist_video_id", index);

    if (
      currentIndexPlaylistVideo !== -1 &&
      videoItemEl.getAttribute("fmuzik_playlist_id") ==
        fmuzilPlayerEl.dataset.fmuzikPlaylistId
    ) {
      if (
        videoItemEl.getAttribute("fmuzik_playlist_video_url") ==
        fmuzilPlayerEl.dataset.fmuzikPlaylistVideoUrl
      ) {
        if (
          videoItemEl.getAttribute("fmuzik_playlist_video_id") ===
          fmuzilPlayerEl.dataset.fmuzikPlaylistVideoId
        ) {
          // detect action re-order nothing changes then return(stop)
          // return;
        } else {
          // 3. update currentIndexPlaylistVideo
          fmuzilPlayerEl.dataset.fmuzikPlaylistVideoId = index;
          currentIndexPlaylistVideo = index;
        }
      }
    }

    if (!currentPlaylistOrderedId) {
      currentPlaylistOrderedId = videoItemEl.getAttribute("fmuzik_playlist_id");
    }

    newPlaylistPlayer.push(videoItem);
  }

  currentPlaylistPlayer = newPlaylistPlayer;

  // 4. save currentPlaylistPlayer to storage
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];

    if (!playlist || playlist.length == 0) {
      showAlert(MSG_TYPE.DANGER, MSG.REORDER_PLAYLIST_VIDEO_ERROR_ON_SAVE);
      return setTimeout(() => {
        hideAlert();
      }, 1000);
    } else {
      const indexOfCurrentPlaylistOrdered = playlist.findIndex(
        (item) => item.id == currentPlaylistOrderedId
      );
      if (indexOfCurrentPlaylistOrdered > -1) {
        playlist[indexOfCurrentPlaylistOrdered].videos = newPlaylistPlayer;

        chrome.storage.sync.set({ playlist: playlist });
        log("save reorder success!");
      }
    }
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
    popupPlaylistSpinner.classList.add(
      "fmuzik-popup-playlist--spinner-container",
      "d-none"
    );
    const popupPlaylistSpinnerMain = document.createElement("div");
    popupPlaylistSpinnerMain.classList.add("fmuzik-popup-playlist--spinner");
    popupPlaylistSpinner.appendChild(popupPlaylistSpinnerMain);
    popupPlaylistContainer.appendChild(popupPlaylistSpinner);

    const popupPlaylistCloseXBtn = document.createElement("button");
    popupPlaylistCloseXBtn.classList.add("fmuzik-popup-playlist--close-x");
    popupPlaylistCloseXBtn.innerText = "x";
    popupPlaylistCloseXBtn.title = "Close?";
    popupPlaylistCloseXBtn.addEventListener("click", (e) =>
      closePopupPlaylist()
    );
    popupPlaylistContainer.appendChild(popupPlaylistCloseXBtn);

    const rowFmuzikPopupPlaylistMain = document.createElement("div");
    rowFmuzikPopupPlaylistMain.classList.add("fmuzik-popup-playlist--main");
    popupPlaylistContainer.appendChild(rowFmuzikPopupPlaylistMain);

    popupPlaylist.appendChild(popupPlaylistContainer);
    document
      .querySelector("body")
      .insertAdjacentElement("afterbegin", popupPlaylist);

    // createSaveToPlaylistElement();

    popupPlaylist.classList.add("d-none");
  } else {
  }
}

/**
 *
 * @param {Event} e
 * @param {boolean} isHidden
 */
function togglePlaylistPanel(e, isHidden) {
  if (isHidden) {
    playlistPanel.classList.add("hidden");
  } else {
    playlistPanel.classList.remove("hidden");
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
        if (
          (!statusInit && checkStartCondition()) ||
          (oldHref != document.location.href && checkStartCondition())
        ) {
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
          // Setup playlist panel
          createPlaylistPanelElement();
          // Setup popup playlist
          setupPopupPlaylist();
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
        if (
          statusInit &&
          oldHref == document.location.href &&
          checkStartCondition()
        ) {
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
