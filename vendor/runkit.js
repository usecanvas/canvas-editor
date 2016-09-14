(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a)
                    return a(o, !0);
                if (i)
                    return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND",
                f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)
        s(r[o]);
    return s
})({
    "/app/embed-client.js": [function(require, module, exports) {
        var __hoisted_0 = function(e) {
            return !!e
        }
          , __hoisted_1 = function(e) {
            return "env[]=" + encodeURIComponent(e)
        }
          , __hoisted_2 = function(e) {
            this._sendMessage({
                method: "get_source"
            }, e)
        }
          , __hoisted_3 = function(e, t) {
            this._sendMessage({
                method: "set_source",
                source: e
            }, t)
        }
          , __hoisted_4 = function(e, t) {
            this._sendMessage({
                method: "set_preamble",
                source: e
            }, t)
        }
          , __hoisted_5 = function(e) {
            this._sendMessage({
                method: "evaluate"
            }, e)
        }
          , __hoisted_6 = function(e) {
            var t = e.textContent || e.innerText || "";
            t = t.replace(/\r\n/g, "\n"),
            t = t.replace(/\r/g, "\n");
            for (var n = t.split("\n"); n.length && 0 === n[0].trim().length; )
                n.shift();
            var o = n.length > 0 && n[0].length - n[0].replace(/^\s+/, "").length;
            return n.map(function(e) {
                return e.substring(0, o).match(/[^\s]/) ? e : e.substring(o)
            }).join("\n")
        }
          , __hoisted_7 = function(e) {
            return /^data-env-/.test(e.name)
        }
          , __hoisted_8 = function(e) {
            return e.name.replace("data-env-", "").toLowerCase() + "=" + e.value
        }
          , __hoisted_9 = function() {
            "use strict";
            function e() {
                function e() {
                    window[a] && window[a]()
                }
                var t = document.createElement('script');
                n = !0;
                var o = t.getAttribute("data-element-id")
                  , i = t.getAttribute("data-notebook-url")
                  , a = t.getAttribute("data-load-callback")
                  , r = t.getAttribute("data-node-version")
                  , s = t.getAttribute("data-title")
                  , d = t.getAttribute("data-mode")
                  , l = [].filter.call(t.attributes, __hoisted_7).map(__hoisted_8);
                if (o || i) {
                    var u = o && document.getElementById(o)
                      , c = t.hasAttribute("data-read-only");
                    if (u) {
                        var h = RunKit.sourceFromElement(u);
                        u.innerHTML = ""
                    } else
                        u = document.createElement("div"),
                        u.className = "runkit-notebook-container",
                        t.parentNode.replaceChild(u, t);
                    RunKit.createNotebook({
                        element: u,
                        source: h,
                        notebookURL: i,
                        readOnly: c,
                        env: l,
                        mode: d,
                        nodeVersion: r,
                        title: s,
                        onLoad: a && e
                    })
                }
            }
            var n = !1;
            if (!window.RunKit || !window.Tonic) {
                var i = document.createElement("a");
                i.href = "https://embed.runkit.com";
                var a = i.host.split(".");
                0 === a[0].indexOf("qa") ? a[0] = "qa" : 3 === a.length && (a = a.slice(1)),
                "tonicdev" === a[0] && (a[0] = "runkit");
                var r = "https://" + a.join(".")
                  , s = 0
                  , d = 1
                  , l = {}
                  , u = function(e) {
                    var t = this.name = "runkit-embed-" + (s++).toString();
                    window.RunKit["$" + t] = this;
                    var n = e.element
                      , o = e.source
                      , i = e.readOnly
                      , a = (e.mode,
                    e.notebookURL)
                      , d = e.nodeVersion
                      , u = e.title
                      , c = 130
                      , h = 40
                      , _ = e.preamble;
                    if (o && (c = Math.max(21 * o.split("\n").length + 42, c)),
                    a) {
                        var m = a.split("/");
                        if ("" === m[0] && m.shift(),
                        "" === m[m.length - 1] && m.pop(),
                        m.length < 2)
                            a = null ;
                        else {
                            var p = m[0]
                              , g = m[1]
                              , v = ["", "users", p, "repositories", g];
                            v = v.concat(m.length > 2 ? m.slice(2) : ["branches", "master"]),
                            a = v.join("/")
                        }
                    }
                    var f = {
                        name: t,
                        notebook: a,
                        preamble: (_ || "").trim(),
                        source: (o || "").trim(),
                        location: window.location.toString(),
                        readOnly: i,
                        mode: e.mode,
                        nodeVersion: d,
                        sendResults: !!e.onResult,
                        title: u
                    }
                      , b = "?" + Object.keys(f).map(function(e) {
                        return void 0 !== f[e] && null !== f[e] ? e + "=" + encodeURIComponent(f[e]) : void 0
                    }).filter(__hoisted_0).join("&");
                    Array.isArray(e.env) && (b += "&" + e.env.map(__hoisted_1).join("&"));
                    var w = this.iframe = document.createElement("iframe");
                    w.src = r + "/e" + b,
                    w.style.height = c + h + "px",
                    w.style.width = "100%",
                    w.style.width = "calc(100% + 200px)",
                    w.style.padding = "0px",
                    w.style.margin = "0px",
                    w.style.marginLeft = "calc(-100px)",
                    w.style.border = "0px",
                    w.style.backgroundColor = "transparent",
                    w.frameBorder = "0",
                    w.allowTransparency = "true",
                    w.name = t,
                    n.appendChild(w);
                    var y = require("object-serialization/lib/from-object-serialization")
                      , k = require("object-description/lib/revive");
                    window.addEventListener("message", function(n) {
                        try {
                            if (n.origin !== r)
                                return;
                            var o = JSON.parse(n.data);
                            if (o && o.name === t)
                                switch (o.event) {
                                case "height":
                                    w.style.height = o.height + h + "px";
                                    break;
                                case "loaded":
                                    e.onLoad && e.onLoad(this);
                                    break;
                                case "url":
                                    this.URL = r + o.url,
                                    this.endpointURL = "https://runkit.io" + o.url,
                                    e.onURLChanged && e.onURLChanged(this);
                                    break;
                                case "evaluate":
                                    this.evaluationID = o.evaluationID,
                                    e.onEvaluate && e.onEvaluate(this.evaluationID);
                                    break;
                                case "result":
                                    if (e.onResult) {
                                        var i = y(o.result.value);
                                        k(i),
                                        o.result.value = i,
                                        e.onResult(o.result)
                                    }
                                    break;
                                case "callback":
                                    var a = l[o.message_id];
                                    delete l[o.message_id],
                                    a(o.message)
                                }
                        } catch (s) {}
                    }
                    .bind(this))
                }
                ;
                u.prototype._sendMessage = function(e, t) {
                    var n = d++;
                    l[n] = t;
                    var o = {
                        name: this.name,
                        message_id: n,
                        message: e
                    };
                    this.iframe.contentWindow.postMessage(JSON.stringify(o), r)
                }
                ,
                u.prototype.getSource = __hoisted_2,
                u.prototype.setSource = __hoisted_3,
                u.prototype.setPreamble = __hoisted_4,
                u.prototype.evaluate = __hoisted_5,
                window.RunKit = {
                    createNotebook: function(e) {
                        return new u(e)
                    },
                    sourceFromElement: __hoisted_6
                },
                window.Tonic = window.RunKit
            }
            "complete" === document.readyState ? e() : window.addEventListener("load", e)
        }
        ;
        __hoisted_9();
    }
    , {
        "object-description/lib/revive": "/app/node_modules/object-description/lib/revive.js",
        "object-serialization/lib/from-object-serialization": "/app/node_modules/object-serialization/lib/from-object-serialization.js"
    }],
    "/app/node_modules/object-description/lib/regexp.js": [function(require, module, exports) {
        module.exports.source = function(e) {
            return e.regex ? e.regex.source : e.properties["@source"] ? e.properties["@source"].value.value : ""
        }
        ,
        module.exports.flags = function(e) {
            return e.regex ? (e.regex.global ? "g" : "") + (e.regex.multiline ? "m" : "") + (e.regex.ignoreCase ? "i" : "") + (e.regex.sticky ? "y" : "") + (e.regex.unicode ? "u" : "") : (e.properties["@global"] && e.properties["@global"].value.value ? "g" : "") + (e.properties["@ignoreCase"] && e.properties["@ignoreCase"].value.value ? "i" : "") + (e.properties["@multiline"] && e.properties["@multiline"].value.value ? "m" : "")
        }
        ;
    }
    , {}],
    "/app/node_modules/object-description/lib/revive.js": [function(require, module, exports) {
        function fromObjectDescription(e) {
            if (hasOwnProperty.call(e, "value"))
                return e.value;
            if ("undefined" === e.type)
                return void 0;
            var r = instantiateObject(e);
            return e.value = r,
            assignProperties(e, r),
            r
        }
        function instantiateObject(e) {
            if (e.isStringObject)
                return new String(e.valueOf.value);
            if (e.isNumberObject)
                return new Number(e.valueOf.value);
            if (e.isBooleanObject)
                return new Boolean(e.valueOf.value);
            if (e.isArray)
                return new Array(e.properties["@length"].value.value);
            if (e.isRegExp) {
                var r = RegExpUtils.flags(e)
                  , t = RegExpUtils.source(e);
                return new RegExp(t,r)
            }
            return e.isDate ? new Date(e.numberValue.value) : {}
        }
        function assignProperties(e, r) {
            if (e.properties)
                for (var t = e.properties, a = Object.keys(t), n = 0, i = a.length; i > n; ++n) {
                    var u = a[n]
                      , l = t[u];
                    (!hasOwnProperty.call(l, "flags") || l.flags & enumerable) && hasOwnProperty.call(l, "value") && (r[l.key] = fromObjectDescription(l.value))
                }
        }
        var RegExpUtils = require("./regexp")
          , hasOwnProperty = Object.prototype.hasOwnProperty
          , missing = {};
        module.exports = fromObjectDescription;
        var writable = 4
          , enumerable = 2
          , configurable = 1;
    }
    , {
        "./regexp": "/app/node_modules/object-description/lib/regexp.js"
    }],
    "/app/node_modules/object-serialization/lib/from-object-serialization.js": [function(require, module, exports) {
        try {
            var R = require("ramda")
              , I = require("immutable")
              , RI = require("ramda-immutable")
        } catch (e) {}
        module.exports = function(r, t) {
            function e(t) {
                if (-1 === t)
                    return null ;
                if (-2 === t)
                    return void 0;
                if (-3 === t)
                    return 0 / 0;
                if (-4 === t)
                    return -0;
                if (-5 === t)
                    return -1 / 0;
                if (-6 === t)
                    return 1 / 0;
                if (i.hasOwnProperty(t))
                    return i[t];
                var n = r.objects[t];
                if ("object" != typeof n)
                    return i[t] = n,
                    n;
                var u = n[0] ? o() : a();
                return n.length <= 1 ? u : c(function(r) {
                    i[t] = r;
                    for (var u = 1, o = n.length; o > u; u += 2) {
                        var a = n[u];
                        f("string" == typeof a ? a : e(a), e(n[u + 1]), r)
                    }
                }, u)
            }
            function n(r, t, e) {
                e[r] = t
            }
            var u = t && t.immutable
              , i = (r.objects,
            [])
              , o = u ? I.List : function() {
                return []
            }
              , a = u ? I.Map : function() {
                return Object.create(null )
            }
              , f = u ? RI.set : n
              , c = u ? R.invoker(1, "withMutations") : function(r, t) {
                return r(t),
                t
            }
            ;
            return e(r.index)
        }
        ;
    }
    , {
        "immutable": false,
        "ramda": false,
        "ramda-immutable": false
    }]
}, {}, ["/app/embed-client.js"]);
