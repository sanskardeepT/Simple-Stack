(function () {
  var script = document.currentScript;
  var projectId = script && script.getAttribute("data-project");
  var apiKey = script && script.getAttribute("data-api-key");
  var apiBase = script && script.getAttribute("data-api-base");

  if (!projectId) {
    console.warn("[SimpleStack] data-project is required.");
    return;
  }

  apiBase = apiBase || "https://api.simplestack.in/api/v1";

  function request(path, options) {
    var url = apiBase + "/public/" + projectId + path;
    if (apiKey) {
      url += (url.indexOf("?") === -1 ? "?" : "&") + "apiKey=" + encodeURIComponent(apiKey);
    }
    return fetch(url, options).then(function (response) {
      if (!response.ok) throw new Error("SimpleStack request failed: " + response.status);
      return response.json();
    }).then(function (payload) {
      return payload.data;
    });
  }

  window.SimpleStack = {
    projectId: projectId,
    getContentTypes: function () {
      return request("/content-types");
    },
    getEntries: function (contentTypeSlug) {
      return request("/entries/" + encodeURIComponent(contentTypeSlug));
    },
    refresh: function () {
      return request("/heartbeat", { method: "POST" });
    },
  };

  window.SimpleStack.refresh().catch(function () {});
  window.dispatchEvent(new CustomEvent("simplestack:ready", { detail: window.SimpleStack }));
})();
