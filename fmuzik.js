const fptWorkplace = "https://fpt.workplace.com";

let oldHref = "";

let activeFMuzik = false;
let activePlaylist = false;
let enableLoopVideo = false;
let fmuzikEverywhere = false;
let workplaceUrls = [];
let playlist = [
  {
    id: "",
    name: "",
    videos: [{ name: "", url: "", articleUrl: "", id: "" }],
  },
];
playlist = [];
// Fake interface
let playlistI = {
  id: "",
  name: "",
  videos: [{ name: "", url: "", articleUrl: "", id: "" }],
};
playlistI = null;
let videoI = {
  name: "",
  url: "",
  articleUrl: "",
  id: "",
};
videoI = null;
// example:
// {id: string, name: string, videos: [{name: string, url: string, articleUrl: string, id: string}]}
// [
//   {
//     id: "p12345",
//     name: "FMuzik P Name PQO",
//     videos: [
//       {
//         name: "Video A",
//         url: 'http://...',
//         articleUrl: 'http://...',
//         id: 'v54321',
//       }
//     ]
//   }
// ]
let currentDataPlaylistSharing = {
  id: "",
  name: "",
  videos: [
    {
      videoName: "",
      videoUrl: "",
      isSaveThis: false,
      id: "",
    },
  ],
};

let statusInit = false;

let popupPlaylist = document.querySelector(".fmuzik-popup-playlist");
let playlistPanel = document.querySelector(".fmuzik-playlist-panel");
let popupPlaylistSpinner = document.querySelector(
  ".fmuzik-popup-playlist--spinner"
);

