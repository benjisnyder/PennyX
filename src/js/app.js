import { ek } from "./ek";

(function () {
  // App specific code
  var g_data = [
    {
      label: "Home",
      id: "home",
      fragment: "home",
      icon: "home",
      closable: false,
      relatedTo: "home",
      isAppTab: true
    },
    {
      label: "Search",
      id: "search",
      fragment: "search",
      icon: "search",
      closable: false,
      relatedTo: "search",
      isAppTab: true
    },
    {
      label: "Message Center",
      id: "messages",
      fragment: "messages",
      icon: "message",
      closable: false,
      relatedTo: "messages",
      isAppTab: true
    },
    {
      label: "Enrique Romero",
      id: "1",
      fragment: "member1",
      icon: "person_outline",
      relatedTo: "1"
    },
    {
      label: "Loan #444555",
      id: "1-loan",
      fragment: "subtabview",
      relatedTo: "1"
    },
    {
      label: "New Dispute",
      id: "1-new-dispute",
      fragment: "subtabview",
      relatedTo: "1"
    },
    {
      label: "Edit Member",
      id: "1-edit-member",
      fragment: "subtabview",
      relatedTo: "1"
    }
  ];

  /*
  START: Penny specific functions
  */

  function getOpenWorkspaceView(record) {
    return document.querySelector("#ek-workspace-" + record.id);
  }

  function getOpenWorkspaceTab(record) {
    return document.querySelector("#ek-workspace-tab-" + record.id);
  }

  function selectWorkspace(record, callback) {
    var views = document.querySelectorAll(".ek-workspace");
    var viewToSelect = getOpenWorkspaceView(record);
    var tabs = document.querySelectorAll("#ek-workspace-tabs li");
    var tabToSelect = getOpenWorkspaceTab(record);
    var selCls = "ek-selected-true";

    if (views && viewToSelect && tabs && tabToSelect) {
      ek.util.switchClass(views, viewToSelect, selCls);
      ek.util.switchClass(tabs, tabToSelect, selCls);
      if (callback) {
        callback();
      }
    }
  }

  function loadWorkspace(record, doSelect, callback) {
    ek.util.toggleLoader(true);
    ek.util.loadFragment({
      target: "#ek-workspace-tabs",
      fragment: "workspacetab",
      data: record,
      callback: function () {
        ek.util.loadFragment({
          target: "#ek-workspaces",
          fragment: record.isAppTab ? record.fragment : "workspace",
          data: record,
          callback: function () {
            if (doSelect !== false) {
              selectWorkspace(record, callback);
            }
            ek.util.toggleLoader(false);
          }
        });
      }
    });
  }

  function openWorkspace(id, doSelect, callback) {
    var record = g_data.find((element) => element.id === id);
    doSelect = doSelect === false ? false : true;

    // parent record could be itself, we store its own id in relatedTo if it should open as its own workspace
    var parentRecord = g_data.find(
      (element) => element.id === record.relatedTo
    );

    if (getOpenWorkspaceView(parentRecord)) {
      selectWorkspace(parentRecord, callback);
    } else {
      loadWorkspace(parentRecord, doSelect, callback);
    }
  }

  function closeWorkspace(id) {
    var match = g_data.find((element) => element.id === id);
    var targetView = getOpenWorkspaceView(match);
    var targetTab = getOpenWorkspaceTab(match);
    var tabs = document.getElementById("ek-workspace-tabs");
    var newTabToSelectData;

    targetView.remove();
    targetTab.remove();

    newTabToSelectData = tabs
      .querySelectorAll("li:last-of-type .ek-action-open-record")[0]
      .getAttribute("data-ek"); // select the last tab at the end and extract the target record ID

    openRecord(JSON.parse(newTabToSelectData).id);
  }

  // Returns a dom element if the subtab is open somwewhere
  function getOpenSubtabView(record) {
    return document.querySelector("#ek-subtab-view-" + record.id);
  }

  function getOpenSubtab(record) {
    return document.querySelector("#ek-subtab-" + record.id);
  }

  function selectSubtab(record, callback) {
    var views = document.querySelectorAll(
      "#ek-subtab-views-" + record.relatedTo + " .ek-sub-tab-view"
    );
    var viewToSelect = getOpenSubtabView(record);
    var tabs = document.querySelectorAll(
      "#ek-subtabs-" + record.relatedTo + " li"
    );
    var tabToSelect = getOpenSubtab(record);
    var selCls = "ek-selected-true";

    if (viewToSelect) {
      ek.util.switchClass(views, viewToSelect, selCls);
      ek.util.switchClass(tabs, tabToSelect, selCls);
      if (callback) {
        callback();
      }
    }
  }

  function loadSubtab(record, callback) {
    ek.util.toggleLoader(true);
    ek.util.loadFragment({
      target: "#ek-subtabs-" + record.relatedTo,
      fragment: "subtab",
      data: record,
      callback: function () {
        ek.util.loadFragment({
          target: "#ek-subtab-views-" + record.relatedTo,
          fragment: record.fragment,
          data: record,
          callback: function () {
            selectSubtab(record, callback);
            ek.util.toggleLoader(false);
          }
        });
      }
    });
  }

  function openSubtab(id, callback) {
    var record = g_data.find((element) => element.id === id);
    var parentRecord = g_data.find(
      (element) => element.id === record.relatedTo
    );

    if (record.isAppTab) {
      return;
    }

    function doOpenSubtab() {
      if (getOpenSubtabView(record)) {
        selectSubtab(record, callback);
      } else {
        loadSubtab(record, callback);
      }
    }

    // check if parent record subtab is open yet and
    // make sure the parent record always opens as the first tab
    // (if, for instance user is opening a Loan record directly)
    if (getOpenSubtabView(parentRecord) === null) {
      loadSubtab(parentRecord, doOpenSubtab);
    } else {
      doOpenSubtab();
    }
  }

  function closeSubtab(id) {
    var match = g_data.find((element) => element.id === id);
    var targetView = getOpenSubtabView(match);
    var targetTab = getOpenSubtab(match);
    var tabs = targetTab.closest(".ek-sub-tabs");
    var newTabToSelectData;

    if (match.id === match.relatedTo) {
      // it's the primary subtab, so close the workspace
      if (window.confirm("Close workspace?")) {
        closeWorkspace(id);
      }
    } else {
      targetView.remove();
      targetTab.remove();

      newTabToSelectData = tabs
        .querySelectorAll("li:last-of-type .ek-action-open-record")[0]
        .getAttribute("data-ek"); // select the last tab at the end and extract the target record ID

      openRecord(JSON.parse(newTabToSelectData).id);
    }
  }

  function openRecord(id) {
    var match = g_data.find((element) => element.id === id);

    if (typeof match === "undefined") {
      return; // no data
    }

    openWorkspace(match.id, true, function () {
      openSubtab(match.id, function () {});
    });
  }

  /*
  END: Penny specific functions
  */

  /*
  START: Wiring of events and ek actions
  */

  // Mock DB query w/ test data, loading data like this for now
  /*g_data.records.forEach((record) => {
    if (!record.relatedTo) {
      // if the record is not relatedTo to another (that is, it should not open in a subtab) open in a workspace
      openWorkspace(record);
    }
  });*/

  openRecord("1"); // for testing
  /*openWorkspace("home");
  openWorkspace("search", false);
  openWorkspace("messages", false);*/

  g_data.forEach((record) => {
    /* TODO: load subtabs from memory, if needed (not yet storing UI state in memory though) */
    /*if (record.relatedTo) {
      // if the record is not relatedTo to another (that is, it should not open in a subtab) open in a workspace
      openSubtab(record);
    }*/
  });

  ek.addClickState({
    name: "ek-action-open-record",
    enter: function (e, data) {
      data = JSON.parse(data);

      openRecord(data.id);
    }
  });

  ek.addClickState({
    name: "ek-action-toggle-class",
    enter: function (e, data) {
      data = JSON.parse(data);
      var target = document.querySelector(data.target);

      target.classList.toggle(data.cls);
    }
  });

  ek.addClickState({
    name: "ek-action-close-subtab",
    enter: function (e, data) {
      data = JSON.parse(data);

      closeSubtab(data.id);
    }
  });

  ek.addClickState({
    name: "ek-action-close-workspace",
    enter: function (e, data) {
      data = JSON.parse(data);

      closeWorkspace(data.id);
    }
  });

  ek.addClickState({
    name: "ek-action-tab",
    enter: function (e, data) {
      var target = e.target;
      var tabContainer = target.closest(".ek-tabs");
      var tabUl = target.closest(".ek-tabs > ul");
      var tabs = tabUl.querySelectorAll("li");
      var clickedLi = target.closest("li");
      var clickedIndex = Array.prototype.indexOf.call(
        tabUl.children,
        clickedLi
      );
      var tabViews = tabContainer.querySelectorAll(":scope > div");
      var tabViewToSelect = tabViews[clickedIndex];
      var selCls = "ek-selected-true";

      ek.util.switchClass(tabViews, tabViewToSelect, selCls);
      ek.util.switchClass(tabs, clickedLi, selCls);
    }
  });
  /*
  END: Wiring of events and ek actions
  */
})();
