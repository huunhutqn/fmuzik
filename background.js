const defaultWorkplaceUrl = "https://fpt.workplace.com/groups/muzikinmymind";
const defaultWorkplaceUrl1 = "https://fpt.workplace.com/groups/983546785133426";
const iframeHosts = ["*fpt.workplace.com*", "*fpt.m.workplace.com*", "https://fpt.workplace.com"];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("workplaceUrl", (data) => {
    if (!data || !data.workplaceUrl || data.workplaceUrl.length == 0) {
      chrome.storage.sync.set({ workplaceUrl: [defaultWorkplaceUrl, defaultWorkplaceUrl1] });
    }
  });
  chrome.storage.sync.set({ active: true });

  chrome.action.onClicked.addListener((tab) => {
    //alert("icon clicked");
    chrome.storage.sync.get((data) => {
      if (data.active) {
        chrome.storage.sync.set({ active: false });
        // change icon
        chrome.action.setIcon({
          path: {
            16: "/images/icon16x.png",
            32: "/images/icon32x.png",
            48: "/images/icon48x.png",
            128: "/images/icon128x.png",
          },
        });
      } else {
        chrome.storage.sync.set({ active: true });
        // change icon
        chrome.action.setIcon({
          path: {
            16: "/images/icon16.png",
            32: "/images/icon32.png",
            48: "/images/icon48.png",
            128: "/images/icon128.png",
          },
        });
      }
      chrome.tabs.reload(tab.id);
    });
  });

  //https://stackoverflow.com/questions/15532791/getting-around-x-frame-options-deny-in-a-chrome-extension/69177790#69177790
  const iframeHosts = ["fpt.workplace.com", "fpt.m.workplace.com", "fbcdn.net", "https://fpt.workplace.com"];
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: iframeHosts.map((h, i) => i + 1),
    addRules: iframeHosts.map((h, i) => ({
      id: i + 1,
      condition: {
        domains: iframeHosts,
        urlFilter: `||${h}/`,
        resourceTypes: ["sub_frame"],
      },
      action: {
        type: "modifyHeaders",
        responseHeaders: [
          { header: "X-Frame-Options", operation: "remove" },
          { header: "Frame-Options", operation: "remove" },
        ],
      },
    })),
  });
});