const MSG_TYPE = {
  DANGER: "danger",
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
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

const CLASS_NAME = {
  BUTTON_ACTIVE: "fmuzik-playlist__btn-active",
  BUTTON_EDIT_NAME: "fmuzik-playlist__item__edit-name-btn",
  PANEL_CONTROLS: "fmuzik-playlist__controls",
  BUTTON_VIDEO_NEXT: "fmuzik-playlist__controls--next",
  BUTTON_VIDEO_BACK: "fmuzik-playlist__controls--prev",
  BUTTON_VIDEO_REPEAT: "fmuzik-playlist__controls--loop-video-once",
  BUTTON_VIDEO_REPEAT_ACTIVE:
    "fmuzik-playlist__controls--loop-video-once__active",
  BUTTON_VIDEO_SHUFFLE: "fmuzik-playlist__controls--shuffle-video",
  BUTTON_VIDEO_SHUFFLE_ACTIVE:
    "fmuzik-playlist__controls--shuffle-video__active",
  BUTTON_VIDEOS_BACK_TO_PLAYLISTS: "fmuzik-playlist__controls--back",
  PANEL_LIST_PLAYER: "fmuzik-playlist-panel--list-player",
  PANEL_LIST_PLAYER_VIDEO: "fmuzik-playlist-panel--list-player-video",
  BUTTON_SAVE_TO_PLAYLIST: "fmuzik__save-to-playlist--btn",
  LIST_ITEM_WRAP: "fmuzik-playlist__item--wrap",
  LIST_ITEM: "fmuzik-playlist__item",
};

const ATTRIBUTE_NAME = {
  VIDEO_NAME: "fmuzik_playlist_video_name",
  VIDEO_URL: "fmuzik_playlist_video_url",
  VIDEO_INDEX_IN_LIST: "fmuzik_playlist_video_index",
  VIDEO_ARTICLE: "fmuzik_video_article_url",
  PLAYLIST_ID: "fmuzik_playlist_id",
  FMUZIK_ID: "fmuzik_id",
  FMUZIK_VIDEO_URL: "fmuzik_video_url",
  FMUZIK_VIDEO_ID: "fmuzik_video_id",
};

const FMUZIK_TEXT = {
  SHARE: "SHARE",
  EDIT: "EDIT",
  FMUZIK_PLAYLIST_SHARING_HREF_KEYWORD: "fmuzikplaylistsharing.com",
  FMUZIK_PLAYLIST_SHARING_END_FLAG: "fmuzikplaylistsharingend",
  FMUZIK_PLAYLIST_SHARING_SPLIT_STR: "[[||]]",
};

let currentPlaylistPlayer = [];
let currentPlaylistId = -1;
let currentIndexPlaylistVideo = -1;
let isLoopPlaylistVideoOnce = false;
let favoriteVolume = 1;
let currentVideoPlayingId = "";
let isRatedToFMuzik = false;
let isKattyActive = false;
let isAskRatingShowing = false;

const modeDev = () => {
  return !("update_url" in chrome.runtime.getManifest());
};

//#region declear function

/**
 * Log to console in development
 * @param {*} content
 * @param {*} data
 */
function log(content, data = null) {
  if (modeDev) {
    if (data === null) {
      console.log(content);
    } else {
      console.log(`${content} `, data);
    }
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
  setTimeout(() => {
    popupPlaylistSpinner.classList.add("d-none");
  }, 600);
}

/**
 * Function show alert
 */
function showAlert(kind, msg, timeAutoHide = 0) {
  const alert = document.querySelector(".fmuzik-alert");
  alert.classList.add("fmuzik-alert-" + kind);
  alert.innerText = msg;
  if (timeAutoHide !== 0) {
    setTimeout(() => {
      hideAlert();
    }, timeAutoHide);
  }
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

/**
 * escapeRegExp
 * @param {*} string
 * @returns
 */
function escapeRegExp(string) {
  return string.replace(/\"/g, "&#34;"); // $& means the whole matched string
}

let oldNumOfVideos = 0;
let oldUrl = "";
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

function createVideoId() {
  const newId =
    "v" +
    (Math.floor(Math.random() * 100000) + 2) +
    (Math.floor(Math.random() * 100000) + 1);
  return newId;
}

function createPlaylistId() {
  const newPlaylistId =
    "p" +
    (Math.floor(Math.random() * 100000) + 1) +
    (Math.floor(Math.random() * 100000) + 2);
  return newPlaylistId;
}

/**
 * Assign FMuzik id to video
 */
function assignFMuzikId(video) {
  if (!video.getAttribute(ATTRIBUTE_NAME.FMUZIK_ID)) {
    const newId = createVideoId();
    video.setAttribute(ATTRIBUTE_NAME.FMUZIK_ID, newId);

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

          video.setAttribute(
            ATTRIBUTE_NAME.FMUZIK_VIDEO_URL,
            location.origin + pathname
          );
          log(video);
          contents = getContentsOfPostByVideoEl(video);
          saveContentsToVideo(video, contents);
        }
      }
    }
  } else {
    if (
      video.getAttribute(ATTRIBUTE_NAME.FMUZIK_ID) &&
      !video.getAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_URL)
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

        video.setAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_URL, link);
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
          video.setAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_URL, link);
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

            video.setAttribute(
              ATTRIBUTE_NAME.FMUZIK_VIDEO_URL,
              location.origin + pathname
            );
            log(video);
            contents = getContentsOfPostByVideoEl(video);
            saveContentsToVideo(video, contents);
          }
        } //else if () {
        // Try to find video url in single post(whent click to view a post from feeds)
        // ex: group -> go to a post detail by click publish time 7 July, 2023 -> https://fpt.workplace.com/groups/muzikinmymind/posts/2611151419039613
        //   link = video
        // .closest("[role=article][aria-posinset=1]")
        // ?.querySelector('a[href^="' + fptWorkplace + '"][role=link]');
        // }
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
    let prevSibling = parentHasId.previousElementSibling;
    let prevSiblingAttrDir = prevSibling?.getAttribute("dir");

    if (!prevSiblingAttrDir) {
      // Try to check if only have blockquote first
      if (prevSibling && prevSibling.tagName.toLowerCase() == "blockquote") {
        prevSibling = prevSibling?.firstElementChild;
        prevSiblingAttrDir = prevSibling?.getAttribute("dir");
      }
      if (!prevSiblingAttrDir && prevSibling) {
        // Try get prev sibling other (section new/latest posts on top of group)
        // Or post have translationable
        prevSibling =
          parentHasId.closest("div").firstElementChild.firstElementChild;
        prevSiblingAttrDir = prevSibling?.getAttribute("dir");
        // Try to get content
        if (!prevSiblingAttrDir) {
          prevSibling =
            parentHasId.parentElement.firstElementChild.querySelector("[dir]");
          prevSiblingAttrDir = prevSibling?.getAttribute("dir");
        }
      }
    }

    if (prevSibling && prevSiblingAttrDir && prevSiblingAttrDir == "auto") {
      log(prevSibling);
      const prevSiblingSpanElArr = prevSibling.querySelectorAll(
        "span, div[dir=auto], span[dir=auto]"
      );
      const prevSiblingContentArr = [];
      if (prevSiblingSpanElArr && prevSiblingSpanElArr.length > 0) {
        prevSiblingSpanElArr.forEach((text) => {
          if (text?.innerText) {
            if (
              (text.tagName.toLowerCase() == "span" &&
                !(
                  text?.firstElementChild?.getAttribute("role") === "button"
                )) ||
              (text.tagName.toLowerCase() == "div" &&
                text.childElementCount == 0 &&
                text.getAttribute("role") !== "button")
            ) {
              if (text.innerText.match("\n")) {
                // 'Abbey Road (Album) - The Beatles\n#NhacAuMy'
                prevSiblingContentArr.push(...text.innerText.split("\n"));
              } else {
                prevSiblingContentArr.push(text.innerText);
              }
            }
          }
        });
      }
      log(prevSiblingContentArr);
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
      // prevSiblingContentArr.shift();
      // remove duplicate
      // =>
      // 0: "#nhachoa"
      // 1: "Ngoan hồn"
      // 2: "Tin"
      // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
      let newPrevSiblingContentArr = [...new Set(prevSiblingContentArr)];
      // remove junk content
      if (newPrevSiblingContentArr && newPrevSiblingContentArr.length > 0) {
        newPrevSiblingContentArr = newPrevSiblingContentArr.filter(
          (v) => !v.match(/(^\s*[\.·_-]+\s*$)|(^\s+$)/g)
        );
        newPrevSiblingContentArr.sort((a, b) => {
          if (a.match(/^\#/g)) {
            return 1;
          } else {
            return -1;
          }
          return 0;
        });
      }
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
  const playlistId = e.target.getAttribute(ATTRIBUTE_NAME.PLAYLIST_ID);
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
              hidePopupPlaylistSpinner();
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
              hidePopupPlaylistSpinner();
              setTimeout(() => {
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
              hidePopupPlaylistSpinner();
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
      const newPlaylistId = createPlaylistId();

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
              url: video.getAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_URL),
              name: inputVideoName.value,
              articleUrl: video.getAttribute(ATTRIBUTE_NAME.VIDEO_ARTICLE),
              id: fmuzik_id,
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

        hidePopupPlaylistSpinner();
        setTimeout(() => {
          closePopupPlaylist();
        }, 600);

        return setTimeout(() => {
          hideAlert();
        }, 1000);
      }
    });
  }
  hidePopupPlaylistSpinner();
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
    buttonCreate.innerText = "Tạo Playlist";
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
            <label class="fmuzik-form-label">Tên Playlist </label>
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
function playVideo(videoPlaying, index) {
  currentIndexPlaylistVideo = parseInt(index);

  const currentVideoElInList = document.querySelector(
    `[${ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST}="${index}"]`
  );
  const playListId =
    (currentVideoElInList
      ? currentVideoElInList.getAttribute(ATTRIBUTE_NAME.PLAYLIST_ID)
      : "") ?? "";

  const newUrl = encodeURIComponent(videoPlaying.url);
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
    data-fmuzik-playlist-video-url="${videoPlaying.url}">
  </iframe>
  `;
  const playlistPanelPlayerMask = document.querySelector(
    ".fmuzik-playlist-panel--player-mask"
  );
  playlistPanelPlayerMask.classList.add("fmuzik-playlist-panel--player-mask");
  playlistPanelPlayerMask.innerHTML = "";
  playlistPanelPlayerMask.insertAdjacentHTML("afterbegin", iframe);
  const player = document.querySelector("#fmuzik-player");

  setTimeout(() => {
    player.addEventListener("load", (e) => {
      const video = player.contentWindow.document.body.querySelector("video");
      // unmuted
      video.muted = false;
      video.volume = favoriteVolume;
      video.play();
      video.oncanplay = function () {
        log("video.oncanplay");
        video.defaultMuted = false;
        video.removeAttribute("muted");
        video.volume = favoriteVolume;
      };

      video.addEventListener("volumechange", (e) => {
        if (video.muted === true) {
          favoriteVolume = 0;
        } else {
          favoriteVolume =
            typeof parseFloat(video.volume) == "number"
              ? parseFloat(video.volume)
              : 1;
        }
        log(`volume changed: ${favoriteVolume}`);
        chrome.storage.sync.set({ favoriteVolume: favoriteVolume });
      });

      // Hide subtitle
      if (
        video.nextSibling &&
        video.nextSibling.firstElementChild &&
        video.nextSibling.firstElementChild.tagName.toLowerCase() == "span"
      ) {
        video.nextSibling.classList.add("d-none");
      }

      video.addEventListener("ended", (e) => {
        if (isLoopPlaylistVideoOnce) {
          // Loop video
          video.play();
        } else {
          // next video
          nextVideo(e);
        }

        setTimeout(() => {
          log("isRatedToFMuzik: ", isRatedToFMuzik);
          if (!isRatedToFMuzik) {
            const unlucky = Math.round(Math.random() * 4);
            // In Vietnamese, 4 is lost : )
            log("unlucky: ", unlucky);
            if (unlucky === 4 && !isAskRatingShowing) {
              setupAskRating();
            }
          }
        }, 500);
      });
    });

    // Update icon playing on item
    updateIconPlayingOnItem(currentIndexPlaylistVideo);
    currentVideoPlayingId = videoPlaying.id;
  }, 50);
}

/**
 * Select video
 */
function selectVideo(e, video, index, playlistId) {
  e.preventDefault();
  // play video
  playVideo(video, index);
}

/**
 * Back from list video to playlist
 */
function backToPlaylist(e) {
  e.preventDefault();
  createPlaylistItems();
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
  playVideo(nextVideoItem, nextVideo);
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
  playVideo(nextVideoItem, nextVideo);
}

/**
 * Create controls player
 * @param {string} playlistId
 */
function createControlsPlayerElement(playlistId) {
  if (document.querySelector(`.${CLASS_NAME.PANEL_CONTROLS}`)) {
    document.querySelector(`.${CLASS_NAME.PANEL_CONTROLS}`).remove();
  }
  const controls = document.createElement("div");
  controls.classList.add(CLASS_NAME.PANEL_CONTROLS);

  // Back list video of playlist to list of playlist
  const backToPlaylistBtn = document.createElement("button");
  backToPlaylistBtn.classList.add(CLASS_NAME.BUTTON_VIDEOS_BACK_TO_PLAYLISTS);
  backToPlaylistBtn.innerHTML = `
    <i class="gg-arrow-left-o"></i>
  `;
  backToPlaylistBtn.addEventListener("click", (e) => backToPlaylist(e));

  // Previous to a video in current playlist
  const prevBtn = document.createElement("button");
  prevBtn.classList.add(CLASS_NAME.BUTTON_VIDEO_BACK);
  prevBtn.innerHTML = `
    <i class="gg-play-track-prev-o"></i>
  `;
  prevBtn.addEventListener("click", (e) => prevVideo(e));

  // Next to a video in current playlist
  const nextBtn = document.createElement("button");
  nextBtn.classList.add(CLASS_NAME.BUTTON_VIDEO_NEXT);
  nextBtn.innerHTML = `
    <i class="gg-play-track-next-o"></i>
  `;
  nextBtn.addEventListener("click", (e) => nextVideo(e));

  const shuffleVideosBtn = document.createElement("button");
  shuffleVideosBtn.classList.add(CLASS_NAME.BUTTON_VIDEO_SHUFFLE);
  shuffleVideosBtn.title = "Trộn video";
  shuffleVideosBtn.addEventListener("click", (e) => {
    log("Shuffle videos clicked");
    shuffleVideosBtn.classList.add(CLASS_NAME.BUTTON_VIDEO_SHUFFLE_ACTIVE);
    shuffleVideos(playlistId);
  });

  // Loop current video in current playlist
  const loopPlaylistVideoOnceBtn = document.createElement("button");
  loopPlaylistVideoOnceBtn.classList.add(CLASS_NAME.BUTTON_VIDEO_REPEAT);
  loopPlaylistVideoOnceBtn.title = "Repeat one";
  if (isLoopPlaylistVideoOnce) {
    loopPlaylistVideoOnceBtn.classList.add(
      CLASS_NAME.BUTTON_VIDEO_REPEAT_ACTIVE
    );
  }
  loopPlaylistVideoOnceBtn.innerHTML = `
    <svg height="28" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg"><g id="_08" data-name="08"><path d="m22 12a10 10 0 1 0 -16.76 7.37 1 1 0 0 0 .67.26 1 1 0 0 0 .74-.32 1 1 0 0 0 -.06-1.42 8 8 0 1 1 12.41-1.99l-.88-.59-.27 4.18 3.76-1.85-.98-.64a10 10 0 0 0 1.37-5z"/><path d="m14 19h-1v-11a1 1 0 0 0 -1.45-.89l-2 1a1 1 0 1 0 .9 1.78l.55-.27v9.38h-1a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2z"/></g></svg>
  `;
  loopPlaylistVideoOnceBtn.addEventListener("click", (e) =>
    loopPlaylistVideo(e)
  );

  // Add controls to UI
  controls.appendChild(backToPlaylistBtn);
  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(shuffleVideosBtn);
  controls.appendChild(loopPlaylistVideoOnceBtn);

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
      chrome.storage.sync.set({ playlist: newPlaylist }).then(() => {
        setTimeout(() => {
          // create list videos
          createListVideosElement(playlistItem);
          // if (playlistItem && playlistItem.length > 0) {
          // }
        }, 500);
      });
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
 * loopPlaylistVideo
 * @description Toggle loop current playlist video playing
 */
function loopPlaylistVideo(e) {
  isLoopPlaylistVideoOnce = !isLoopPlaylistVideoOnce;
  const loopPlaylistVideoOnceBtnEl = document.querySelector(
    `.${CLASS_NAME.BUTTON_VIDEO_REPEAT}`
  );
  if (!loopPlaylistVideoOnceBtnEl) {
    return;
  }
  if (isLoopPlaylistVideoOnce) {
    loopPlaylistVideoOnceBtnEl.classList.add(
      CLASS_NAME.BUTTON_VIDEO_REPEAT_ACTIVE
    );
  } else {
    loopPlaylistVideoOnceBtnEl.classList.remove(
      CLASS_NAME.BUTTON_VIDEO_REPEAT_ACTIVE
    );
  }
}

/**
 * Create list videos
 * @param {playlistI} playlist
 */
function createListVideosElement(playlistInput) {
  currentIndexPlaylistVideo = -1;
  const listPlayer = document.querySelector(`.${CLASS_NAME.PANEL_LIST_PLAYER}`);
  listPlayer.classList.add(CLASS_NAME.PANEL_LIST_PLAYER_VIDEO);
  const videos =
    playlistInput.videos && playlistInput.videos.length > 0
      ? playlistInput.videos
      : [];
  listPlayer.innerHTML = "";
  const label = document.querySelector(".fmuzik-playlist-panel--player-label");
  label.setAttribute("title", playlistInput.name);
  label.innerHTML = `Playlist <span>${playlistInput.name}</span>:`;
  label.insertAdjacentElement(
    "beforebegin",
    createControlsPlayerElement(playlistInput.id)
  );
  if (videos.length > 0) {
    currentPlaylistPlayer = videos;
    currentPlaylistId = playlistInput.id;
    videos.forEach((element, index) => {
      const video = document.createElement("a");
      video.href = "javascript:void(0)";
      video.classList.add(CLASS_NAME.LIST_ITEM);
      video.setAttribute(ATTRIBUTE_NAME.PLAYLIST_ID, currentPlaylistId);
      video.setAttribute(ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST, index);
      video.setAttribute(ATTRIBUTE_NAME.VIDEO_URL, element.url);
      video.setAttribute(ATTRIBUTE_NAME.VIDEO_NAME, element.name);
      video.setAttribute(
        "fmuzik_playlist_video_article_url",
        element.articleUrl
      );
      video.innerHTML = `<span class="fmuzik-playlist__item--name" title="${escapeRegExp(
        element.name
      )}">${element.name}</span>`;

      const icon = document.createElement("i");
      icon.classList.add("fmuzik-playlist__item--icon", "gg-play-button-o");
      const iconsWrapElTemp = document.createElement("div");
      iconsWrapElTemp.classList.add("fmuzik-playlist__item--icons-wrap");
      iconsWrapElTemp.appendChild(icon);
      video.insertAdjacentElement("afterbegin", iconsWrapElTemp);

      const divTmp = document.createElement("div");
      divTmp.classList.add(CLASS_NAME.LIST_ITEM_WRAP);

      let timeOutTmp = 0;
      if (!element?.id) {
        // Create new video id
        const newId = createVideoId();
        element.id = newId;
        videos[index].id = newId;
        // Save current list video to store
        saveDataCurrentPlaylist(currentPlaylistId, videos);
        timeOutTmp = 300;
      }

      video.addEventListener("click", (e) =>
        selectVideo(
          e,
          element,
          video.getAttribute(ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST),
          currentPlaylistId
        )
      );

      // delay saveDataCurrentPlaylist if not exist id
      setTimeout(() => {
        divTmp.setAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_ID, element.id);
        divTmp.setAttribute(ATTRIBUTE_NAME.PLAYLIST_ID, playlistInput.id);
        video.setAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_ID, element.id);
        divTmp.classList.add("fmuzik-playlist__videos--wrap");

        // const toolBoxEl = makeToolBoxElement(false);
        // toolBoxEl.classList.add("fmuzik-playlist__item__tool-box--video");

        // divTmp.appendChild(toolBoxEl);
        divTmp.appendChild(video);

        const moreOptions = document.createElement("div");
        moreOptions.classList.add("fmuzik-playlist__item__more-options");

        const moreOptionsIcon = document.createElement("div");
        moreOptionsIcon.classList.add(
          "fmuzik-playlist__item__more-options__icon"
        );

        const moreOptionsIconBtnEl = document.createElement("button");
        moreOptionsIconBtnEl.classList.add(
          "fmuzik-playlist__item__more-options-icon-btn"
        );

        const deleteBtnEl = document.createElement("button");
        deleteBtnEl.classList.add("fmuzik-playlist__item__delete-btn");
        deleteBtnEl.setAttribute("title", "Xóa video này?");
        deleteBtnEl.addEventListener("click", (e) =>
          deleteVideo(
            e,
            currentPlaylistId,
            element,
            video.getAttribute(ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST)
          )
        );

        const editVideoNameBtnEl = document.createElement("button");
        editVideoNameBtnEl.classList.add(CLASS_NAME.BUTTON_EDIT_NAME);
        editVideoNameBtnEl.setAttribute("title", "Đổi tên video này!");
        editVideoNameBtnEl.addEventListener("click", (e) => {
          log(`Change video name ${element.name} clicked`);
          removeToolBoxElement(divTmp);

          // Inject tool box
          const toolBoxEl = makeToolBoxElement(
            false,
            element.id,
            FMUZIK_TEXT.EDIT
          );
          divTmp.insertAdjacentElement("beforeend", toolBoxEl);

          setTimeout(() => {
            divTmp.classList.add(
              "fmuzik-playlist__item--editing-name",
              "fmuzik-playlist__item--tool-box-opened"
            );
            editVideoNameBtnEl.classList.add(CLASS_NAME.BUTTON_ACTIVE);
          }, 50);
        });

        moreOptions.appendChild(moreOptionsIconBtnEl);
        moreOptions.appendChild(editVideoNameBtnEl);
        moreOptions.appendChild(makeSpitterIcon());
        moreOptions.appendChild(deleteBtnEl);

        divTmp.appendChild(moreOptions);
        // insert item to list
        listPlayer.appendChild(divTmp);

        log(`currentVideoPlayingId: ${currentVideoPlayingId}`);
        log(`element.id: ${element.id}`);
        if (currentVideoPlayingId == element.id) {
          updateIconPlayingOnItem(index);
          currentIndexPlaylistVideo = index;
        }
      }, timeOutTmp);
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
function selectPlaylist(e, playlistId) {
  e.preventDefault();
  const playlistResult = getPlaylistById(playlistId);
  // create list videos
  createListVideosElement(playlistResult);
}

