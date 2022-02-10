// Reusable toolkit for prototpying
// Keep any specific app code out here

var ek = {};
export { ek };

// Private setup and methods

ek.util = {};
ek._ = {};

ek._.paths = {};
ek._.paths.fragments = "src/fragments/";
ek._.init = function (obj) {
  document.onclick = ek._.handleClicks;
};

ek._.handleClicks = function (e) {
  var optionalData = e.target.getAttribute("data-ek");

  e.target.classList.forEach((element) => {
    if (typeof ek._.clickStates[element] !== "undefined") {
      ek._.clickStates[element].enter(e, optionalData);
    }
  });

  e.preventDefault();
  return false;
};

/* 
Click States can be called from a dom element by applying the state name as a css class like:
<a class="ek-state-name" data-ek="'{...}'">Click</href>
Clicking this link will call the state named 'ek-state-name' and pass in the JSON string from 'data-ek'
*/

ek._.clickStates = {};

ek._.ClickState = {
  name: "",
  enter: function () {}
};

/* addClickState {name str, enter func} */
ek.addClickState = function (obj) {
  ek._.clickStates[obj.name] = Object.create(ek._.ClickState);

  if (obj.enter) {
    ek._.clickStates[obj.name].enter = obj.enter;
  }
};

/* loadFragment (target str = css query; fragment str = html file name; callback func; doReplace bool; data obj;) */
ek.util.loadFragment = function (obj) {
  var target, fragment, doReplace, xhr;

  if (obj.target && obj.fragment) {
    target =
      typeof obj.target === "string"
        ? document.querySelector(obj.target)
        : obj.target;
    fragment = obj.fragment;
    doReplace = obj.replace ? obj.replace : false;
    xhr = new XMLHttpRequest();

    xhr.open("GET", `${ek._.paths.fragments + fragment}.html`, true);
    xhr.onreadystatechange = function () {
      var retString = "";
      var placeholders = "";
      var reg = /{{([^}]+)}}/g; // find all instances of {{*}} placeholders in fragment

      if (this.readyState !== 4) return;
      if (this.status !== 200) {
        return; // do something w/ error sometime
      }

      retString = this.responseText;
      placeholders = retString.match(reg);

      if (placeholders === null) {
        return;
      }

      placeholders.forEach((item) => {
        var val = item.match(/(?<=\{{).+?(?=\}})/g); // get just the string inside the {{*}}

        // check if the data provider has a property by that name
        if (
          val.length > 0 &&
          typeof obj.data !== "undefined" &&
          typeof obj.data[val[0]] !== "undefined"
        ) {
          // if it does, replace the full instance of {{*}} with the value from the data provider
          retString = retString.replace(item, obj.data[val[0]].toString());
        } else {
          // replace the token with an empty string
          retString = retString.replace(item, "");
        }
      });

      if (doReplace) {
        target.innerHTML = retString;
      } else {
        target.insertAdjacentHTML("beforeend", retString);
      }
    };
    xhr.send();
    xhr.onloadend = obj.callback ? obj.callback : null;
  }
};

ek.util.switchClass = function (elements, element, cls) {
  elements.forEach((element) => {
    element.classList.remove(cls);
  });

  element.classList.add(cls);
};

ek.util.stringToHtml = function (string) {
  var template = document.createElement("template");
  string = string.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = string;
  return template.content.firstChild;
};

ek.util.toggleLoader = function (visibility) {
  var loader = document.getElementById("ek-view-loader"); // assume the loader dom element is in the markup...
  var cls = "ek-visible-false";

  if (loader === null) {
    loader = ek.util.stringToHtml(
      '<div id="ek-view-loader" class="ek-visible-false"><img src="src/assets/ek-loading-1.gif" /></div>'
    );
    document.body.appendChild(loader);
  }

  if (visibility) {
    loader.classList.remove(cls);
  } else {
    loader.classList.add(cls);
  }
};

(function () {
  ek._.init();
})();
