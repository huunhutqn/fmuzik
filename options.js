let manifestData = chrome.runtime.getManifest();
const version = manifestData.version;
const prefixWorkplaceUrl = "https://fpt.workplace.com/";
let addAdress = true;

//#region declear function
/**
 * Function show alert
 */
function showAlert(kind, msg) {
  const alert = document.getElementById("alert");
  alert.classList.add("alert-" + kind);
  alert.innerText = msg;
}

/**
 * Function show Loader
 */
function showLoader() {
  const loader = document.getElementById("loader");
  loader.classList.remove("d-none");
}

/**
 * Function hide Loader
 */
function hideLoader() {
  const loader = document.getElementById("loader");
  loader.classList.add("d-none");
}

/**
 * Function hide alert
 */
function hideAlert() {
  const alert = document.getElementById("alert");
  alert.className = "alert";
  alert.innerText = "";
}

/**
 * Function delete workplaceUrl
 */
function deleteWorkplaceUrl(e, workplaceUrl) {
  e.preventDefault();
  chrome.storage.sync.get("workplaceUrl", (data) => {
    if (data && data.workplaceUrl && data.workplaceUrl.length > 0) {
      let workplaceUrls = new Array();
      workplaceUrls = data.workplaceUrl;

      workplaceUrls.splice(workplaceUrls.indexOf(workplaceUrl), 1);
      chrome.storage.sync.set({ workplaceUrl: workplaceUrls });
      showLoader();
      showAlert("success", "Xóa địa chỉ Workplace thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

/**
 * Function cancel edit workplaceUrl
 */
function cancelEditWorkplaceUrl(e, workplaceUrl, idElement) {
  e.preventDefault();
  document.getElementById(idElement).parentElement.classList.add("d-none");
  document.getElementById(idElement).parentElement.previousElementSibling.classList.remove("d-none");
}

/**
 * Function save edit workplaceUrl
 */
function saveEditWorkplaceUrl(e, workplaceUrl, idElement) {
  e.preventDefault();
  chrome.storage.sync.get("workplaceUrl", (data) => {
    if (data && data.workplaceUrl && data.workplaceUrl.length > 0) {
      let workplaceUrls = new Array();
      workplaceUrls = data.workplaceUrl;

      // let oldWorkplaceUrl = workplaceUrl.replace(prefixWorkplaceUrl, "");
      let newWorkplaceUrl = document.getElementById(idElement).value;

      workplaceUrls[workplaceUrls.indexOf(workplaceUrl)] = prefixWorkplaceUrl + newWorkplaceUrl;
      chrome.storage.sync.set({ workplaceUrl: workplaceUrls });
      showLoader();
      showAlert("success", "Lưu địa chỉ Workplace thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

/**
 * Function edit workplaceUrl
 */
function editWorkplaceUrl(e, workplaceUrl, idElement) {
  e.preventDefault();
  document.getElementById(idElement).parentElement.classList.remove("d-none");
  document.getElementById(idElement).parentElement.previousElementSibling.classList.add("d-none");
}

/**
 * Function create delete workplaceUrl button
 */
function deleteWorkplaceUrlBtn(workplaceUrl) {
  const deleleElement = document.createElement("a");
  deleleElement.href = "javascript:void(0)";
  deleleElement.classList.add("workplace-url--delete");
  deleleElement.innerHTML = "Xóa";
  deleleElement.addEventListener("click", (e) => deleteWorkplaceUrl(e, workplaceUrl));
  return deleleElement;
}

/**
 * Function create edit workplaceUrl button
 */
function editWorkplaceUrlBtn(workplaceUrl, idElement) {
  const editElement = document.createElement("a");
  editElement.href = "javascript:void(0)";
  editElement.classList.add("workplace-url--edit", "mr-2");
  editElement.innerHTML = "Sửa";
  editElement.addEventListener("click", (e) => editWorkplaceUrl(e, workplaceUrl, idElement));
  return editElement;
}

/**
 * Function create cancel edit workplaceUrl button
 */
function cancelEditWorkplaceUrlBtn(workplaceUrl, idElement) {
  const cancelEditElement = document.createElement("a");
  cancelEditElement.href = "javascript:void(0)";
  cancelEditElement.classList.add("workplace-url--cancel-update");
  cancelEditElement.innerHTML = "Hủy";
  cancelEditElement.addEventListener("click", (e) => cancelEditWorkplaceUrl(e, workplaceUrl, idElement));
  return cancelEditElement;
}

/**
 * Function create save edit workplaceUrl button
 */
function saveEditWorkplaceUrlBtn(workplaceUrl, idElement) {
  const saveEditElement = document.createElement("a");
  saveEditElement.href = "javascript:void(0)";
  saveEditElement.classList.add("workplace-url--update", "mr-2");
  saveEditElement.innerHTML = "Lưu";
  saveEditElement.addEventListener("click", (e) => saveEditWorkplaceUrl(e, workplaceUrl, idElement));
  return saveEditElement;
}

/**
 * Function click add workplaceUrl event
 */
function addWorkplaceUrlBtn(e) {
  e.preventDefault();
  if (addAdress) {
    // Click add address

    document.querySelector(".workplace-url--group__add-container").classList.remove("d-none");
    document.querySelector("a.workplace-url--add").classList.add("cursor-not-allowed");
    addAdress = false;
  } else {
    // block add address click

    return;
  }
}

/**
 * Function click add workplaceUrl event
 */
function saveAddWorkplaceUrl(e) {
  e.preventDefault();
  let newVal = document.getElementById("workplaceUrl").value;
  if (!newVal || newVal == "") {
    showAlert("danger", "Vui lòng nhập địa chỉ Workplace mới!");
    document.getElementById("workplaceUrl").focus();
    setTimeout(() => {
      hideAlert();
    }, 2000);
    return;
  }
  newVal = prefixWorkplaceUrl + newVal;
  chrome.storage.sync.get("workplaceUrl", (data) => {
    if (data && data.workplaceUrl && data.workplaceUrl.length > 0) {
      const workplaceUrls = data.workplaceUrl;

      if (workplaceUrls.indexOf(newVal) > -1) {
        showAlert("warning", "Địa chỉ Workplace mới đã trùng lặp, hãy thử địa chỉ khác!");
        document.getElementById("workplaceUrl").focus();
        setTimeout(() => {
          hideAlert();
        }, 2000);
        return;
      } else {
        workplaceUrls.push(newVal);
        chrome.storage.sync.set({ workplaceUrl: workplaceUrls });

        showLoader();
        showAlert("success", "Đã thêm mới địa chỉ Workplace thành công!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } else {
      chrome.storage.sync.set({ workplaceUrl: [newVal] });

      showLoader();
      showAlert("success", "Đã thêm mới địa chỉ Workplace thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

/**
 * Function click cancel add workplaceUrl event
 */
function cancelAddWorkplaceUrl(e) {
  e.preventDefault();

  document.querySelector(".workplace-url--group__add-container").classList.add("d-none");
  document.querySelector("a.workplace-url--add").classList.remove("cursor-not-allowed");
  addAdress = true;
}

/**
 * Function init workplace URL list
 */
function workplaceUrlInit() {
  const workplaceUrlGroupContainer = document.querySelector(".workplace-url--group-container");
  chrome.storage.sync.get("workplaceUrl", (data) => {
    if (data && data.workplaceUrl && data.workplaceUrl.length > 0) {
      const workplaceUrls = data.workplaceUrl;

      workplaceUrls.forEach((workplaceUrl, index) => {
        const deleleElement = deleteWorkplaceUrlBtn(workplaceUrl);
        const editElement = editWorkplaceUrlBtn(workplaceUrl, `workplaceUrl_${index}`);
        const cancelEditElement = cancelEditWorkplaceUrlBtn(workplaceUrl, `workplaceUrl_${index}`);
        const saveEditElement = saveEditWorkplaceUrlBtn(workplaceUrl, `workplaceUrl_${index}`);
        const workplaceUrlGroup = document.createElement("div");
        workplaceUrlGroup.innerHTML = `
          <div class="workplace-url--group justify-content-between mb-2">
            <p class="workplace-url mb-0">${workplaceUrl}</p>
            <div class="workplace-url--group__modify">
            </div>
          </div>
          <div class="workplace-url--group__edit-container input-group mb-2 d-none">
            <div class="input-group-prepend">
              <div class="input-group-text">https://fpt.workplace.com/</div>
            </div>
            <input type="text" class="form-control" id="workplaceUrl_${index}" placeholder="groups/TênIdGroup" value="${workplaceUrl.replace(
          "https://fpt.workplace.com/",
          ""
        )}" />
              <div class="workplace-url--group__edit">
              </div>
          </div>
        `;
        workplaceUrlGroup.getElementsByClassName("workplace-url--group__modify")[0].appendChild(editElement);
        workplaceUrlGroup.getElementsByClassName("workplace-url--group__modify")[0].appendChild(deleleElement);
        workplaceUrlGroup.getElementsByClassName("workplace-url--group__edit")[0].appendChild(saveEditElement);
        workplaceUrlGroup.getElementsByClassName("workplace-url--group__edit")[0].appendChild(cancelEditElement);
        workplaceUrlGroupContainer.insertAdjacentElement("beforeend", workplaceUrlGroup);
      });
    }
  });
  document.querySelector("a.workplace-url--add").addEventListener("click", (e) => addWorkplaceUrlBtn(e));
  document.querySelector("a.workplace-url--save-add").addEventListener("click", (e) => saveAddWorkplaceUrl(e));
  document.querySelector("a.workplace-url--cancel-save-add").addEventListener("click", (e) => cancelAddWorkplaceUrl(e));
}

/**
 * Function set on/off Loop Video on init
 */
function setupOnOffLoopVideo() {
  const enableLoop = document.getElementById("fmuzik-enable-loop");
  chrome.storage.sync.get("loopEnabled", (data) => {
    if (data && typeof data.loopEnabled == "boolean" && data.loopEnabled === true) {
      enableLoop.setAttribute("checked", "true");
    }
  });
  enableLoop.addEventListener("change", (e) => {
    chrome.storage.sync.set({ loopEnabled: e.target.checked });
  });
}

/**
 * Function setup active FMuzik on init
 */
function setupActiveFMuzik() {
  const active = document.getElementById("fmuzik-active");
  const activeLogo = document.getElementById("fmuzik-logo-active");
  const inactiveLogo = document.getElementById("fmuzik-logo-inactive");
  chrome.storage.sync.get("active", (data) => {
    if (data && typeof data.active == "boolean" && data.active === true) {
      active.setAttribute("checked", "true");
    }
  });
  active.addEventListener("change", (e) => {
    chrome.storage.sync.set({ active: e.target.checked });
    if (e.target.checked) {
      inactiveLogo.classList.add("d-none");
      activeLogo.classList.remove("d-none");
      // change icon
      chrome.action.setIcon({
        path: {
          16: "/images/icon16.png",
          32: "/images/icon32.png",
          48: "/images/icon48.png",
          128: "/images/icon128.png",
        },
      });
    } else {
      activeLogo.classList.add("d-none");
      inactiveLogo.classList.remove("d-none");
      // change icon
      chrome.action.setIcon({
        path: {
          16: "/images/icon16x.png",
          32: "/images/icon32x.png",
          48: "/images/icon48x.png",
          128: "/images/icon128x.png",
        },
      });
    }
  });
}

/**
 * Function setup active playlist on init
 */
function setupActivePlaylist() {
  const activePlaylist = document.getElementById("fmuzik-playlist-active");
  chrome.storage.sync.get("activePlaylist", (data) => {
    if (data && data.activePlaylist && data.activePlaylist === true) {
      activePlaylist.setAttribute("checked", "true");
    }
  });
  activePlaylist.addEventListener("change", (e) => {
    chrome.storage.sync.set({ activePlaylist: e.target.checked });
  });
}

/**
 * Function setup event listener on init
 */
function setupEventListener() {}

/**
 * Function setup FMuzik everywhere
 */
function setupFMuzikEverywhere() {
  const fmuzikEverywhere = document.getElementById("fmuzik-everywhere");
  const workplaceUrlGroupContainer = document.querySelector(".workplace-url--group-container");
  chrome.storage.sync.get("fmuzikEverywhere", (data) => {
    if (data && data.fmuzikEverywhere && data.fmuzikEverywhere === true) {
      fmuzikEverywhere.setAttribute("checked", "true");
      workplaceUrlGroupContainer.setAttribute("style","pointer-events: none");
    }
  });
  fmuzikEverywhere.addEventListener("change", (e) => {
    chrome.storage.sync.set({ fmuzikEverywhere: e.target.checked });
    if (e.target.checked) {
      workplaceUrlGroupContainer.setAttribute("style","pointer-events: none");
    } else {
      workplaceUrlGroupContainer.setAttribute("style","pointer-events: auto");
    }
  });
}

/**
 * Function init
 */
function init() {
  showLoader();
  /** Set version */
  const fmuzikVersion = document.getElementById("fmuzik-version");
  fmuzikVersion.innerHTML = version;

  /** Show list URL */
  workplaceUrlInit();

  /** Setup on/off lopp Video */
  setupOnOffLoopVideo();

  /** Setup active FMuzik */
  setupActiveFMuzik();

  /** Setup active playlist */
  setupActivePlaylist();

  /** Setup FMuzik everywhere */
  setupFMuzikEverywhere();

  /** Setup event listener */
  setupEventListener();

  setTimeout(() => {
    hideLoader();
  }, 500);
}
//#endregion declear function

//#region load function
init();
//#endregion load function