/**
 * Show player mask
 */
function showPlayerMask() {
  const listPlayer = document.querySelector(`.${CLASS_NAME.PANEL_LIST_PLAYER}`);
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
  const listPlayer = document.querySelector(`.${CLASS_NAME.PANEL_LIST_PLAYER}`);
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
  const listPlayer = document.querySelector(`.${CLASS_NAME.PANEL_LIST_PLAYER}`);
  listPlayer.classList.remove(CLASS_NAME.PANEL_LIST_PLAYER_VIDEO);
  const listPlayerMask = document.querySelector(
    ".fmuzik-playlist-panel--player-mask"
  );
  listPlayer.innerHTML = "";
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data.playlist && data.playlist.length > 0 ? data.playlist : [];

    const label = document.querySelector(
      ".fmuzik-playlist-panel--player-label"
    );
    label.setAttribute("title", "");
    label.innerText = "Danh sách playlist của bạn:";

    if (document.querySelector(".fmuzik-playlist__controls")) {
      document.querySelector(".fmuzik-playlist__controls").remove();
    }

    if (playlist.length > 0) {
      listPlayer.classList.remove("fmuzik-playlist-panel--player-not-demand");
      playlist.forEach((element, index) => {
        const playlistItem = document.createElement("a");
        playlistItem.href = "javascript:void(0)";
        playlistItem.classList.add(CLASS_NAME.LIST_ITEM);
        playlistItem.innerHTML = `<span class="fmuzik-playlist__item--name" title="${element.name}">${element.name}</span>`;
        playlistItem.addEventListener("click", (e) =>
          selectPlaylist(e, element.id)
        );

        const icon = document.createElement("i");
        icon.classList.add("fmuzik-playlist__item--icon", "gg-play-list");
        const iconsWrapElTemp = document.createElement("div");
        iconsWrapElTemp.classList.add("fmuzik-playlist__item--icons-wrap");
        iconsWrapElTemp.appendChild(icon);
        playlistItem.insertAdjacentElement("afterbegin", iconsWrapElTemp);

        const divTmp = document.createElement("div");
        divTmp.classList.add(CLASS_NAME.LIST_ITEM_WRAP);
        divTmp.classList.add("fmuzik-playlist__playlists--wrap");
        divTmp.setAttribute(ATTRIBUTE_NAME.PLAYLIST_ID, element.id);

        divTmp.appendChild(playlistItem);

        const moreOptions = document.createElement("div");
        moreOptions.classList.add("fmuzik-playlist__item__more-options");

        const moreOptionsIcon = document.createElement("div");
        moreOptionsIcon.classList.add(
          "fmuzik-playlist__item__more-options__icon"
        );

        const moreOptionsIconBtnEl = document.createElement("button");
        moreOptionsIconBtnEl.classList.add(
          "fmuzik-playlist__item__more-options-icon-btn"
        );

        const deleteBtnEl = document.createElement("button");
        deleteBtnEl.classList.add("fmuzik-playlist__item__delete-btn");
        deleteBtnEl.setAttribute("title", "Xóa playlist này?");
        deleteBtnEl.addEventListener("click", (e) =>
          deletePlaylist(e, element.id, index)
        );

        const sharePlaylistBtnEl = document.createElement("button");
        sharePlaylistBtnEl.classList.add(
          "fmuzik-playlist__item__share-playlist-btn"
        );
        sharePlaylistBtnEl.setAttribute("title", "Chia sẻ playlist này?");
        sharePlaylistBtnEl.addEventListener("click", (e) => {
          log(`Share playlist ${element.name} clicked`);
          removeToolBoxElement(divTmp);

          // Inject tool box
          const toolBoxEl = makeToolBoxElement(
            true,
            element.id,
            FMUZIK_TEXT.SHARE
          );
          divTmp.insertAdjacentElement("beforeend", toolBoxEl);

          setTimeout(() => {
            divTmp.classList.add(
              "fmuzik-playlist__item--sharing-playlist",
              "fmuzik-playlist__item--tool-box-opened"
            );
            sharePlaylistBtnEl.classList.add(CLASS_NAME.BUTTON_ACTIVE);
          }, 50);
        });

        const editPlaylistNameBtnEl = document.createElement("button");
        editPlaylistNameBtnEl.classList.add(CLASS_NAME.BUTTON_EDIT_NAME);
        editPlaylistNameBtnEl.setAttribute("title", "Đổi tên playlist này!");
        editPlaylistNameBtnEl.addEventListener("click", (e) => {
          log(`Change playlist name ${element.name} clicked`);
          removeToolBoxElement(divTmp);

          // Inject tool box
          const toolBoxEl = makeToolBoxElement(
            true,
            element.id,
            FMUZIK_TEXT.EDIT
          );
          divTmp.insertAdjacentElement("beforeend", toolBoxEl);

          setTimeout(() => {
            divTmp.classList.add(
              "fmuzik-playlist__item--editing-name",
              "fmuzik-playlist__item--tool-box-opened"
            );
            editPlaylistNameBtnEl.classList.add(CLASS_NAME.BUTTON_ACTIVE);
          }, 50);
        });

        moreOptions.appendChild(moreOptionsIconBtnEl);
        moreOptions.appendChild(sharePlaylistBtnEl);
        moreOptions.appendChild(makeSpitterIcon());
        moreOptions.appendChild(editPlaylistNameBtnEl);
        moreOptions.appendChild(makeSpitterIcon());
        moreOptions.appendChild(deleteBtnEl);

        divTmp.appendChild(moreOptions);
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

    const askRatingEl = document.createElement("div");
    // askRatingEl.classList.add("fmuzik-playlist-ask-rating");
    askRatingEl.classList.add("fmuzik-playlist-ask-rating", "d-none");
    const askRatingContentEl = document.createElement("div");
    askRatingContentEl.classList.add("fmuzik-playlist-ask-rating__content");
    askRatingEl.appendChild(askRatingContentEl);
    const askRatingContentTextEl = document.createElement("p");
    askRatingContentTextEl.classList.add(
      "fmuzik-playlist-ask-rating__content--text"
    );
    askRatingContentTextEl.innerHTML =
      "Bạn thấy <span class='fmuzik-playlist-ask-rating__content--text-fmuzik'>FMuzik</span> tuyệt chứ?&#10;Hãy để lại <span class='fmuzik-playlist-ask-rating__content--text-rating'>đánh giá<span class='fmuzik-playlist-ask-rating__content--text-rating-hover'>05 &#9733;</span></span> cho mình nhé!";
    const askRatingContentButtonEl = document.createElement("button");
    askRatingContentButtonEl.classList.add(
      "fmuzik-playlist-ask-rating__content--button"
    );
    askRatingContentButtonEl.innerText = "ĐẾN TRANG ĐÁNH GIÁ";
    askRatingContentButtonEl.addEventListener("click", (e) => {
      log("Go to rating");
      window.open(
        "https://chrome.google.com/webstore/detail/fmuzik/jlafgibpfjoflcblnampgeaeopeanabn",
        "_blank"
      );
      isRatedToFMuzik = true;
      isAskRatingShowing = false;
      // save isRatedToFMuzik to store
      chrome.storage.sync.set({ isRatedToFMuzik: true });
      setupIsRatedDisplay();
      setTimeout(() => {
        askRatingEl.classList.add("fmuzik-playlist-ask-rating", "d-none");
      }, 200);
    });
    const askRatingArrowEl = document.createElement("div");
    askRatingArrowEl.classList.add("fmuzik-playlist-ask-rating__arrow");
    askRatingContentEl.appendChild(askRatingContentTextEl);
    askRatingContentEl.appendChild(askRatingContentButtonEl);
    askRatingContentEl.appendChild(askRatingArrowEl);

    playlistPanel.appendChild(askRatingEl);

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
    playlistPanelListPlayer.classList.add(CLASS_NAME.PANEL_LIST_PLAYER);
    playlistPanelContainer.appendChild(playlistPanelListPlayer);

    const credit = document.createElement("div");
    credit.classList.add("row", "text-right", "text-muted", "fmuzik-credit");
    credit.innerHTML = `<span>FMuzik by <a class="fmuzik-msteams" href="sip:nhutth4@fpt.com">NhutTH4</a></span> <svg class="fmuzik-emotion__normal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" xmlns:v="https://vecta.io/nano" style="position: relative;bottom: -4px;fill: #fff;"><path d="M10 22a8 8 0 1 1 0-16 8 8 0 1 1 0 16zm0-2a6 6 0 1 0 0-12 6 6 0 1 0 0 12zm3-5a3 3 0 1 1-6 0h6zm-5-2a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 1 1 0 2zm6.625-5c-.827-.18-3.375-1.59-3.375-4.125 0-1.036.839-1.875 1.875-1.875a1.87 1.87 0 0 1 1.5.75 1.87 1.87 0 0 1 1.5-.75C21.161 2 22 2.839 22 3.875 22 6.41 19.452 7.82 18.625 8z" fill-rule="evenodd"></path></svg> <div class="fmuzik-emotion__face-wrap">
    <div class="fmuzik-emotion__heart-wrap"><div class="fmuzik-emotion__heart">&nbsp;</div></div>
  </div>
    <!-- https://codepen.io/Ma5a/pen/BapbQam -->
    <div class="fmuzik__katty__wrapper">
      <div class="fmuzik__katty__cat_wrapper">
        <div class="fmuzik__katty__cat fmuzik__katty__first_pose">
          <div class="fmuzik__katty__cat_head">
            <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 76.4 61.2" >
              <polygon class="fmuzik__katty__eyes" points="63.8,54.1 50.7,54.1 50.7,59.6 27.1,59.6 27.1,54.1 12.4,54.1 12.4,31.8 63.8,31.8 "/>
              <path d="M15.3,45.9h5.1V35.7h-5.1C15.3,35.7,15.3,45.9,15.3,45.9z M45.8,56.1V51H30.6v5.1H45.8z M61.1,35.7H56v10.2h5.1
                V35.7z M10.2,61.2v-5.1H5.1V51H0V25.5h5.1V15.3h5.1V5.1h5.1V0h5.1v5.1h5.1v5.1h5.1v5.1c0,0,15.2,0,15.2,0v-5.1h5.1V5.1H56V0h5.1v5.1
                h5.1v10.2h5.1v10.2h5.1l0,25.5h-5.1v5.1h-5.1v5.1H10.2z"/>
            </svg>

          </div>
          <div class="fmuzik__katty__body">
            <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 91.7 40.8" >
              <path class="fmuzik__katty__st0" d="M91.7,40.8H0V10.2h5.1V5.1h5.1V0h66.2v5.1h10.2v5.1h5.1L91.7,40.8z"/>
            </svg>

            <div class="fmuzik__katty__tail">
              <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 25.5 61.1" >
                <polygon class="fmuzik__katty__st0" points="10.2,56 10.2,50.9 5.1,50.9 5.1,40.7 0,40.7 0,20.4 5.1,20.4 5.1,10.2 10.2,10.2 10.2,5.1 15.3,5.1 
                  15.3,0 25.5,0 25.5,10.2 20.4,10.2 20.4,15.3 15.3,15.3 15.3,20.4 10.2,20.4 10.2,40.7 15.3,40.7 15.3,45.8 20.4,45.8 20.4,50.9 
                  25.5,50.9 25.5,61.1 15.3,61.1 15.3,56 "/>
              </svg>
            </div>
          </div>
          
          <div class="fmuzik__katty__front_legs">
            <div class="fmuzik__katty__leg fmuzik__katty__one">
              <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 14 30.5" >
                <polygon points="15.3,30.5 5.1,30.5 5.1,25.4 0,25.4 0,0 15.3,0 "/>
              </svg>
            </div>
            <div class="fmuzik__katty__leg fmuzik__katty__two">
              <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 14 30.5" >
                <polygon points="15.3,30.5 5.1,30.5 5.1,25.4 0,25.4 0,0 15.3,0 "/>
              </svg>
            </div>  
          </div>
          
          <div class="fmuzik__katty__back_legs">
            <div class="fmuzik__katty__leg fmuzik__katty__three">
              <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 14 30.5" >
                <polygon points="15.3,30.5 5.1,30.5 5.1,25.4 0,25.4 0,0 15.3,0 "/>
              </svg>
            </div>
            <div class="fmuzik__katty__leg fmuzik__katty__four">
              <svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 14 30.5" >
                <polygon points="15.3,30.5 5.1,30.5 5.1,25.4 0,25.4 0,0 15.3,0 "/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    playlistPanelContainer.appendChild(credit);

    playlistPanel.appendChild(playlistPanelContainer);

    body.insertAdjacentElement("afterbegin", playlistPanel);
    // create playlist items element
    createPlaylistItems();

    setTimeout(() => {
      setupIsRatedDisplay();
    }, 100);

    isKattyActive = false;
    document
      .querySelector(".fmuzik__katty__cat")
      .addEventListener("click", (e) => {
        log("clicked");
        // Stop active katty from second click to last
        if (isKattyActive) {
          return;
        }

        isKattyActive = true;
        kattyInit();
      });
  } else if (!activePlaylist && body && playlistPanel) {
    playlistPanel.innerHTML = "";
  }
}

function setupIsRatedDisplay() {
  const emotionHeartWrapEl = document.querySelector(
    ".fmuzik-emotion__face-wrap"
  );
  const emotionNormalEl = document.querySelector(".fmuzik-emotion__normal");
  if (isRatedToFMuzik) {
    log(`isRatedToFMuzik: ${isRatedToFMuzik}`);
    if (emotionNormalEl) {
      emotionNormalEl.style.display = "none";
    }
    if (emotionHeartWrapEl) {
      emotionHeartWrapEl.style.display = "block";
    }
    if (playlistPanel) {
      playlistPanel.classList.add("fmuzik-playlist-meow-meow");
    }
  } else {
    if (emotionNormalEl) {
      emotionNormalEl.style.display = "block";
    }
  }
}

function setupAskRating() {
  isAskRatingShowing = true;
  const askRatingEl = document.querySelector(".fmuzik-playlist-ask-rating");
  if (askRatingEl) {
    askRatingEl.classList.remove("d-none");
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
  const videoUrl = video
    ? video.getAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_URL)
    : "";

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
              ATTRIBUTE_NAME.PLAYLIST_ID,
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
      hidePopupPlaylistSpinner();
    });
  }, 600);
}

function setupSavePlaylistSharing(dataPlaylistSharing, playlistName) {
  // showPopupPlaylistSpinner();
  showPopupPlaylist();

  log(`setupSavePlaylistSharing: ${dataPlaylistSharing}`);

  const popupPlaylistContainer = document.querySelector(
    ".fmuzik-popup-playlist--main"
  );
  if (popupPlaylistContainer) {
    const playlistSharingImportContainerEl = document.createElement("div");
    playlistSharingImportContainerEl.classList.add(
      "fmuzik-popup-playlist--sharing-import"
    );

    const playlistSharingImportHeadEl = document.createElement("div");
    playlistSharingImportHeadEl.classList.add(
      "fmuzik-popup-playlist--sharing-import__head"
    );
    playlistSharingImportHeadEl.innerHTML = `<h5 class="fmuzik-popup-playlist--sharing-import__head--title">Playlist được chia sẻ:</h5>`;

    const playlistSharingImportFootEl = document.createElement("div");
    playlistSharingImportFootEl.classList.add(
      "fmuzik-popup-playlist--sharing-import__foot"
    );
    const playlistSharingImportInputNameEl = document.createElement("input");
    playlistSharingImportInputNameEl.classList.add(
      "fmuzik-popup-playlist--sharing-import__input-name"
    );
    const newPlaylistName = playlistName.replace(
      /^\s*(P|p)(laylist\:)\s*/g,
      ""
    );
    playlistSharingImportInputNameEl.value = newPlaylistName;
    const playlistSharingImportSaveBtnEl = document.createElement("button");
    playlistSharingImportSaveBtnEl.addEventListener("click", (e) => {
      if (!playlistSharingImportInputNameEl.value) {
        showAlert(MSG_TYPE.DANGER, "Hãy nhập tên cho Playlist nhé!", 1500);
        playlistSharingImportInputNameEl.focus();
      } else {
        currentDataPlaylistSharing.name =
          playlistSharingImportInputNameEl.value;
        log(`currentDataPlaylistSharing:`);
        log(currentDataPlaylistSharing);
        savePlaylistSharing();
      }
    });
    playlistSharingImportSaveBtnEl.classList.add(
      "fmuzik-popup-playlist--sharing-import__btn-save"
    );
    playlistSharingImportSaveBtnEl.textContent = "Lưu Playlist";
    playlistSharingImportFootEl.innerHTML = `<label class="fmuzik-popup-playlist--sharing-import__input-name-label">Tên Playlist</label>`;
    playlistSharingImportFootEl.appendChild(playlistSharingImportInputNameEl);
    playlistSharingImportFootEl.appendChild(playlistSharingImportSaveBtnEl);

    const playlistSharingImportMainEl = document.createElement("div");
    playlistSharingImportMainEl.classList.add(
      "fmuzik-popup-playlist--sharing-import__main"
    );

    currentDataPlaylistSharing = {
      id: createPlaylistId(),
      name: "",
      videos: [],
    };
    if (Array.isArray(dataPlaylistSharing) && dataPlaylistSharing.length > 0) {
      const totalVideos =
        dataPlaylistSharing.length < 10 && dataPlaylistSharing.length > 0
          ? `0${dataPlaylistSharing.length}`
          : dataPlaylistSharing.length;
      playlistSharingImportHeadEl.insertAdjacentHTML(
        "beforeend",
        `<span class="fmuzik-popup-playlist--sharing-import__head--total-videos"><span class="fmuzik-popup-playlist--sharing-import__head--total-videos-icon">&#9834</span>: ${totalVideos}</span>`
      );
      for (let index = 0; index < dataPlaylistSharing.length; index++) {
        const videoImported = dataPlaylistSharing[index];
        log(`videoImported: ${videoImported}`);
        const videoImportedTrim = videoImported.replace(/(\[\[)/g, "");
        const videoImportedTrimArr = videoImportedTrim.split("]]");
        const videoName = videoImportedTrimArr[0];
        const videoUrl = "https://fpt.workplace.com/" + videoImportedTrimArr[1];
        log(`videoName: ${videoName}`);
        log(`videoUrl: ${videoUrl}`);

        currentDataPlaylistSharing.videos[index] = {
          videoName: videoName,
          videoUrl: videoUrl,
          id: "",
          isSaveThis: true,
        };

        const checkboxGroupEl = document.createElement("div");
        checkboxGroupEl.classList.add("fmuzik-form-checkbox-group");
        const checkboxIsSaveThisEl = document.createElement("input");
        checkboxIsSaveThisEl.setAttribute("type", "checkbox");
        checkboxIsSaveThisEl.classList.add("fmuzik-form-checkbox-input");
        checkboxIsSaveThisEl.checked = true;
        const videoId = createVideoId();
        currentDataPlaylistSharing.videos[index].id = videoId;
        checkboxIsSaveThisEl.id = videoId;
        checkboxIsSaveThisEl.setAttribute(
          ATTRIBUTE_NAME.FMUZIK_VIDEO_ID,
          videoId
        );
        checkboxIsSaveThisEl.addEventListener("change", (e) => {
          currentDataPlaylistSharing.videos[index].isSaveThis = Boolean(
            e.target.checked
          );
        });
        const labelForCheckboxIsSaveThisEl = document.createElement("label");
        labelForCheckboxIsSaveThisEl.classList.add(
          "fmuzik-form-checkbox-label"
        );
        labelForCheckboxIsSaveThisEl.setAttribute("for", videoId);
        labelForCheckboxIsSaveThisEl.textContent = videoName;

        checkboxGroupEl.appendChild(checkboxIsSaveThisEl);
        checkboxGroupEl.appendChild(labelForCheckboxIsSaveThisEl);

        playlistSharingImportMainEl.appendChild(checkboxGroupEl);
      }
    }

    playlistSharingImportContainerEl.appendChild(playlistSharingImportHeadEl);
    playlistSharingImportContainerEl.appendChild(playlistSharingImportMainEl);
    playlistSharingImportContainerEl.appendChild(playlistSharingImportFootEl);
    popupPlaylistContainer.appendChild(playlistSharingImportContainerEl);
  }
}

function savePlaylistSharing() {
  if (
    !currentDataPlaylistSharing ||
    currentDataPlaylistSharing.videos.length == 0 ||
    !currentDataPlaylistSharing.videos.some((v) => v.isSaveThis)
  ) {
    showAlert(MSG_TYPE.DANGER, "Chọn ít nhất 01 video để lưu Playlist!", 2000);
  } else {
    showPopupPlaylistSpinner();
    chrome.storage.sync.get("playlist", (store) => {
      playlist = store && store.playlist ? store.playlist : [];
      const newPlaylist = {
        id: currentDataPlaylistSharing.id,
        name: currentDataPlaylistSharing.name,
        videos: [],
      };
      for (
        let index = 0;
        index < currentDataPlaylistSharing.videos.length;
        index++
      ) {
        const playlistTmp = currentDataPlaylistSharing.videos[index];
        if (playlistTmp.isSaveThis) {
          newPlaylist.videos.push({
            id: playlistTmp.id,
            name: playlistTmp.videoName,
            url: playlistTmp.videoUrl,
            articleUrl: "",
          });
        }
      }
      playlist.push(newPlaylist);
      log(`save newPlaylist done: ${newPlaylist}`);

      chrome.storage.sync.set({ playlist: playlist }).then(() => {
        createPlaylistItems();
        if (document.querySelector(".fmuzik-playlist__controls")) {
          document.querySelector(".fmuzik-playlist__controls").remove();
        }
        setTimeout(() => {
          showAlert(
            MSG_TYPE.SUCCESS,
            `Lưu Playlist ${newPlaylist.name} thành công!`,
            2000
          );
          hidePopupPlaylistSpinner();
          setTimeout(() => {
            closePopupPlaylist();
          }, 600);
        }, 800);
      });
    });
  }
}

/**
 * Setup save to playlist
 */
function setupSaveToPlaylist(video) {
  const buttonSaveToPlaylist = video
    .closest("[data-visualcompletion=ignore]")
    ?.querySelector(`.${CLASS_NAME.BUTTON_SAVE_TO_PLAYLIST}`);
  const buttonSaveToPlaylistInMediaViewerMode = document.querySelector(
    "[data-name=media-viewer-nav-container]"
  );
  if (activePlaylist && !buttonSaveToPlaylist) {
    // add button save to playlist on top video
    const newButtonSaveToPlaylist = document.createElement("button");
    newButtonSaveToPlaylist.classList.add(CLASS_NAME.BUTTON_SAVE_TO_PLAYLIST);
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
          ?.insertAdjacentElement("afterbegin", newButtonSaveToPlaylist);
      }
    }
  } else if (!activePlaylist) {
    // remove button save to playlist on top video
    if (buttonSaveToPlaylist) {
      buttonSaveToPlaylist.remove();
    } else if (buttonSaveToPlaylistInMediaViewerMode) {
      const buttonInMediaViewerMode =
        buttonSaveToPlaylistInMediaViewerMode.querySelector(
          `.${CLASS_NAME.BUTTON_SAVE_TO_PLAYLIST}`
        );
      if (buttonInMediaViewerMode) {
        buttonInMediaViewerMode.remove();
      }
    }
  }
}

