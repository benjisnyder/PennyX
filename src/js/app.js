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
      hasOwnSubtabs: true
    },
    {
      label: "Enrique Desperado",
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
    }
  ];

  /*
  START: Penny specific functions
  */

  function getOpenWorkspace(record) {
    return document.querySelector("#ek-workspace-" + record.id);
  }

  function selectWorkspace(record, callback) {
    var views = document.querySelectorAll(".ek-workspace");
    var viewToSelect = getOpenWorkspace(record);
    var tabs = document.querySelectorAll("#ek-workspace-tabs li");
    var tabToSelect = document.querySelector("#ek-workspace-tab-" + record.id);
    var selCls = "ek-selected-true";

    if (views && viewToSelect && tabs && tabToSelect) {
      ek.util.switchClass(views, viewToSelect, selCls);
      ek.util.switchClass(tabs, tabToSelect, selCls);
      if (callback) {
        callback();
      }
    }
  }

  function loadWorkspace(record, callback) {
    ek.util.loadFragment({
      target: "#ek-workspace-tabs",
      fragment: "workspacetab",
      data: record,
      callback: function () {
        ek.util.loadFragment({
          target: "#ek-workspaces",
          fragment: record.hasOwnSubtabs ? record.fragment : "workspace",
          data: record,
          callback: function () {
            selectWorkspace(record, callback);
          }
        });
      }
    });
  }

  function openWorkspace(id, callback) {
    var record = g_data.find((element) => element.id === id);
    // parent record could be itself, we store its own id in relatedTo if it should open as its own workspace
    var parentRecord = g_data.find(
      (element) => element.id === record.relatedTo
    );

    if (getOpenWorkspace(parentRecord)) {
      selectWorkspace(parentRecord, callback);
    } else {
      loadWorkspace(parentRecord, callback);
    }
  }

  function getOpenSubtab(record) {
    return document.querySelector("#ek-subtab-view-" + record.id);
  }

  function selectSubtab(record, callback) {
    var views = document.querySelectorAll(
      "#ek-subtab-views-" + record.relatedTo + " .ek-sub-tab-view"
    );
    var viewToSelect = getOpenSubtab(record);
    var tabs = document.querySelectorAll(
      "#ek-subtabs-" + record.relatedTo + " li"
    );
    var tabToSelect = document.querySelector("#ek-subtab-" + record.id);
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

    if (record.hasOwnSubtabs) {
      return;
    }

    function doOpenSubtab() {
      if (getOpenSubtab(record)) {
        selectSubtab(record, callback);
      } else {
        loadSubtab(record, callback);
      }
    }

    // check if parent record subtab is open yet and
    // make sure the parent record always opens as the first tab
    // (if, for instance user is opening a Loan record directly)
    if (getOpenSubtab(parentRecord) === null) {
      loadSubtab(parentRecord, doOpenSubtab);
    } else {
      doOpenSubtab();
    }
  }

  function openRecord(id) {
    var match = g_data.find((element) => element.id === id);

    if (typeof match === "undefined") {
      return; // no data
    }

    openWorkspace(match.id, function () {
      openSubtab(match.id);
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

  openWorkspace("home");

  g_data.forEach((record) => {
    /* TODO: load subtabs from memory, if needed (not yet storing UI state in memory though) */
    /*if (record.relatedTo) {
      // if the record is not relatedTo to another (that is, it should not open in a subtab) open in a workspace
      openSubtab(record);
    }*/
  });

  ek.addClickState({
    name: "ek-action-open-record",
    enter: function (data) {
      data = JSON.parse(data);

      openRecord(data.id);
    }
  });

  ek.addClickState({
    name: "ek-action-toggle-class",
    enter: function (data) {
      data = JSON.parse(data);
      var target = document.querySelector(data.target);

      target.classList.toggle(data.cls);
    }
  });

  /*
  END: Wiring of events and ek actions
  */
})();