let listCheckVideosAttributeExistTmp = [];

/**
 * Setup videos
 */
function setupVideos() {
  listCheckVideosAttributeExistTmp = [];
  const geminiLayoutEntity = document.querySelector(
    "[data-pagelet=GeminiLayoutEntity]"
  );
  const feed = geminiLayoutEntity
    ? geminiLayoutEntity.querySelector("[role=feed]")
    : null;

  const isSearchMode = document.location.pathname.match("/search/");
  // ex personal wall: https://fpt.workplace.com/profile.php?id=900048619999981
  const isPersonalWall = document.location.pathname.match("/profile.php?");

  const singelVideoViewer = document.querySelector("[data-pagelet=TahoeVideo]");
  const albumnViewer = document.querySelector(
    "[data-name=media-viewer-nav-container]"
  );

  // normal video in newsfeed
  let videos = feed ? feed.querySelectorAll("video") : [];

  if (albumnViewer) {
    // albumn viewer
    // log("albumnViewer: ", albumnViewer);
    videos = document
      .querySelector("[data-name=media-viewer-nav-container]")
      .nextElementSibling.querySelectorAll("video");
  } else if (singelVideoViewer) {
    // single video viewer
    // log("singelVideoViewer: ", singelVideoViewer);
    videos = document
      .querySelector("[data-pagelet=TahoeVideo]")
      .querySelectorAll("video");
  } else if (geminiLayoutEntity && (isSearchMode || isPersonalWall)) {
    // Search mode or Personal wall
    // log("isSearchMode: ", isSearchMode);
    // log("isPersonalWall: ", isPersonalWall);
    const geminiLayoutEntityTmp = document.querySelectorAll(
      "[data-pagelet=GeminiLayoutEntity]"
    );
    log("geminiLayoutEntityTmp: ", geminiLayoutEntityTmp);
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

  if (oldNumOfVideos == videos.length && oldUrl == document.location.href) {
    // If all videos is has fmuzik_id, fmuzik_video_url, fmuzik_video_article_url => stop setup
    videos.forEach((v) => {
      if (
        v.getAttribute(ATTRIBUTE_NAME.FMUZIK_ID) &&
        v.getAttribute(ATTRIBUTE_NAME.VIDEO_ARTICLE) &&
        v.getAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_URL)
      ) {
        listCheckVideosAttributeExistTmp.push(v);
      }
    });
    // if (videos.length == 1) {
    if (listCheckVideosAttributeExistTmp.length == videos.length) {
      return;
    }
    // } else {
    // return;
    // }
  }

  oldNumOfVideos = videos.length;
  oldUrl = document.location.href;

  videos.forEach((video, index) => {
    /** assign fmuzik id to video */
    assignFMuzikId(video);
    // call setup loop video
    setupLoopVideos(video);
    /** setup save to playlist */
    setupSaveToPlaylist(video);
    // Get URL post of video
    getUrlPostOfVideo(video);
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
 * getUrlPostOfVideo
 * @description Get URL post of video in a article
 * @param {HTMLVideoElement} video
 */
function getUrlPostOfVideo(video) {
  if (video.getAttribute(ATTRIBUTE_NAME.VIDEO_ARTICLE)) {
    return;
  }

  const articleElOfThisVideo = video.closest("div[role=article]");
  if (!articleElOfThisVideo) {
    return;
  }

  let links = articleElOfThisVideo.querySelectorAll("a[role=link]");
  if (!links || links.length === 0) {
    return;
  }

  const newLinks = [];
  for (let index = 0; index < links.length; index++) {
    /**
     * <a role="link" aria-label="publish date" href="https://fpt.workplace.com/groups/muzikinmymind/posts/2473074802847276/" ...>
     *  <span>publish date</span>
     * </a>
     */
    const link = links[index];
    if (
      link.childElementCount === 1 &&
      link.firstElementChild.tagName.toLowerCase() == "span" &&
      link.ariaLabel == link.outerText
    ) {
      newLinks.push(link);
    }
  }
  if (!newLinks || newLinks.length === 0) {
    return;
  }
  links = newLinks;
  if (links.length > 1) {
    // Hmm, can't find exactly
    return;
  }

  video.setAttribute(
    ATTRIBUTE_NAME.VIDEO_ARTICLE,
    formatLinkVideo(links[0].href)
  );
  log("BEGIN: link article of video:");
  log(video);
  log(links);
  log("END: link article of video");
}

/**
 * setupDragAndDropVideoList
 * @description Setup drag and drop playlist videos to re-order or sort the list
 * @link https://codepen.io/artemveremienko/details/BajdoJO
 */
function setupDragAndDropVideoList() {
  const tasksListElement = document.querySelector(
    `.${CLASS_NAME.PANEL_LIST_PLAYER}.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`
  );
  const taskElements = tasksListElement?.querySelectorAll(
    `.${CLASS_NAME.LIST_ITEM_WRAP}`
  );

  if (taskElements) {
    for (const task of taskElements) task.draggable = true;

    tasksListElement.addEventListener("dragstart", (evt) => {
      if (
        evt.target.closest(`.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`) &&
        !evt.target
          .closest(`.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`)
          .querySelector(".fmuzik-playlist__item--tool-box-opened")
      ) {
        if (evt.target.classList.contains(CLASS_NAME.LIST_ITEM_WRAP)) {
          evt.target.classList.add("fmuzik-playlist__item--wrap__selected");
        } else {
          const itemWrapTmp = evt.target.closest(
            `.${CLASS_NAME.LIST_ITEM_WRAP}`
          );
          if (itemWrapTmp) {
            itemWrapTmp.classList.add("fmuzik-playlist__item--wrap__selected");
          }
        }
      }
    });

    tasksListElement.addEventListener("dragend", (evt) => {
      if (
        evt.target.closest(`.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`) &&
        !evt.target
          .closest(`.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`)
          .querySelector(".fmuzik-playlist__item--tool-box-opened")
      ) {
        if (evt.target.classList.contains(CLASS_NAME.LIST_ITEM_WRAP)) {
          evt.target.classList.remove("fmuzik-playlist__item--wrap__selected");
        } else {
          const itemWrapTmp = evt.target.closest(
            `.${CLASS_NAME.LIST_ITEM_WRAP}`
          );
          if (itemWrapTmp) {
            itemWrapTmp.classList.remove(
              "fmuzik-playlist__item--wrap__selected"
            );
          }
        }
      }
    });

    tasksListElement.addEventListener("dragover", (evt) => {
      evt.preventDefault();

      if (
        evt.target.closest(`.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`) &&
        !evt.target
          .closest(`.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`)
          .querySelector(".fmuzik-playlist__item--tool-box-opened")
      ) {
        const activeElement = tasksListElement.querySelector(
          ".fmuzik-playlist__item--wrap__selected"
        );
        let currentElement = evt.target;
        if (!currentElement.classList.contains(CLASS_NAME.LIST_ITEM_WRAP)) {
          const itemWrapTmp = evt.target.closest(
            `.${CLASS_NAME.LIST_ITEM_WRAP}`
          );
          if (itemWrapTmp) {
            currentElement = itemWrapTmp;
          } else {
            log("Opps! Sth wrong when handle dragover");
            return;
          }
        }

        const isMoveable =
          activeElement !== currentElement &&
          currentElement.classList.contains(CLASS_NAME.LIST_ITEM_WRAP);

        if (!isMoveable) return;

        const nextElement = getNextElement(evt.clientY, currentElement);

        if (
          (nextElement &&
            activeElement === nextElement.previousElementSibling) ||
          activeElement === nextElement
        ) {
          return;
        }

        tasksListElement.insertBefore(activeElement, nextElement);
        // Re-order playlist videos
        reorderPlaylistVideos();
      }
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
    `.${CLASS_NAME.PANEL_LIST_PLAYER}.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`
  );
  if (listPlayerVideoEl) {
    const videoItemWrapElArr = listPlayerVideoEl.querySelectorAll(
      `.${CLASS_NAME.LIST_ITEM_WRAP}`
    );
    if (!videoItemWrapElArr || videoItemWrapElArr.length <= 1) {
      return;
    }
    const newPlaylistPlayer = [];
    const fmuzilPlayerEl = document.getElementById("fmuzik-player");

    let currentPlaylistOrderedId = "";

    for (let index = 0; index < videoItemWrapElArr.length; index++) {
      const videoItemWrapEl = videoItemWrapElArr[index];
      const videoItemEl = videoItemWrapEl.querySelector(
        `.${CLASS_NAME.LIST_ITEM}`
      );
      const videoItem = {
        name: videoItemEl.getAttribute(ATTRIBUTE_NAME.VIDEO_NAME),
        url: videoItemEl.getAttribute(ATTRIBUTE_NAME.VIDEO_URL),
      };
      // 2. update position of currentPlaylistPlayer
      videoItemEl.setAttribute(ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST, index);

      if (
        currentIndexPlaylistVideo !== -1 &&
        videoItemEl.getAttribute(ATTRIBUTE_NAME.PLAYLIST_ID) ==
          fmuzilPlayerEl.dataset.fmuzikPlaylistId
      ) {
        if (
          videoItemEl.getAttribute(ATTRIBUTE_NAME.VIDEO_URL) ==
          fmuzilPlayerEl.dataset.fmuzikPlaylistVideoUrl
        ) {
          if (
            videoItemEl.getAttribute(ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST) ===
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
        currentPlaylistOrderedId = videoItemEl.getAttribute(
          ATTRIBUTE_NAME.PLAYLIST_ID
        );
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
}

function saveDataCurrentPlaylist(
  currentPlaylistIdNeedToSave,
  newPlaylistPlayer
) {
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];

    if (!playlist || playlist.length == 0) {
      showAlert(MSG_TYPE.DANGER, MSG.REORDER_PLAYLIST_VIDEO_ERROR_ON_SAVE);
      return setTimeout(() => {
        hideAlert();
      }, 1000);
    } else {
      const indexOfCurrentPlaylistNeedToSave = playlist.findIndex(
        (p) => p.id == currentPlaylistIdNeedToSave
      );
      if (indexOfCurrentPlaylistNeedToSave > -1) {
        playlist[indexOfCurrentPlaylistNeedToSave].videos = newPlaylistPlayer;
      }
      if (Array.isArray(newPlaylistPlayer) && newPlaylistPlayer.length > 0) {
        chrome.storage.sync.set({ playlist: playlist });
        log(
          "save playlist " +
            playlist[indexOfCurrentPlaylistNeedToSave].name +
            " success!"
        );
      }
    }
  });
}

/**
 * savePlaylistName
 * @param {string} playlistId
 * @param {string} playlistName
 * @param {HTMLDivElement} toolBoxEl
 */
function savePlaylistName(playlistId, playlistName, toolBoxEl = null) {
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];

    if (!playlist || playlist.length == 0) {
      showAlert(MSG_TYPE.DANGER, "Lưu playlist thất bại!", 1000);
    } else {
      const indexOfCurrentPlaylistNeedToSave = playlist.findIndex(
        (p) => p.id == playlistId
      );
      if (indexOfCurrentPlaylistNeedToSave > -1) {
        playlist[indexOfCurrentPlaylistNeedToSave].name = playlistName;

        chrome.storage.sync.set({ playlist: playlist });
        log(
          "save playlist " +
            playlist[indexOfCurrentPlaylistNeedToSave].name +
            " success!"
        );
        if (toolBoxEl) {
          showMsgOnItem(
            MSG_TYPE.SUCCESS,
            "Đã cập nhật tên playlist!",
            toolBoxEl.closest(`.${CLASS_NAME.LIST_ITEM_WRAP}`)
          );

          // Change name playlist in DOM
          const playlistNameLabel = toolBoxEl.parentElement.querySelector(
            ".fmuzik-playlist__item--name"
          );
          if (playlistNameLabel) {
            playlistNameLabel.textContent = playlistName;
            playlistNameLabel.setAttribute("title", playlistName);
          }

          // Remove tool box from DOM
          setTimeout(() => {
            selfRemoveToolBoxElement(toolBoxEl);
          }, 300);
        }
      }
    }
  });
}

/**
 * saveVideoName
 * @param {string} playlistId
 * @param {string} videoId
 * @param {string} videoName
 * @param {HTMLDivElement} toolBoxEl
 */
function saveVideoName(playlistId, videoId, videoName, toolBoxEl = null) {
  chrome.storage.sync.get("playlist", (data) => {
    playlist = data && data.playlist ? data.playlist : [];

    if (!playlist || playlist.length == 0) {
      showAlert(MSG_TYPE.DANGER, "Lưu playlist thất bại!");
      return setTimeout(() => {
        hideAlert();
      }, 1000);
    } else {
      const indexOfCurrentPlaylistNeedToSave = playlist.findIndex(
        (p) => p.id == playlistId
      );
      if (indexOfCurrentPlaylistNeedToSave > -1) {
        const indexOfCurrentVideoNeedToSave = playlist[
          indexOfCurrentPlaylistNeedToSave
        ].videos.findIndex((v) => v.id == videoId);
        if (indexOfCurrentVideoNeedToSave > -1) {
          playlist[indexOfCurrentPlaylistNeedToSave].videos[
            indexOfCurrentVideoNeedToSave
          ].name = videoName;

          chrome.storage.sync.set({ playlist: playlist });
          log(
            "save video " +
              playlist[indexOfCurrentPlaylistNeedToSave].videos[
                indexOfCurrentVideoNeedToSave
              ].name +
              " success!"
          );
          if (toolBoxEl) {
            showMsgOnItem(
              MSG_TYPE.SUCCESS,
              "Đã cập nhật tên video!",
              toolBoxEl.closest(`.${CLASS_NAME.LIST_ITEM_WRAP}`)
            );

            // Change name video in DOM
            const videoNameLabel = toolBoxEl.parentElement.querySelector(
              ".fmuzik-playlist__item--name"
            );
            if (videoNameLabel) {
              videoNameLabel.textContent = videoName;
              videoNameLabel.setAttribute("title", escapeRegExp(videoName));
            }

            // Remove tool box from DOM
            setTimeout(() => {
              selfRemoveToolBoxElement(toolBoxEl);
            }, 300);
          }
        }
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
 * kattyInit
 * @description Hidden feature
 * @link https://codepen.io/Ma5a/pen/BapbQam
 */
function kattyInit() {
  log("kattyInit");
  const catWrapper = document.querySelector(".fmuzik__katty__cat_wrapper");
  const wrapper = document.querySelector(".fmuzik__katty__wrapper");
  const cat = document.querySelector(".fmuzik__katty__cat");
  const head = document.querySelector(".fmuzik__katty__cat_head");
  const legs = document.querySelectorAll(".fmuzik__katty__leg");
  const pos = {
    x: null,
    y: null,
  };
  let view = null;

  cat.style.left = "50px";
  const walk = () => {
    cat.classList.remove("fmuzik__katty__first_pose");
    legs.forEach((leg) => leg.classList.add("fmuzik__katty__walk"));
  };

  const handleMouseMotion = (e) => {
    // log("current e");
    // log(e);
    view = e.view;
    pos.x = e.clientX - (view.outerWidth - 320);
    pos.y = e.clientY - (view.outerHeight - 415);
    walk();
  };

  const handleTouchMotion = (e) => {
    if (!e.targetTouches) return;
    pos.x = e.targetTouches[0].offsetX;
    pos.y = e.targetTouches[0].offsetY;
    walk();
  };

  let myTimeout = setTimeout(() => {}, 0);
  const turnRight = () => {
    const posLeft = pos.x - 8;
    cat.style.left = `${posLeft}px`;
    const fmuzikEmotionHeartActiveHappyEl = fmuzikContainerEl.querySelector(
      ".fmuzik-emotion__heart--active-happy"
    );
    if (posLeft > 50) {
      if (fmuzikEmotionHeartActiveHappyEl) {
        clearTimeout(myTimeout);
        fmuzikEmotionHeartActiveHappyEl.classList.remove(
          "fmuzik-emotion__heart--active-happy"
        );
      }
    }
    cat.classList.remove("fmuzik__katty__face_left");
    cat.classList.add("fmuzik__katty__face_right");
  };

  let isStopHeartBeat = false;
  const turnLeft = () => {
    const posLeft = pos.x - 200;
    cat.style.left = `${posLeft}px`;
    const fmuzikEmotionHeartEl = fmuzikContainerEl.querySelector(
      ".fmuzik-emotion__heart"
    );
    if (posLeft < -214) {
      if (fmuzikEmotionHeartEl) {
        if (
          fmuzikEmotionHeartEl.classList.contains(
            "fmuzik-emotion__heart--active"
          )
        ) {
          if (
            !fmuzikEmotionHeartEl.classList.contains(
              "fmuzik-emotion__heart--active-happy"
            )
          ) {
            // clearTimeout(myTimeout);
            if (!isStopHeartBeat) {
              fmuzikEmotionHeartEl.classList.add(
                "fmuzik-emotion__heart--active-happy"
              );
              isStopHeartBeat = true;
              myTimeout = setTimeout(() => {
                fmuzikEmotionHeartEl.classList.remove(
                  "fmuzik-emotion__heart--active-happy"
                );
              }, 9100);
            }
          }
        } else {
          fmuzikEmotionHeartEl.classList.add("fmuzik-emotion__heart--active");
        }

        // fmuzikEmotionHeartEl.classList.remove("fmuzik-emotion__heart--active");
        // setTimeout(() => {
        // }, 100);
      }
    } else {
      if (fmuzikEmotionHeartEl) {
        clearTimeout(myTimeout);
        isStopHeartBeat = false;
        fmuzikEmotionHeartEl.classList.remove(
          "fmuzik-emotion__heart--active-happy"
        );
      }
    }
    cat.classList.remove("fmuzik__katty__face_right");
    cat.classList.add("fmuzik__katty__face_left");
  };

  const decideTurnDirection = () => {
    // log("decideTurnDirection");
    // log(cat.getBoundingClientRect());
    cat.getBoundingClientRect().x - (view.outerWidth - 320) < pos.x
      ? turnRight()
      : turnLeft();
  };

  const headMotion = () => {
    pos.y > wrapper.clientHeight + 20
      ? (head.style.top = "-15px")
      : (head.style.top = "-30px");
  };

  const jump = () => {
    catWrapper.classList.remove("fmuzik__katty__jump");
    if (pos.y < wrapper.clientHeight - 60) {
      setTimeout(() => {
        catWrapper.classList.add("fmuzik__katty__jump");
      }, 100);
    }
  };

  const decideStop = () => {
    // log("decideStop");
    // log("pos: ");
    // log(pos);

    if (
      (cat.classList.contains("fmuzik__katty__face_right") &&
        pos.x - 8 === cat.offsetLeft) ||
      (cat.classList.contains("fmuzik__katty__face_left") &&
        pos.x - 200 === cat.offsetLeft)
    ) {
      legs.forEach((leg) => leg.classList.remove("fmuzik__katty__walk"));
    }
  };

  setInterval(() => {
    if (!pos.x || !pos.y) return;
    decideTurnDirection();
    headMotion();
    decideStop();
  }, 100);

  setInterval(() => {
    if (isAskRatingShowing) {
      return jump();
    }
    if (!pos.x || !pos.y) return;
    jump();
  }, 1000);

  const fmuzikContainerEl = document.querySelector(
    ".fmuzik-playlist-panel--container"
  );
  fmuzikContainerEl.addEventListener("mousemove", handleMouseMotion);
  fmuzikContainerEl.addEventListener("mousemove", handleTouchMotion);
}

/**
 * makeSpitterIcon
 * @returns {HTMLSpanElement} spliterEl
 */
function makeSpitterIcon() {
  const spliterEl = document.createElement("span");
  spliterEl.classList.add("fmuzik-splitter-icon");
  return spliterEl;
}

/**
 * makeToolBoxElement
 * @param {boolean} isBoxPlaylist
 * @param {string} id: video|playlist id
 * @param {string} options: other options
 * @returns {HTMLDivElement} toolBoxEl
 */
function makeToolBoxElement(isBoxPlaylist, id, options = "") {
  const toolBoxEl = document.createElement("div");
  toolBoxEl.classList.add("fmuzik-playlist__item__tool-box");

  const labelBoxEl = document.createElement("span");
  labelBoxEl.classList.add("fmuzik-playlist__item__tool-box--label");
  toolBoxEl.appendChild(labelBoxEl);

  const inputEl = document.createElement("input");
  inputEl.classList.add("fmuzik-playlist__item__tool-box--input");
  toolBoxEl.appendChild(inputEl);

  let playlistResult;
  let videoResult;

  if (isBoxPlaylist) {
    toolBoxEl.classList.add("fmuzik-playlist__item__tool-box--playlist");
    playlistResult = getPlaylistById(id);
  } else {
    toolBoxEl.classList.add("fmuzik-playlist__item__tool-box--video");
    videoResult = getVideoById(id);
  }

  if (options === FMUZIK_TEXT.EDIT) {
    const saveBtnEl = document.createElement("button");
    saveBtnEl.classList.add("fmuzik-playlist__item__tool-box--save-btn");
    saveBtnEl.textContent = "Lưu";
    saveBtnEl.addEventListener("click", (e) => {
      log("fmuzik-playlist__item__tool-box--save-btn clicked:", e);
      if (inputEl.value) {
        inputEl.classList.remove(
          "fmuzik-playlist__item__tool-box--input-invalid"
        );
        const currentPlaylistIdTmp = toolBoxEl.parentElement.getAttribute(
          ATTRIBUTE_NAME.PLAYLIST_ID
        );
        if (isBoxPlaylist) {
          // Edit current playlist
          savePlaylistName(currentPlaylistIdTmp, inputEl.value, toolBoxEl);
        } else {
          // Edit current video
          const currentVideoIdTmp = toolBoxEl.parentElement.getAttribute(
            ATTRIBUTE_NAME.FMUZIK_VIDEO_ID
          );
          saveVideoName(
            currentPlaylistIdTmp,
            currentVideoIdTmp,
            inputEl.value,
            toolBoxEl
          );
        }
      } else {
        // Input is empty
        inputEl.classList.add("fmuzik-playlist__item__tool-box--input-invalid");
        inputEl.focus();
      }
    });
    toolBoxEl.appendChild(saveBtnEl);

    if (isBoxPlaylist) {
      if (playlistResult) {
        inputEl.value = playlistResult.name;
      }
    } else {
      if (videoResult) {
        inputEl.value = videoResult.name;
      }
    }
  }

  if (isBoxPlaylist && options === FMUZIK_TEXT.SHARE) {
    // inputEl.readOnly = true;

    const copyBtnEl = document.createElement("button");
    copyBtnEl.classList.add("fmuzik-playlist__item__tool-box--copy-btn");
    copyBtnEl.textContent = "Chia sẻ";
    copyBtnEl.addEventListener("click", (e) => {
      log("fmuzik-playlist__item__tool-box--copy-btn clicked:", e);
      if (inputEl.value) {
        inputEl.classList.remove(
          "fmuzik-playlist__item__tool-box--input-invalid"
        );
        const currentPlaylistIdTmp = toolBoxEl.parentElement.getAttribute(
          ATTRIBUTE_NAME.PLAYLIST_ID
        );

        const urlPlaylistSharing = makeURLPlaylistSharing(currentPlaylistIdTmp);

        copyPlaylistSharingToClipboard(
          inputEl.value,
          urlPlaylistSharing,
          toolBoxEl
        );
      } else {
        // Input is empty
        inputEl.classList.add("fmuzik-playlist__item__tool-box--input-invalid");
        inputEl.focus();
      }
    });
    toolBoxEl.appendChild(copyBtnEl);

    if (isBoxPlaylist) {
      if (playlistResult) {
        inputEl.value = `Playlist: ${playlistResult.name} | Chia sẻ bởi FMuzik`;
      }
    }
  }

  const cancelBtnEl = document.createElement("button");
  cancelBtnEl.classList.add("fmuzik-playlist__item__tool-box--cancel-btn");
  cancelBtnEl.textContent = "Hủy bỏ";
  cancelBtnEl.addEventListener("click", (e) => {
    log("fmuzik-playlist__item__tool-box--cancel-btn clicked:", e);
    selfRemoveToolBoxElement(toolBoxEl);
  });
  toolBoxEl.appendChild(cancelBtnEl);

  return toolBoxEl;
}

/**
 * removeToolBoxElement
 * @param {HTMLDivElement} parent
 */
function removeToolBoxElement(parent) {
  parent.querySelector(".fmuzik-playlist__item__tool-box")?.remove();
  removeToolBoxClasses(parent);
}

/**
 * removeToolBoxClasses
 * @param {HTMLDivElement} parent
 */
function removeToolBoxClasses(parent) {
  parent
    .querySelector(`.${CLASS_NAME.BUTTON_ACTIVE}`)
    ?.classList.remove(CLASS_NAME.BUTTON_ACTIVE);
  parent.classList.remove("fmuzik-playlist__item--tool-box-opened");
  parent.classList.remove("fmuzik-playlist__item--sharing-playlist");
  parent.classList.remove("fmuzik-playlist__item--editing-name");
}

/**
 * removeToolBoxClasses
 * @param {HTMLDivElement} toolBoxEl
 */
function selfRemoveToolBoxElement(toolBoxEl) {
  removeToolBoxClasses(toolBoxEl.parentElement);
  setTimeout(() => {
    toolBoxEl.remove();
  }, 700);
}

/**
 * getPlaylistById
 * @param {string|number} id
 * @returns {playlistI|null} playlist | null
 */
function getPlaylistById(id) {
  const playlistResult = playlist.filter((p) => String(p.id) === String(id));
  return playlistResult.length > 0 ? playlistResult[0] : null;
}

/**
 * getVideoById
 * @param {string} id
 * @returns {videoI|null} video | null
 */
function getVideoById(id) {
  let videoResult = null;
  playlist.map((p) => {
    const videoResultTmp = p.videos.filter((v) => String(v.id) === String(id));
    if (videoResultTmp.length > 0) {
      videoResult = videoResultTmp[0];
      return videoResult;
    }
  });
  return videoResult;
}

/**
 * makeURLPlaylistSharing
 * @param {string} idPlaylist
 * @returns urlPlaylistSharing
 */
function makeURLPlaylistSharing(idPlaylist) {
  let urlPlaylistSharing = "";
  const playlistToShare = playlist.filter((p) => p.id == idPlaylist)?.[0];
  if (playlistToShare) {
    playlistToShare.videos.forEach((v, i) => {
      if (!urlPlaylistSharing) {
        urlPlaylistSharing += "http://fmuzikplaylistsharing.com/?fmuzik=";
      } else {
        urlPlaylistSharing += FMUZIK_TEXT.FMUZIK_PLAYLIST_SHARING_SPLIT_STR;
      }
      // "Despacito" -- Luis Fonsi ft. Daddy Yankee
      // https://fpt.workplace.com/100079341576108/videos/982434736510046
      // => [["Despacito" -- Luis Fonsi ft. Daddy Yankee]]100079341576108/videos/982434736510046
      urlPlaylistSharing += `[[${v.name}]]${v.url.replace(
        "https://fpt.workplace.com/",
        ""
      )}`;
    });
  }
  return urlPlaylistSharing + FMUZIK_TEXT.FMUZIK_PLAYLIST_SHARING_END_FLAG;
}

/**
 * copyPlaylistSharingToClipboard
 * @param {string} caption
 * @param {string} urlPlaylistSharing
 * @param {HTMLDivElement} toolBoxEl
 */
function copyPlaylistSharingToClipboard(
  caption,
  urlPlaylistSharing,
  toolBoxEl = null
) {
  const divFake = document.createElement("div");
  const captionEl = document.createElement("span");
  captionEl.textContent = caption;
  const aEl = document.createElement("a");
  aEl.href = urlPlaylistSharing;
  aEl.appendChild(captionEl);
  divFake.appendChild(aEl);
  divFake.classList.add("fmuzik-playlist-sharing");
  document.body.appendChild(divFake);

  // https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(aEl);
    range.select();
    document.execCommand("copy");
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(aEl);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
  } else {
    log("Could not select text in node: Unsupported browser.");
  }
  if (toolBoxEl) {
    showMsgOnItem(
      MSG_TYPE.SUCCESS,
      "Copy playlist thành công!",
      toolBoxEl.closest(`.${CLASS_NAME.LIST_ITEM_WRAP}`)
    );
  }
  setTimeout(() => {
    divFake.remove();
    if (toolBoxEl) {
      selfRemoveToolBoxElement(toolBoxEl);
    }
  }, 500);
  // navigator.clipboard.write([aEl]);
}

/**
 * showMsgOnItem
 * @param {'info'|'error'|'success'} msgType info | error | success
 * @param {string} msgContent
 * @param {HTMLDivElement} itemWrapEl fmuzik-playlist__item--wrap
 */
function showMsgOnItem(msgType, msgContent, itemWrapEl) {
  const msgEl = document.createElement("span");
  msgEl.classList.add("fmuzik-playlist__item--msg");
  itemWrapEl.insertAdjacentElement("afterbegin", msgEl);

  msgEl.textContent = msgContent;
  setTimeout(() => {
    switch (msgType) {
      case MSG_TYPE.SUCCESS:
        msgEl.classList.add("fmuzik-playlist__item--msg-success");
        break;
      case MSG_TYPE.INFO:
        msgEl.classList.add("fmuzik-playlist__item--msg-info");
        break;
      case MSG_TYPE.ERROR:
        msgEl.classList.add("fmuzik-playlist__item--msg-error");
        break;

      default:
        break;
    }
    msgEl.classList.add("fmuzik-playlist__item--msg-active");

    setTimeout(() => {
      msgEl.remove();
    }, 5000);
  }, 100);
}

function shuffleVideos(playlistId) {
  // Get list videos in DOM
  let listItems = document.querySelector(
    `.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`
  )?.children;
  log(listItems);
  if (listItems && listItems.length) {
    // Shuffle the playlist
    listItems = Array.prototype.slice.call(listItems);
    listItems.sort(() => Math.random() - 0.5);

    const listPlayer = document.querySelector(
      `.${CLASS_NAME.PANEL_LIST_PLAYER_VIDEO}`
    );
    const newCurrentPlaylistPlayer = [...currentPlaylistPlayer];
    for (let index = 0; index < listItems.length; index++) {
      const detatchedItem = listPlayer.removeChild(listItems[index]);

      const itemEl = detatchedItem.querySelector(`.${CLASS_NAME.LIST_ITEM}`);
      itemEl.setAttribute(ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST, index);
      const itemVideoId = itemEl.getAttribute(ATTRIBUTE_NAME.FMUZIK_VIDEO_ID);

      listPlayer.appendChild(detatchedItem);

      // Update currentIndexPlaylistVideo
      if (detatchedItem.classList.contains("fmuzik-playlist__item--playing")) {
        currentIndexPlaylistVideo = index;
      }

      // Update new currentPlaylistPlayer
      newCurrentPlaylistPlayer[index] = currentPlaylistPlayer.filter(
        (v) => v.id == itemVideoId
      )[0];
    }
    currentPlaylistPlayer = newCurrentPlaylistPlayer;
  }
}

/**
 * updateIconPlayingOnItem
 * @param {number} currentIndexPlaylistVideoTmp
 */
function updateIconPlayingOnItem(currentIndexPlaylistVideoTmp) {
  const currentVideoPlayingEl = playlistPanel.querySelector(
    ".fmuzik-playlist__item--playing"
  );
  if (currentVideoPlayingEl) {
    currentVideoPlayingEl.classList.remove("fmuzik-playlist__item--playing");
  }

  const itemEl = playlistPanel.querySelector(
    `[${ATTRIBUTE_NAME.VIDEO_INDEX_IN_LIST}="${currentIndexPlaylistVideoTmp}"]`
  );
  if (itemEl) {
    itemEl.parentElement.classList.add("fmuzik-playlist__item--playing");
  }
}

function fmuzikSharingSetup() {
  const fmuzikSharingElements = document.body.querySelectorAll(
    `a[href*="${FMUZIK_TEXT.FMUZIK_PLAYLIST_SHARING_HREF_KEYWORD}"]`
  );
  if (fmuzikSharingElements && fmuzikSharingElements.length > 0) {
    for (let index = 0; index < fmuzikSharingElements.length; index++) {
      const fmuzikSharingEl = fmuzikSharingElements[index];
      if (
        !fmuzikSharingEl.classList.contains("fmuzik-playlist-sharing-item") &&
        fmuzikSharingEl.parentElement.tagName.toLowerCase() == "span" &&
        !fmuzikSharingEl.parentElement.querySelector(
          ".fmuzik-playlist-sharing-item__get-playlist"
        )
      ) {
        fmuzikSharingEl.classList.add("fmuzik-playlist-sharing-item");

        const getPlaylistSharingBtn = document.createElement("button");
        getPlaylistSharingBtn.classList.add(
          "fmuzik-playlist-sharing-item__get-playlist"
        );
        getPlaylistSharingBtn.innerHTML = `<span class="fmuzik-playlist-sharing-item__get-playlist--icon"></span><span class="fmuzik-playlist-sharing-item__get-playlist--label">Save Playlist</span><span class="fmuzik-playlist-sharing-item__get-playlist--icon fmuzik-playlist-sharing-item__get-playlist--icon-save"></span>`;

        getPlaylistSharingBtn.addEventListener("click", (e) => {
          log("getPlaylistSharingBtn clicked");
          const hrefSharing = fmuzikSharingEl.getAttribute("href");

          let playlistDataTrimmed =
            "" +
            hrefSharing
              .replace(new RegExp(`^.*(fmuzikplaylistsharing\.com)`, "g"), "")
              .replace(new RegExp(`(%2F%3Ffmuzik%3D)`, "g"), "")
              .replace(new RegExp(`(fmuzikplaylistsharingend).*`, "g"), "");
          playlistDataTrimmed = decodeURIComponent(playlistDataTrimmed);
          playlistDataTrimmed = decodeURI(playlistDataTrimmed);
          playlistDataTrimmed = playlistDataTrimmed.replace(
            /(\/\?fmuzik\=)/g,
            ""
          );
          log(`fmuzikSharingEl textContent: ${fmuzikSharingEl.textContent}`);
          log(`hrefSharing: ${hrefSharing}`);
          log(`playlistDataTrimmed: ${playlistDataTrimmed}`);

          const playlistDataArr = playlistDataTrimmed.split(
            FMUZIK_TEXT.FMUZIK_PLAYLIST_SHARING_SPLIT_STR
          );
          log(`playlistDataArr: ${playlistDataArr}`);

          // import playlist
          setupSavePlaylistSharing(
            playlistDataArr,
            fmuzikSharingEl.textContent
          );
        });

        fmuzikSharingEl.parentElement.insertAdjacentElement(
          "afterbegin",
          getPlaylistSharingBtn
        );
      }
    }
  }
}

/**
 * Init FMuzik extension
 */
function fmuzikInit() {
  if (!window?.parent?.document.querySelector(".fmuzik-playlist-panel")) {
    setTimeout(() => {
      if (!activeFMuzik) {
        return;
      }

      /**
       * catch url changed
       * https://stackoverflow.com/a/46428962
       */
      let bodyList = document.querySelector("body");

      let isStillSetup = false;
      let isStillScrollSetup = false;

      let observer = new MutationObserver(function (mutations) {
        isStillSetup = true;
        mutations.forEach(function (mutation) {
          // if (oldHref != document.location.href) {
          //   oldHref = document.location.href;
          // }
          /* Changed ! your code here */
          doSetup();
        });
        isStillSetup = false;
      });

      let config = {
        // attributes: true,
        childList: true,
        subtree: true,
      };

      observer.observe(bodyList, config);
      document.addEventListener("scroll", () => {
        if (isStillSetup) {
          return;
        }
        isStillScrollSetup = true;
        isStillSetup = true;
        doSetup();
        isStillSetup = false;
        isStillScrollSetup = false;
      });
    }, 100);
  }
}

function doSetup() {
  // Trigger when navigate to another page
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
    // Setup sharing playlist
    fmuzikSharingSetup();
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

  // Trigger on current page
  if (
    statusInit &&
    oldHref == document.location.href &&
    checkStartCondition()
  ) {
    // Trigger when anything in DOM changed
    // Setup videos
    setupVideos();
    // Setup sharing playlist
    fmuzikSharingSetup();
    if (playlistPanel && playlistPanel.classList.contains("d-none")) {
      playlistPanel.classList.remove("d-none");
    }
    // TODO detect link has fmuzikplaylistsharing.com in href
    // <a class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1fey0fg" href="https://l.workplace.com/l.php?u=http%3A%2F%2Ffmuzikplaylistsharing.com%2F%3Ffmuzik%3D[[N%25C3%2589M%2520C%25C3%2582U%2520Y%25C3%258AU%2520V%25C3%2580O%2520KH%25C3%2594NG%2520TRUNG]]100067557739801%2Fvideos%2F399314322358887&amp;h=AT0S6ZzDrxNoEq7lwK2lxPNi_MIjIwZdlCDBjP_4OqSbPjoBDHXYKSg7O0My2NZxq7XYkCnFi5AN7KDCVayT3DuX3qLzFmxvgkxQDuGeghXHfNeFH86EVqjGJ9M7rfBw2IuPFzX8XPVQUPw5qNLFHQ7rSQJ8OyyGew6jCFo25Lm5iw&amp;__tn__=-UK-R&amp;c[0]=AT1mLn2tG_DyRAiQXycZ-ni1tPJ7Qb2_p8PvnIBUA5WyFG_ClB26_NKt6gkM7FeJcU71KNY5W2kw3DWJRvvqsgroiCgZ-h1Dk7cacOmtZqYe3aIdbzUs0E3VygzKGDSoTwVPjkfAr7qoKATMs-oKEW77yHMMfNlDOhKoY9gzki7dKXyztbbL_958BRhc4HIs" rel="nofollow noreferrer" role="link" tabindex="0" target="_blank">Playlist: Hoàng Dũng | Chia sẻ bởi FMuzik</a>
  }
}

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
    if (typeof data?.favoriteVolume == "number") {
      favoriteVolume = data.favoriteVolume;
    }
  }
  if (typeof data.activePlaylist == "boolean" && data.activePlaylist) {
    activePlaylist = true;
    playlist = data.playlist;
  }
  if (typeof data.loopEnabled == "boolean" && data.loopEnabled) {
    enableLoopVideo = true;
  }
  if (typeof data?.isRatedToFMuzik == "boolean" && data.isRatedToFMuzik) {
    isRatedToFMuzik = true;
  }

  fmuzikInit();
});
//#endregion load function
