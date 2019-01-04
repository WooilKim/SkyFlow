/*jslint browser: true */
/*global window */
(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.TSNE = f()
    }
})(function () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {exports: {}};
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }

        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function (require, module, exports) {
            "use strict";

            function Procedure() {
                this.argTypes = [], this.shimArgs = [], this.arrayArgs = [], this.arrayBlockIndices = [], this.scalarArgs = [], this.offsetArgs = [], this.offsetArgIndex = [], this.indexArgs = [], this.shapeArgs = [], this.funcName = "", this.pre = null, this.body = null, this.post = null, this.debug = !1
            }

            function compileCwise(r) {
                var e = new Procedure;
                e.pre = r.pre, e.body = r.body, e.post = r.post;
                var s = r.args.slice(0);
                e.argTypes = s;
                for (var o = 0; o < s.length; ++o) {
                    var a = s[o];
                    if ("array" === a || "object" == typeof a && a.blockIndices) {
                        if (e.argTypes[o] = "array", e.arrayArgs.push(o), e.arrayBlockIndices.push(a.blockIndices ? a.blockIndices : 0), e.shimArgs.push("array" + o), o < e.pre.args.length && e.pre.args[o].count > 0) throw new Error("cwise: pre() block may not reference array args");
                        if (o < e.post.args.length && e.post.args[o].count > 0) throw new Error("cwise: post() block may not reference array args")
                    } else if ("scalar" === a) e.scalarArgs.push(o), e.shimArgs.push("scalar" + o); else if ("index" === a) {
                        if (e.indexArgs.push(o), o < e.pre.args.length && e.pre.args[o].count > 0) throw new Error("cwise: pre() block may not reference array index");
                        if (o < e.body.args.length && e.body.args[o].lvalue) throw new Error("cwise: body() block may not write to array index");
                        if (o < e.post.args.length && e.post.args[o].count > 0) throw new Error("cwise: post() block may not reference array index")
                    } else if ("shape" === a) {
                        if (e.shapeArgs.push(o), o < e.pre.args.length && e.pre.args[o].lvalue) throw new Error("cwise: pre() block may not write to array shape");
                        if (o < e.body.args.length && e.body.args[o].lvalue) throw new Error("cwise: body() block may not write to array shape");
                        if (o < e.post.args.length && e.post.args[o].lvalue) throw new Error("cwise: post() block may not write to array shape")
                    } else {
                        if ("object" != typeof a || !a.offset) throw new Error("cwise: Unknown argument type " + s[o]);
                        e.argTypes[o] = "offset", e.offsetArgs.push({
                            array: a.array,
                            offset: a.offset
                        }), e.offsetArgIndex.push(o)
                    }
                }
                if (e.arrayArgs.length <= 0) throw new Error("cwise: No array arguments specified");
                if (e.pre.args.length > s.length) throw new Error("cwise: Too many arguments in pre() block");
                if (e.body.args.length > s.length) throw new Error("cwise: Too many arguments in body() block");
                if (e.post.args.length > s.length) throw new Error("cwise: Too many arguments in post() block");
                return e.debug = !!r.printCode || !!r.debug, e.funcName = r.funcName || "cwise", e.blockSize = r.blockSize || 64, createThunk(e)
            }

            var createThunk = require("./lib/thunk.js");
            module.exports = compileCwise;
        }, {"./lib/thunk.js": 3}],
        2: [function (require, module, exports) {
            "use strict";

            function innerFill(r, n, e) {
                var s, a, o = r.length, i = n.arrayArgs.length, t = n.indexArgs.length > 0, p = [], h = [], u = 0,
                    c = 0;
                for (s = 0; o > s; ++s) h.push(["i", s, "=0"].join(""));
                for (a = 0; i > a; ++a) for (s = 0; o > s; ++s) c = u, u = r[s], 0 === s ? h.push(["d", a, "s", s, "=t", a, "p", u].join("")) : h.push(["d", a, "s", s, "=(t", a, "p", u, "-s", c, "*t", a, "p", c, ")"].join(""));
                for (p.push("var " + h.join(",")), s = o - 1; s >= 0; --s) u = r[s], p.push(["for(i", s, "=0;i", s, "<s", u, ";++i", s, "){"].join(""));
                for (p.push(e), s = 0; o > s; ++s) {
                    for (c = u, u = r[s], a = 0; i > a; ++a) p.push(["p", a, "+=d", a, "s", s].join(""));
                    t && (s > 0 && p.push(["index[", c, "]-=s", c].join("")), p.push(["++index[", u, "]"].join(""))), p.push("}")
                }
                return p.join("\n")
            }

            function outerFill(r, n, e, s) {
                for (var a = n.length, o = e.arrayArgs.length, i = e.blockSize, t = e.indexArgs.length > 0, p = [], h = 0; o > h; ++h) p.push(["var offset", h, "=p", h].join(""));
                for (var h = r; a > h; ++h) p.push(["for(var j" + h + "=SS[", n[h], "]|0;j", h, ">0;){"].join("")), p.push(["if(j", h, "<", i, "){"].join("")), p.push(["s", n[h], "=j", h].join("")), p.push(["j", h, "=0"].join("")), p.push(["}else{s", n[h], "=", i].join("")), p.push(["j", h, "-=", i, "}"].join("")), t && p.push(["index[", n[h], "]=j", h].join(""));
                for (var h = 0; o > h; ++h) {
                    for (var u = ["offset" + h], c = r; a > c; ++c) u.push(["j", c, "*t", h, "p", n[c]].join(""));
                    p.push(["p", h, "=(", u.join("+"), ")"].join(""))
                }
                p.push(innerFill(n, e, s));
                for (var h = r; a > h; ++h) p.push("}");
                return p.join("\n")
            }

            function countMatches(r) {
                for (var n = 0, e = r[0].length; e > n;) {
                    for (var s = 1; s < r.length; ++s) if (r[s][n] !== r[0][n]) return n;
                    ++n
                }
                return n
            }

            function processBlock(r, n, e) {
                for (var s = r.body, a = [], o = [], i = 0; i < r.args.length; ++i) {
                    var t = r.args[i];
                    if (!(t.count <= 0)) {
                        var p = new RegExp(t.name, "g"), h = "", u = n.arrayArgs.indexOf(i);
                        switch (n.argTypes[i]) {
                            case"offset":
                                var c = n.offsetArgIndex.indexOf(i), l = n.offsetArgs[c];
                                u = l.array, h = "+q" + c;
                            case"array":
                                h = "p" + u + h;
                                var f = "l" + i, g = "a" + u;
                                if (0 === n.arrayBlockIndices[u]) 1 === t.count ? "generic" === e[u] ? t.lvalue ? (a.push(["var ", f, "=", g, ".get(", h, ")"].join("")), s = s.replace(p, f), o.push([g, ".set(", h, ",", f, ")"].join(""))) : s = s.replace(p, [g, ".get(", h, ")"].join("")) : s = s.replace(p, [g, "[", h, "]"].join("")) : "generic" === e[u] ? (a.push(["var ", f, "=", g, ".get(", h, ")"].join("")), s = s.replace(p, f), t.lvalue && o.push([g, ".set(", h, ",", f, ")"].join(""))) : (a.push(["var ", f, "=", g, "[", h, "]"].join("")), s = s.replace(p, f), t.lvalue && o.push([g, "[", h, "]=", f].join(""))); else {
                                    for (var j = [t.name], v = [h], y = 0; y < Math.abs(n.arrayBlockIndices[u]); y++) j.push("\\s*\\[([^\\]]+)\\]"), v.push("$" + (y + 1) + "*t" + u + "b" + y);
                                    if (p = new RegExp(j.join(""), "g"), h = v.join("+"), "generic" === e[u]) throw new Error("cwise: Generic arrays not supported in combination with blocks!");
                                    s = s.replace(p, [g, "[", h, "]"].join(""))
                                }
                                break;
                            case"scalar":
                                s = s.replace(p, "Y" + n.scalarArgs.indexOf(i));
                                break;
                            case"index":
                                s = s.replace(p, "index");
                                break;
                            case"shape":
                                s = s.replace(p, "shape")
                        }
                    }
                }
                return [a.join("\n"), s, o.join("\n")].join("\n").trim()
            }

            function typeSummary(r) {
                for (var n = new Array(r.length), e = !0, s = 0; s < r.length; ++s) {
                    var a = r[s], o = a.match(/\d+/);
                    o = o ? o[0] : "", 0 === a.charAt(0) ? n[s] = "u" + a.charAt(1) + o : n[s] = a.charAt(0) + o, s > 0 && (e = e && n[s] === n[s - 1])
                }
                return e ? n[0] : n.join("")
            }

            function generateCWiseOp(r, n) {
                for (var e = n[1].length - Math.abs(r.arrayBlockIndices[0]) | 0, s = new Array(r.arrayArgs.length), a = new Array(r.arrayArgs.length), o = 0; o < r.arrayArgs.length; ++o) a[o] = n[2 * o], s[o] = n[2 * o + 1];
                for (var i = [], t = [], p = [], h = [], u = [], o = 0; o < r.arrayArgs.length; ++o) {
                    r.arrayBlockIndices[o] < 0 ? (p.push(0), h.push(e), i.push(e), t.push(e + r.arrayBlockIndices[o])) : (p.push(r.arrayBlockIndices[o]), h.push(r.arrayBlockIndices[o] + e), i.push(0), t.push(r.arrayBlockIndices[o]));
                    for (var c = [], l = 0; l < s[o].length; l++) p[o] <= s[o][l] && s[o][l] < h[o] && c.push(s[o][l] - p[o]);
                    u.push(c)
                }
                for (var f = ["SS"], g = ["'use strict'"], j = [], l = 0; e > l; ++l) j.push(["s", l, "=SS[", l, "]"].join(""));
                for (var o = 0; o < r.arrayArgs.length; ++o) {
                    f.push("a" + o), f.push("t" + o), f.push("p" + o);
                    for (var l = 0; e > l; ++l) j.push(["t", o, "p", l, "=t", o, "[", p[o] + l, "]"].join(""));
                    for (var l = 0; l < Math.abs(r.arrayBlockIndices[o]); ++l) j.push(["t", o, "b", l, "=t", o, "[", i[o] + l, "]"].join(""))
                }
                for (var o = 0; o < r.scalarArgs.length; ++o) f.push("Y" + o);
                if (r.shapeArgs.length > 0 && j.push("shape=SS.slice(0)"), r.indexArgs.length > 0) {
                    for (var v = new Array(e), o = 0; e > o; ++o) v[o] = "0";
                    j.push(["index=[", v.join(","), "]"].join(""))
                }
                for (var o = 0; o < r.offsetArgs.length; ++o) {
                    for (var y = r.offsetArgs[o], d = [], l = 0; l < y.offset.length; ++l) 0 !== y.offset[l] && (1 === y.offset[l] ? d.push(["t", y.array, "p", l].join("")) : d.push([y.offset[l], "*t", y.array, "p", l].join("")));
                    0 === d.length ? j.push("q" + o + "=0") : j.push(["q", o, "=", d.join("+")].join(""))
                }
                var A = uniq([].concat(r.pre.thisVars).concat(r.body.thisVars).concat(r.post.thisVars));
                j = j.concat(A), g.push("var " + j.join(","));
                for (var o = 0; o < r.arrayArgs.length; ++o) g.push("p" + o + "|=0");
                r.pre.body.length > 3 && g.push(processBlock(r.pre, r, a));
                var k = processBlock(r.body, r, a), b = countMatches(u);
                e > b ? g.push(outerFill(b, u[0], r, k)) : g.push(innerFill(u[0], r, k)), r.post.body.length > 3 && g.push(processBlock(r.post, r, a)), r.debug && console.log("-----Generated cwise routine for ", n, ":\n" + g.join("\n") + "\n----------");
                var x = [r.funcName || "unnamed", "_cwise_loop_", s[0].join("s"), "m", b, typeSummary(a)].join(""),
                    w = new Function(["function ", x, "(", f.join(","), "){", g.join("\n"), "} return ", x].join(""));
                return w()
            }

            var uniq = require("uniq");
            module.exports = generateCWiseOp;
        }, {"uniq": 17}],
        3: [function (require, module, exports) {
            "use strict";

            function createThunk(r) {
                var a = ["'use strict'", "var CACHED={}"], e = [], s = r.funcName + "_cwise_thunk";
                a.push(["return function ", s, "(", r.shimArgs.join(","), "){"].join(""));
                for (var n = [], o = [], h = [["array", r.arrayArgs[0], ".shape.slice(", Math.max(0, r.arrayBlockIndices[0]), r.arrayBlockIndices[0] < 0 ? "," + r.arrayBlockIndices[0] + ")" : ")"].join("")], i = [], p = [], t = 0; t < r.arrayArgs.length; ++t) {
                    var c = r.arrayArgs[t];
                    e.push(["t", c, "=array", c, ".dtype,", "r", c, "=array", c, ".order"].join("")), n.push("t" + c), n.push("r" + c), o.push("t" + c), o.push("r" + c + ".join()"), h.push("array" + c + ".data"), h.push("array" + c + ".stride"), h.push("array" + c + ".offset|0"), t > 0 && (i.push("array" + r.arrayArgs[0] + ".shape.length===array" + c + ".shape.length+" + (Math.abs(r.arrayBlockIndices[0]) - Math.abs(r.arrayBlockIndices[t]))), p.push("array" + r.arrayArgs[0] + ".shape[shapeIndex+" + Math.max(0, r.arrayBlockIndices[0]) + "]===array" + c + ".shape[shapeIndex+" + Math.max(0, r.arrayBlockIndices[t]) + "]"))
                }
                r.arrayArgs.length > 1 && (a.push("if (!(" + i.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same dimensionality!')"), a.push("for(var shapeIndex=array" + r.arrayArgs[0] + ".shape.length-" + Math.abs(r.arrayBlockIndices[0]) + "; shapeIndex-->0;) {"), a.push("if (!(" + p.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same shape!')"), a.push("}"));
                for (var t = 0; t < r.scalarArgs.length; ++t) h.push("scalar" + r.scalarArgs[t]);
                e.push(["type=[", o.join(","), "].join()"].join("")), e.push("proc=CACHED[type]"), a.push("var " + e.join(",")), a.push(["if(!proc){", "CACHED[type]=proc=compile([", n.join(","), "])}", "return proc(", h.join(","), ")}"].join("")), r.debug && console.log("-----Generated thunk:\n" + a.join("\n") + "\n----------");
                var u = new Function("compile", a.join("\n"));
                return u(compile.bind(void 0, r))
            }

            var compile = require("./compile.js");
            module.exports = createThunk;
        }, {"./compile.js": 2}],
        4: [function (require, module, exports) {
            "use strict";

            function CompiledArgument(e, r, n) {
                this.name = e, this.lvalue = r, this.rvalue = n, this.count = 0
            }

            function CompiledRoutine(e, r, n, t) {
                this.body = e, this.args = r, this.thisVars = n, this.localVars = t
            }

            function isGlobal(e) {
                if ("eval" === e) throw new Error("cwise-parser: eval() not allowed");
                return "undefined" != typeof window ? e in window : "undefined" != typeof GLOBAL ? e in GLOBAL : "undefined" != typeof self ? e in self : !1
            }

            function getArgNames(e) {
                for (var r = e.body[0].expression.callee.params, n = new Array(r.length), t = 0; t < r.length; ++t) n[t] = r[t].name;
                return n
            }

            function preprocess(e) {
                function r(e) {
                    var r = l + e.replace(/\_/g, "__");
                    return y.push(r), r
                }

                function n(e) {
                    var r = "this_" + e.replace(/\_/g, "__");
                    return d.push(r), r
                }

                function t(e, r) {
                    for (var n = e.range[0], t = e.range[1], i = n + 1; t > i; ++i) g[i] = "";
                    g[n] = r
                }

                function i(e) {
                    return "'" + e.replace(/\_/g, "\\_").replace(/\'/g, "'") + "'"
                }

                function o(e) {
                    return g.slice(e.range[0], e.range[1]).join("")
                }

                function a(e) {
                    return "AssignmentExpression" === e.parent.type && e.parent.left === e ? "=" === e.parent.operator ? m : m | v : "UpdateExpression" === e.parent.type ? m | v : v
                }

                for (var s = ["(", e, ")()"].join(""), p = esprima.parse(s, {range: !0}), l = "_inline_" + PREFIX_COUNTER++ + "_", u = getArgNames(p), f = new Array(u.length), c = 0; c < u.length; ++c) f[c] = new CompiledArgument([l, "arg", c, "_"].join(""), !1, !1);
                for (var g = new Array(s.length), c = 0, h = s.length; h > c; ++c) g[c] = s.charAt(c);
                var y = [], d = [], m = 1, v = 2;
                !function _(e, o) {
                    if (e.parent = o, "MemberExpression" === e.type) e.computed ? (_(e.object, e), _(e.property, e)) : "ThisExpression" === e.object.type ? t(e, n(e.property.name)) : _(e.object, e); else {
                        if ("ThisExpression" === e.type) throw new Error("cwise-parser: Computed this is not allowed");
                        if ("Identifier" === e.type) {
                            var s = e.name, p = u.indexOf(s);
                            if (p >= 0) {
                                var l = f[p], c = a(e);
                                c & m && (l.lvalue = !0), c & v && (l.rvalue = !0), ++l.count, t(e, l.name)
                            } else isGlobal(s) || t(e, r(s))
                        } else if ("Literal" === e.type) "string" == typeof e.value && t(e, i(e.value)); else {
                            if ("WithStatement" === e.type) throw new Error("cwise-parser: with() statements not allowed");
                            for (var g = Object.keys(e), h = 0, y = g.length; y > h; ++h) if ("parent" !== g[h]) {
                                var d = e[g[h]];
                                if (d) if (d instanceof Array) for (var w = 0; w < d.length; ++w) d[w] && "string" == typeof d[w].type && _(d[w], e); else "string" == typeof d.type && _(d, e)
                            }
                        }
                    }
                }(p.body[0].expression.callee.body, void 0), uniq(y), uniq(d);
                var w = new CompiledRoutine(o(p.body[0].expression.callee.body), f, d, y);
                return w
            }

            var esprima = require("esprima"), uniq = require("uniq"), PREFIX_COUNTER = 0;
            module.exports = preprocess;
        }, {"esprima": 8, "uniq": 17}],
        5: [function (require, module, exports) {
            "use strict";

            function createCWise(e) {
                for (var r in e) REQUIRED_FIELDS.indexOf(r) < 0 && OPTIONAL_FIELDS.indexOf(r) < 0 && console.warn("cwise: Unknown argument '" + r + "' passed to expression compiler");
                for (var o = 0; o < REQUIRED_FIELDS.length; ++o) if (!e[REQUIRED_FIELDS[o]]) throw new Error("cwise: Missing argument: " + REQUIRED_FIELDS[o]);
                return compile({
                    args: e.args,
                    pre: parse(e.pre || function () {
                    }),
                    body: parse(e.body),
                    post: parse(e.post || function () {
                    }),
                    debug: !!e.printCode,
                    funcName: e.funcName || e.body.name || "cwise",
                    blockSize: e.blockSize || 64
                })
            }

            var parse = require("cwise-parser"), compile = require("cwise-compiler"),
                REQUIRED_FIELDS = ["args", "body"],
                OPTIONAL_FIELDS = ["pre", "post", "printCode", "funcName", "blockSize"];
            module.exports = createCWise;
        }, {"cwise-compiler": 1, "cwise-parser": 4}],
        6: [function (require, module, exports) {
            module.exports = require("cwise-compiler");
        }, {"cwise-compiler": 1}],
        7: [function (require, module, exports) {
            "use strict";

            function dupe_array(e, r, u) {
                var n = 0 | e[u];
                if (0 >= n) return [];
                var t, a = new Array(n);
                if (u === e.length - 1) for (t = 0; n > t; ++t) a[t] = r; else for (t = 0; n > t; ++t) a[t] = dupe_array(e, r, u + 1);
                return a
            }

            function dupe_number(e, r) {
                var u, n;
                for (u = new Array(e), n = 0; e > n; ++n) u[n] = r;
                return u
            }

            function dupe(e, r) {
                switch ("undefined" == typeof r && (r = 0), typeof e) {
                    case"number":
                        if (e > 0) return dupe_number(0 | e, r);
                        break;
                    case"object":
                        if ("number" == typeof e.length) return dupe_array(e, r, 0)
                }
                return []
            }

            module.exports = dupe;
        }, {}],
        8: [function (require, module, exports) {
            !function (e, t) {
                "use strict";
                "function" == typeof define && define.amd ? define(["exports"], t) : t("undefined" != typeof exports ? exports : e.esprima = {})
            }(this, function (e) {
                "use strict";

                function t(e, t) {
                    if (!e) throw new Error("ASSERT: " + t)
                }

                function n(e) {
                    return e >= 48 && 57 >= e
                }

                function r(e) {
                    return "0123456789abcdefABCDEF".indexOf(e) >= 0
                }

                function a(e) {
                    return "01234567".indexOf(e) >= 0
                }

                function i(e) {
                    return 32 === e || 9 === e || 11 === e || 12 === e || 160 === e || e >= 5760 && [5760, 6158, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279].indexOf(e) >= 0
                }

                function o(e) {
                    return 10 === e || 13 === e || 8232 === e || 8233 === e
                }

                function c(e) {
                    return 36 === e || 95 === e || e >= 65 && 90 >= e || e >= 97 && 122 >= e || 92 === e || e >= 128 && it.NonAsciiIdentifierStart.test(String.fromCharCode(e))
                }

                function u(e) {
                    return 36 === e || 95 === e || e >= 65 && 90 >= e || e >= 97 && 122 >= e || e >= 48 && 57 >= e || 92 === e || e >= 128 && it.NonAsciiIdentifierPart.test(String.fromCharCode(e))
                }

                function l(e) {
                    switch (e) {
                        case"class":
                        case"enum":
                        case"export":
                        case"extends":
                        case"import":
                        case"super":
                            return !0;
                        default:
                            return !1
                    }
                }

                function s(e) {
                    switch (e) {
                        case"implements":
                        case"interface":
                        case"package":
                        case"private":
                        case"protected":
                        case"public":
                        case"static":
                        case"yield":
                        case"let":
                            return !0;
                        default:
                            return !1
                    }
                }

                function m(e) {
                    return "eval" === e || "arguments" === e
                }

                function d(e) {
                    if (ut && s(e)) return !0;
                    switch (e.length) {
                        case 2:
                            return "if" === e || "in" === e || "do" === e;
                        case 3:
                            return "var" === e || "for" === e || "new" === e || "try" === e || "let" === e;
                        case 4:
                            return "this" === e || "else" === e || "case" === e || "void" === e || "with" === e || "enum" === e;
                        case 5:
                            return "while" === e || "break" === e || "catch" === e || "throw" === e || "const" === e || "yield" === e || "class" === e || "super" === e;
                        case 6:
                            return "return" === e || "typeof" === e || "delete" === e || "switch" === e || "export" === e || "import" === e;
                        case 7:
                            return "default" === e || "finally" === e || "extends" === e;
                        case 8:
                            return "function" === e || "continue" === e || "debugger" === e;
                        case 10:
                            return "instanceof" === e;
                        default:
                            return !1
                    }
                }

                function f(e, n, r, a, i) {
                    var o;
                    t("number" == typeof r, "Comment must have valid position"), yt.lastCommentStart >= r || (yt.lastCommentStart = r, o = {
                        type: e,
                        value: n
                    }, ht.range && (o.range = [r, a]), ht.loc && (o.loc = i), ht.comments.push(o), ht.attachComment && (ht.leadingComments.push(o), ht.trailingComments.push(o)))
                }

                function p(e) {
                    var t, n, r, a;
                    for (t = lt - e, n = {
                        start: {
                            line: st,
                            column: lt - mt - e
                        }
                    }; dt > lt;) if (r = ct.charCodeAt(lt), ++lt, o(r)) return ht.comments && (a = ct.slice(t + e, lt - 1), n.end = {
                        line: st,
                        column: lt - mt - 1
                    }, f("Line", a, t, lt - 1, n)), 13 === r && 10 === ct.charCodeAt(lt) && ++lt, ++st, void(mt = lt);
                    ht.comments && (a = ct.slice(t + e, lt), n.end = {
                        line: st,
                        column: lt - mt
                    }, f("Line", a, t, lt, n))
                }

                function y() {
                    var e, t, n, r;
                    for (ht.comments && (e = lt - 2, t = {
                        start: {
                            line: st,
                            column: lt - mt - 2
                        }
                    }); dt > lt;) if (n = ct.charCodeAt(lt), o(n)) 13 === n && 10 === ct.charCodeAt(lt + 1) && ++lt, ++st, ++lt, mt = lt, lt >= dt && K({}, at.UnexpectedToken, "ILLEGAL"); else if (42 === n) {
                        if (47 === ct.charCodeAt(lt + 1)) return ++lt, ++lt, void(ht.comments && (r = ct.slice(e + 2, lt - 2), t.end = {
                            line: st,
                            column: lt - mt
                        }, f("Block", r, e, lt, t)));
                        ++lt
                    } else ++lt;
                    K({}, at.UnexpectedToken, "ILLEGAL")
                }

                function h() {
                    var e, t;
                    for (t = 0 === lt; dt > lt;) if (e = ct.charCodeAt(lt), i(e)) ++lt; else if (o(e)) ++lt, 13 === e && 10 === ct.charCodeAt(lt) && ++lt, ++st, mt = lt, t = !0; else if (47 === e) if (e = ct.charCodeAt(lt + 1), 47 === e) ++lt, ++lt, p(2), t = !0; else {
                        if (42 !== e) break;
                        ++lt, ++lt, y()
                    } else if (t && 45 === e) {
                        if (45 !== ct.charCodeAt(lt + 1) || 62 !== ct.charCodeAt(lt + 2)) break;
                        lt += 3, p(3)
                    } else {
                        if (60 !== e) break;
                        if ("!--" !== ct.slice(lt + 1, lt + 4)) break;
                        ++lt, ++lt, ++lt, ++lt, p(4)
                    }
                }

                function S(e) {
                    var t, n, a, i = 0;
                    for (n = "u" === e ? 4 : 2, t = 0; n > t; ++t) {
                        if (!(dt > lt && r(ct[lt]))) return "";
                        a = ct[lt++], i = 16 * i + "0123456789abcdef".indexOf(a.toLowerCase())
                    }
                    return String.fromCharCode(i)
                }

                function g() {
                    var e, t;
                    for (e = ct.charCodeAt(lt++), t = String.fromCharCode(e), 92 === e && (117 !== ct.charCodeAt(lt) && K({}, at.UnexpectedToken, "ILLEGAL"), ++lt, e = S("u"), e && "\\" !== e && c(e.charCodeAt(0)) || K({}, at.UnexpectedToken, "ILLEGAL"), t = e); dt > lt && (e = ct.charCodeAt(lt), u(e));) ++lt, t += String.fromCharCode(e), 92 === e && (t = t.substr(0, t.length - 1), 117 !== ct.charCodeAt(lt) && K({}, at.UnexpectedToken, "ILLEGAL"), ++lt, e = S("u"), e && "\\" !== e && u(e.charCodeAt(0)) || K({}, at.UnexpectedToken, "ILLEGAL"), t += e);
                    return t
                }

                function v() {
                    var e, t;
                    for (e = lt++; dt > lt;) {
                        if (t = ct.charCodeAt(lt), 92 === t) return lt = e, g();
                        if (!u(t)) break;
                        ++lt
                    }
                    return ct.slice(e, lt)
                }

                function k() {
                    var e, t, n;
                    return e = lt, t = 92 === ct.charCodeAt(lt) ? g() : v(), n = 1 === t.length ? _e.Identifier : d(t) ? _e.Keyword : "null" === t ? _e.NullLiteral : "true" === t || "false" === t ? _e.BooleanLiteral : _e.Identifier, {
                        type: n,
                        value: t,
                        lineNumber: st,
                        lineStart: mt,
                        start: e,
                        end: lt
                    }
                }

                function b() {
                    var e, t, n, r, a = lt, i = ct.charCodeAt(lt), o = ct[lt];
                    switch (i) {
                        case 46:
                        case 40:
                        case 41:
                        case 59:
                        case 44:
                        case 123:
                        case 125:
                        case 91:
                        case 93:
                        case 58:
                        case 63:
                        case 126:
                            return ++lt, ht.tokenize && (40 === i ? ht.openParenToken = ht.tokens.length : 123 === i && (ht.openCurlyToken = ht.tokens.length)), {
                                type: _e.Punctuator,
                                value: String.fromCharCode(i),
                                lineNumber: st,
                                lineStart: mt,
                                start: a,
                                end: lt
                            };
                        default:
                            if (e = ct.charCodeAt(lt + 1), 61 === e) switch (i) {
                                case 43:
                                case 45:
                                case 47:
                                case 60:
                                case 62:
                                case 94:
                                case 124:
                                case 37:
                                case 38:
                                case 42:
                                    return lt += 2, {
                                        type: _e.Punctuator,
                                        value: String.fromCharCode(i) + String.fromCharCode(e),
                                        lineNumber: st,
                                        lineStart: mt,
                                        start: a,
                                        end: lt
                                    };
                                case 33:
                                case 61:
                                    return lt += 2, 61 === ct.charCodeAt(lt) && ++lt, {
                                        type: _e.Punctuator,
                                        value: ct.slice(a, lt),
                                        lineNumber: st,
                                        lineStart: mt,
                                        start: a,
                                        end: lt
                                    }
                            }
                    }
                    return r = ct.substr(lt, 4), ">>>=" === r ? (lt += 4, {
                        type: _e.Punctuator,
                        value: r,
                        lineNumber: st,
                        lineStart: mt,
                        start: a,
                        end: lt
                    }) : (n = r.substr(0, 3), ">>>" === n || "<<=" === n || ">>=" === n ? (lt += 3, {
                        type: _e.Punctuator,
                        value: n,
                        lineNumber: st,
                        lineStart: mt,
                        start: a,
                        end: lt
                    }) : (t = n.substr(0, 2), o === t[1] && "+-<>&|".indexOf(o) >= 0 || "=>" === t ? (lt += 2, {
                        type: _e.Punctuator,
                        value: t,
                        lineNumber: st,
                        lineStart: mt,
                        start: a,
                        end: lt
                    }) : "<>=!+-*%&|^/".indexOf(o) >= 0 ? (++lt, {
                        type: _e.Punctuator,
                        value: o,
                        lineNumber: st,
                        lineStart: mt,
                        start: a,
                        end: lt
                    }) : void K({}, at.UnexpectedToken, "ILLEGAL")))
                }

                function E(e) {
                    for (var t = ""; dt > lt && r(ct[lt]);) t += ct[lt++];
                    return 0 === t.length && K({}, at.UnexpectedToken, "ILLEGAL"), c(ct.charCodeAt(lt)) && K({}, at.UnexpectedToken, "ILLEGAL"), {
                        type: _e.NumericLiteral,
                        value: parseInt("0x" + t, 16),
                        lineNumber: st,
                        lineStart: mt,
                        start: e,
                        end: lt
                    }
                }

                function x(e) {
                    for (var t = "0" + ct[lt++]; dt > lt && a(ct[lt]);) t += ct[lt++];
                    return (c(ct.charCodeAt(lt)) || n(ct.charCodeAt(lt))) && K({}, at.UnexpectedToken, "ILLEGAL"), {
                        type: _e.NumericLiteral,
                        value: parseInt(t, 8),
                        octal: !0,
                        lineNumber: st,
                        lineStart: mt,
                        start: e,
                        end: lt
                    }
                }

                function C() {
                    var e, t;
                    for (e = lt + 1; dt > e; ++e) {
                        if (t = ct[e], "8" === t || "9" === t) return !1;
                        if (!a(t)) return !0
                    }
                    return !0
                }

                function w() {
                    var e, r, i;
                    if (i = ct[lt], t(n(i.charCodeAt(0)) || "." === i, "Numeric literal must start with a decimal digit or a decimal point"), r = lt, e = "", "." !== i) {
                        if (e = ct[lt++], i = ct[lt], "0" === e) {
                            if ("x" === i || "X" === i) return ++lt, E(r);
                            if (a(i) && C()) return x(r)
                        }
                        for (; n(ct.charCodeAt(lt));) e += ct[lt++];
                        i = ct[lt]
                    }
                    if ("." === i) {
                        for (e += ct[lt++]; n(ct.charCodeAt(lt));) e += ct[lt++];
                        i = ct[lt]
                    }
                    if ("e" === i || "E" === i) if (e += ct[lt++], i = ct[lt], ("+" === i || "-" === i) && (e += ct[lt++]), n(ct.charCodeAt(lt))) for (; n(ct.charCodeAt(lt));) e += ct[lt++]; else K({}, at.UnexpectedToken, "ILLEGAL");
                    return c(ct.charCodeAt(lt)) && K({}, at.UnexpectedToken, "ILLEGAL"), {
                        type: _e.NumericLiteral,
                        value: parseFloat(e),
                        lineNumber: st,
                        lineStart: mt,
                        start: r,
                        end: lt
                    }
                }

                function I() {
                    var e, n, r, i, c, u, l, s, m = "", d = !1;
                    for (l = st, s = mt, e = ct[lt], t("'" === e || '"' === e, "String literal must starts with a quote"), n = lt, ++lt; dt > lt;) {
                        if (r = ct[lt++], r === e) {
                            e = "";
                            break
                        }
                        if ("\\" === r) if (r = ct[lt++], r && o(r.charCodeAt(0))) ++st, "\r" === r && "\n" === ct[lt] && ++lt, mt = lt; else switch (r) {
                            case"u":
                            case"x":
                                u = lt, c = S(r), c ? m += c : (lt = u, m += r);
                                break;
                            case"n":
                                m += "\n";
                                break;
                            case"r":
                                m += "\r";
                                break;
                            case"t":
                                m += "	";
                                break;
                            case"b":
                                m += "\b";
                                break;
                            case"f":
                                m += "\f";
                                break;
                            case"v":
                                m += "\x0B";
                                break;
                            default:
                                a(r) ? (i = "01234567".indexOf(r), 0 !== i && (d = !0), dt > lt && a(ct[lt]) && (d = !0, i = 8 * i + "01234567".indexOf(ct[lt++]), "0123".indexOf(r) >= 0 && dt > lt && a(ct[lt]) && (i = 8 * i + "01234567".indexOf(ct[lt++]))), m += String.fromCharCode(i)) : m += r
                        } else {
                            if (o(r.charCodeAt(0))) break;
                            m += r
                        }
                    }
                    return "" !== e && K({}, at.UnexpectedToken, "ILLEGAL"), {
                        type: _e.StringLiteral,
                        value: m,
                        octal: d,
                        startLineNumber: l,
                        startLineStart: s,
                        lineNumber: st,
                        lineStart: mt,
                        start: n,
                        end: lt
                    }
                }

                function L(e, t) {
                    var n;
                    try {
                        n = new RegExp(e, t)
                    } catch (r) {
                        K({}, at.InvalidRegExp)
                    }
                    return n
                }

                function A() {
                    var e, n, r, a, i;
                    for (e = ct[lt], t("/" === e, "Regular expression literal must start with a slash"), n = ct[lt++], r = !1, a = !1; dt > lt;) if (e = ct[lt++], n += e, "\\" === e) e = ct[lt++], o(e.charCodeAt(0)) && K({}, at.UnterminatedRegExp), n += e; else if (o(e.charCodeAt(0))) K({}, at.UnterminatedRegExp); else if (r) "]" === e && (r = !1); else {
                        if ("/" === e) {
                            a = !0;
                            break
                        }
                        "[" === e && (r = !0)
                    }
                    return a || K({}, at.UnterminatedRegExp), i = n.substr(1, n.length - 2), {value: i, literal: n}
                }

                function P() {
                    var e, t, n, r;
                    for (t = "", n = ""; dt > lt && (e = ct[lt], u(e.charCodeAt(0)));) if (++lt, "\\" === e && dt > lt) if (e = ct[lt], "u" === e) {
                        if (++lt, r = lt, e = S("u")) for (n += e, t += "\\u"; lt > r; ++r) t += ct[r]; else lt = r, n += "u", t += "\\u";
                        V({}, at.UnexpectedToken, "ILLEGAL")
                    } else t += "\\", V({}, at.UnexpectedToken, "ILLEGAL"); else n += e, t += e;
                    return {value: n, literal: t}
                }

                function N() {
                    var e, t, n, r;
                    return pt = null, h(), e = lt, t = A(), n = P(), r = L(t.value, n.value), ht.tokenize ? {
                        type: _e.RegularExpression,
                        value: r,
                        lineNumber: st,
                        lineStart: mt,
                        start: e,
                        end: lt
                    } : {literal: t.literal + n.literal, value: r, start: e, end: lt}
                }

                function O() {
                    var e, t, n, r;
                    return h(), e = lt, t = {start: {line: st, column: lt - mt}}, n = N(), t.end = {
                        line: st,
                        column: lt - mt
                    }, ht.tokenize || (ht.tokens.length > 0 && (r = ht.tokens[ht.tokens.length - 1], r.range[0] === e && "Punctuator" === r.type && ("/" === r.value || "/=" === r.value) && ht.tokens.pop()), ht.tokens.push({
                        type: "RegularExpression",
                        value: n.literal,
                        range: [e, lt],
                        loc: t
                    })), n
                }

                function U(e) {
                    return e.type === _e.Identifier || e.type === _e.Keyword || e.type === _e.BooleanLiteral || e.type === _e.NullLiteral
                }

                function R() {
                    var e, t;
                    if (e = ht.tokens[ht.tokens.length - 1], !e) return O();
                    if ("Punctuator" === e.type) {
                        if ("]" === e.value) return b();
                        if (")" === e.value) return t = ht.tokens[ht.openParenToken - 1], !t || "Keyword" !== t.type || "if" !== t.value && "while" !== t.value && "for" !== t.value && "with" !== t.value ? b() : O();
                        if ("}" === e.value) {
                            if (ht.tokens[ht.openCurlyToken - 3] && "Keyword" === ht.tokens[ht.openCurlyToken - 3].type) {
                                if (t = ht.tokens[ht.openCurlyToken - 4], !t) return b()
                            } else {
                                if (!ht.tokens[ht.openCurlyToken - 4] || "Keyword" !== ht.tokens[ht.openCurlyToken - 4].type) return b();
                                if (t = ht.tokens[ht.openCurlyToken - 5], !t) return O()
                            }
                            return tt.indexOf(t.value) >= 0 ? b() : O()
                        }
                        return O()
                    }
                    return "Keyword" === e.type && "this" !== e.value ? O() : b()
                }

                function F() {
                    var e;
                    return h(), lt >= dt ? {
                        type: _e.EOF,
                        lineNumber: st,
                        lineStart: mt,
                        start: lt,
                        end: lt
                    } : (e = ct.charCodeAt(lt), c(e) ? k() : 40 === e || 41 === e || 59 === e ? b() : 39 === e || 34 === e ? I() : 46 === e ? n(ct.charCodeAt(lt + 1)) ? w() : b() : n(e) ? w() : ht.tokenize && 47 === e ? R() : b())
                }

                function T() {
                    var e, t, n;
                    return h(), e = {start: {line: st, column: lt - mt}}, t = F(), e.end = {
                        line: st,
                        column: lt - mt
                    }, t.type !== _e.EOF && (n = ct.slice(t.start, t.end), ht.tokens.push({
                        type: et[t.type],
                        value: n,
                        range: [t.start, t.end],
                        loc: e
                    })), t
                }

                function D() {
                    var e;
                    return e = pt, lt = e.end, st = e.lineNumber, mt = e.lineStart, pt = "undefined" != typeof ht.tokens ? T() : F(), lt = e.end, st = e.lineNumber, mt = e.lineStart, e
                }

                function B() {
                    var e, t, n;
                    e = lt, t = st, n = mt, pt = "undefined" != typeof ht.tokens ? T() : F(), lt = e, st = t, mt = n
                }

                function W(e, t) {
                    this.line = e, this.column = t
                }

                function j(e, t, n, r) {
                    this.start = new W(e, t), this.end = new W(n, r)
                }

                function G() {
                    var e, t, n, r;
                    return e = lt, t = st, n = mt, h(), r = st !== t, lt = e, st = t, mt = n, r
                }

                function K(e, n) {
                    var r, a = Array.prototype.slice.call(arguments, 2), i = n.replace(/%(\d)/g, function (e, n) {
                        return t(n < a.length, "Message reference must be in range"), a[n]
                    });
                    throw"number" == typeof e.lineNumber ? (r = new Error("Line " + e.lineNumber + ": " + i), r.index = e.start, r.lineNumber = e.lineNumber, r.column = e.start - mt + 1) : (r = new Error("Line " + st + ": " + i), r.index = lt, r.lineNumber = st, r.column = lt - mt + 1), r.description = i, r
                }

                function V() {
                    try {
                        K.apply(null, arguments)
                    } catch (e) {
                        if (!ht.errors) throw e;
                        ht.errors.push(e)
                    }
                }

                function M(e) {
                    if (e.type === _e.EOF && K(e, at.UnexpectedEOS), e.type === _e.NumericLiteral && K(e, at.UnexpectedNumber), e.type === _e.StringLiteral && K(e, at.UnexpectedString), e.type === _e.Identifier && K(e, at.UnexpectedIdentifier), e.type === _e.Keyword) {
                        if (l(e.value)) K(e, at.UnexpectedReserved); else if (ut && s(e.value)) return void V(e, at.StrictReservedWord);
                        K(e, at.UnexpectedToken, e.value)
                    }
                    K(e, at.UnexpectedToken, e.value)
                }

                function H(e) {
                    var t = D();
                    (t.type !== _e.Punctuator || t.value !== e) && M(t)
                }

                function q(e) {
                    var t = D();
                    (t.type !== _e.Keyword || t.value !== e) && M(t)
                }

                function z(e) {
                    return pt.type === _e.Punctuator && pt.value === e
                }

                function $(e) {
                    return pt.type === _e.Keyword && pt.value === e
                }

                function X() {
                    var e;
                    return pt.type !== _e.Punctuator ? !1 : (e = pt.value, "=" === e || "*=" === e || "/=" === e || "%=" === e || "+=" === e || "-=" === e || "<<=" === e || ">>=" === e || ">>>=" === e || "&=" === e || "^=" === e || "|=" === e)
                }

                function J() {
                    var e, t = lt, n = st, r = mt, a = pt;
                    return 59 === ct.charCodeAt(lt) || z(";") ? void D() : (e = st, h(), st !== e ? (lt = t, st = n, mt = r, void(pt = a)) : void(pt.type === _e.EOF || z("}") || M(pt)))
                }

                function Q(e) {
                    return e.type === nt.Identifier || e.type === nt.MemberExpression
                }

                function Y() {
                    var e, t = [];
                    for (e = pt, H("["); !z("]");) z(",") ? (D(), t.push(null)) : (t.push(he()), z("]") || H(","));
                    return D(), ft.markEnd(ft.createArrayExpression(t), e)
                }

                function Z(e, t) {
                    var n, r, a;
                    return n = ut, a = pt, r = Me(), t && ut && m(e[0].name) && V(t, at.StrictParamName), ut = n, ft.markEnd(ft.createFunctionExpression(null, e, [], r), a)
                }

                function _() {
                    var e, t;
                    return t = pt, e = D(), e.type === _e.StringLiteral || e.type === _e.NumericLiteral ? (ut && e.octal && V(e, at.StrictOctalLiteral), ft.markEnd(ft.createLiteral(e), t)) : ft.markEnd(ft.createIdentifier(e.value), t)
                }

                function ee() {
                    var e, t, n, r, a, i;
                    return e = pt, i = pt, e.type === _e.Identifier ? (n = _(), "get" !== e.value || z(":") ? "set" !== e.value || z(":") ? (H(":"), r = he(), ft.markEnd(ft.createProperty("init", n, r), i)) : (t = _(), H("("), e = pt, e.type !== _e.Identifier ? (H(")"), V(e, at.UnexpectedToken, e.value), r = Z([])) : (a = [ke()], H(")"), r = Z(a, e)), ft.markEnd(ft.createProperty("set", t, r), i)) : (t = _(), H("("), H(")"), r = Z([]), ft.markEnd(ft.createProperty("get", t, r), i))) : e.type !== _e.EOF && e.type !== _e.Punctuator ? (t = _(), H(":"), r = he(), ft.markEnd(ft.createProperty("init", t, r), i)) : void M(e)
                }

                function te() {
                    var e, t, n, r, a, i = [], o = {}, c = String;
                    for (a = pt, H("{"); !z("}");) e = ee(), t = e.key.type === nt.Identifier ? e.key.name : c(e.key.value), r = "init" === e.kind ? rt.Data : "get" === e.kind ? rt.Get : rt.Set, n = "$" + t, Object.prototype.hasOwnProperty.call(o, n) ? (o[n] === rt.Data ? ut && r === rt.Data ? V({}, at.StrictDuplicateProperty) : r !== rt.Data && V({}, at.AccessorDataProperty) : r === rt.Data ? V({}, at.AccessorDataProperty) : o[n] & r && V({}, at.AccessorGetSet), o[n] |= r) : o[n] = r, i.push(e), z("}") || H(",");
                    return H("}"), ft.markEnd(ft.createObjectExpression(i), a)
                }

                function ne() {
                    var e;
                    return H("("), e = Se(), H(")"), e
                }

                function re() {
                    var e, t, n, r;
                    if (z("(")) return ne();
                    if (z("[")) return Y();
                    if (z("{")) return te();
                    if (e = pt.type, r = pt, e === _e.Identifier) n = ft.createIdentifier(D().value); else if (e === _e.StringLiteral || e === _e.NumericLiteral) ut && pt.octal && V(pt, at.StrictOctalLiteral), n = ft.createLiteral(D()); else if (e === _e.Keyword) {
                        if ($("function")) return ze();
                        $("this") ? (D(), n = ft.createThisExpression()) : M(D())
                    } else e === _e.BooleanLiteral ? (t = D(), t.value = "true" === t.value, n = ft.createLiteral(t)) : e === _e.NullLiteral ? (t = D(), t.value = null, n = ft.createLiteral(t)) : z("/") || z("/=") ? (n = "undefined" != typeof ht.tokens ? ft.createLiteral(O()) : ft.createLiteral(N()), B()) : M(D());
                    return ft.markEnd(n, r)
                }

                function ae() {
                    var e = [];
                    if (H("("), !z(")")) for (; dt > lt && (e.push(he()), !z(")"));) H(",");
                    return H(")"), e
                }

                function ie() {
                    var e, t;
                    return t = pt, e = D(), U(e) || M(e), ft.markEnd(ft.createIdentifier(e.value), t)
                }

                function oe() {
                    return H("."), ie()
                }

                function ce() {
                    var e;
                    return H("["), e = Se(), H("]"), e
                }

                function ue() {
                    var e, t, n;
                    return n = pt, q("new"), e = se(), t = z("(") ? ae() : [], ft.markEnd(ft.createNewExpression(e, t), n)
                }

                function le() {
                    var e, t, n, r, a = yt.allowIn;
                    for (r = pt, yt.allowIn = !0, e = $("new") ? ue() : re(); ;) {
                        if (z(".")) n = oe(), e = ft.createMemberExpression(".", e, n); else if (z("(")) t = ae(), e = ft.createCallExpression(e, t); else {
                            if (!z("[")) break;
                            n = ce(), e = ft.createMemberExpression("[", e, n)
                        }
                        ft.markEnd(e, r)
                    }
                    return yt.allowIn = a, e
                }

                function se() {
                    var e, n, r;
                    for (t(yt.allowIn, "callee of new expression always allow in keyword."), r = pt, e = $("new") ? ue() : re(); z(".") || z("[");) z("[") ? (n = ce(), e = ft.createMemberExpression("[", e, n)) : (n = oe(), e = ft.createMemberExpression(".", e, n)), ft.markEnd(e, r);
                    return e
                }

                function me() {
                    var e, t, n = pt;
                    return e = le(), pt.type === _e.Punctuator && (!z("++") && !z("--") || G() || (ut && e.type === nt.Identifier && m(e.name) && V({}, at.StrictLHSPostfix), Q(e) || V({}, at.InvalidLHSInAssignment), t = D(), e = ft.markEnd(ft.createPostfixExpression(t.value, e), n))), e
                }

                function de() {
                    var e, t, n;
                    return pt.type !== _e.Punctuator && pt.type !== _e.Keyword ? t = me() : z("++") || z("--") ? (n = pt, e = D(), t = de(), ut && t.type === nt.Identifier && m(t.name) && V({}, at.StrictLHSPrefix), Q(t) || V({}, at.InvalidLHSInAssignment), t = ft.createUnaryExpression(e.value, t), t = ft.markEnd(t, n)) : z("+") || z("-") || z("~") || z("!") ? (n = pt, e = D(), t = de(), t = ft.createUnaryExpression(e.value, t), t = ft.markEnd(t, n)) : $("delete") || $("void") || $("typeof") ? (n = pt, e = D(), t = de(), t = ft.createUnaryExpression(e.value, t), t = ft.markEnd(t, n), ut && "delete" === t.operator && t.argument.type === nt.Identifier && V({}, at.StrictDelete)) : t = me(), t
                }

                function fe(e, t) {
                    var n = 0;
                    if (e.type !== _e.Punctuator && e.type !== _e.Keyword) return 0;
                    switch (e.value) {
                        case"||":
                            n = 1;
                            break;
                        case"&&":
                            n = 2;
                            break;
                        case"|":
                            n = 3;
                            break;
                        case"^":
                            n = 4;
                            break;
                        case"&":
                            n = 5;
                            break;
                        case"==":
                        case"!=":
                        case"===":
                        case"!==":
                            n = 6;
                            break;
                        case"<":
                        case">":
                        case"<=":
                        case">=":
                        case"instanceof":
                            n = 7;
                            break;
                        case"in":
                            n = t ? 7 : 0;
                            break;
                        case"<<":
                        case">>":
                        case">>>":
                            n = 8;
                            break;
                        case"+":
                        case"-":
                            n = 9;
                            break;
                        case"*":
                        case"/":
                        case"%":
                            n = 11
                    }
                    return n
                }

                function pe() {
                    var e, t, n, r, a, i, o, c, u, l;
                    if (e = pt, u = de(), r = pt, a = fe(r, yt.allowIn), 0 === a) return u;
                    for (r.prec = a, D(), t = [e, pt], o = de(), i = [u, r, o]; (a = fe(pt, yt.allowIn)) > 0;) {
                        for (; i.length > 2 && a <= i[i.length - 2].prec;) o = i.pop(), c = i.pop().value, u = i.pop(), n = ft.createBinaryExpression(c, u, o), t.pop(), e = t[t.length - 1], ft.markEnd(n, e), i.push(n);
                        r = D(), r.prec = a, i.push(r), t.push(pt), n = de(), i.push(n)
                    }
                    for (l = i.length - 1, n = i[l], t.pop(); l > 1;) n = ft.createBinaryExpression(i[l - 1].value, i[l - 2], n), l -= 2, e = t.pop(), ft.markEnd(n, e);
                    return n
                }

                function ye() {
                    var e, t, n, r, a;
                    return a = pt, e = pe(), z("?") && (D(), t = yt.allowIn, yt.allowIn = !0, n = he(), yt.allowIn = t, H(":"), r = he(), e = ft.createConditionalExpression(e, n, r), ft.markEnd(e, a)), e
                }

                function he() {
                    var e, t, n, r, a;
                    return e = pt, a = pt, r = t = ye(), X() && (Q(t) || V({}, at.InvalidLHSInAssignment), ut && t.type === nt.Identifier && m(t.name) && V(e, at.StrictLHSAssignment), e = D(), n = he(), r = ft.markEnd(ft.createAssignmentExpression(e.value, t, n), a)), r
                }

                function Se() {
                    var e, t = pt;
                    if (e = he(), z(",")) {
                        for (e = ft.createSequenceExpression([e]); dt > lt && z(",");) D(), e.expressions.push(he());
                        ft.markEnd(e, t)
                    }
                    return e
                }

                function ge() {
                    for (var e, t = []; dt > lt && !z("}") && (e = $e(), "undefined" != typeof e);) t.push(e);
                    return t
                }

                function ve() {
                    var e, t;
                    return t = pt, H("{"), e = ge(), H("}"), ft.markEnd(ft.createBlockStatement(e), t)
                }

                function ke() {
                    var e, t;
                    return t = pt, e = D(), e.type !== _e.Identifier && M(e), ft.markEnd(ft.createIdentifier(e.value), t)
                }

                function be(e) {
                    var t, n, r = null;
                    return n = pt, t = ke(), ut && m(t.name) && V({}, at.StrictVarName), "const" === e ? (H("="), r = he()) : z("=") && (D(), r = he()), ft.markEnd(ft.createVariableDeclarator(t, r), n)
                }

                function Ee(e) {
                    var t = [];
                    do {
                        if (t.push(be(e)), !z(",")) break;
                        D()
                    } while (dt > lt);
                    return t
                }

                function xe() {
                    var e;
                    return q("var"), e = Ee(), J(), ft.createVariableDeclaration(e, "var")
                }

                function Ce(e) {
                    var t, n;
                    return n = pt, q(e), t = Ee(e), J(), ft.markEnd(ft.createVariableDeclaration(t, e), n)
                }

                function we() {
                    return H(";"), ft.createEmptyStatement()
                }

                function Ie() {
                    var e = Se();
                    return J(), ft.createExpressionStatement(e)
                }

                function Le() {
                    var e, t, n;
                    return q("if"), H("("), e = Se(), H(")"), t = Ve(), $("else") ? (D(), n = Ve()) : n = null, ft.createIfStatement(e, t, n)
                }

                function Ae() {
                    var e, t, n;
                    return q("do"), n = yt.inIteration, yt.inIteration = !0, e = Ve(), yt.inIteration = n, q("while"), H("("), t = Se(), H(")"), z(";") && D(), ft.createDoWhileStatement(e, t)
                }

                function Pe() {
                    var e, t, n;
                    return q("while"), H("("), e = Se(), H(")"), n = yt.inIteration, yt.inIteration = !0, t = Ve(), yt.inIteration = n, ft.createWhileStatement(e, t)
                }

                function Ne() {
                    var e, t, n;
                    return n = pt, e = D(), t = Ee(), ft.markEnd(ft.createVariableDeclaration(t, e.value), n)
                }

                function Oe() {
                    var e, t, n, r, a, i, o, c = yt.allowIn;
                    return e = t = n = null, q("for"), H("("), z(";") ? D() : ($("var") || $("let") ? (yt.allowIn = !1, e = Ne(), yt.allowIn = c, 1 === e.declarations.length && $("in") && (D(), r = e, a = Se(), e = null)) : (yt.allowIn = !1, e = Se(), yt.allowIn = c, $("in") && (Q(e) || V({}, at.InvalidLHSInForIn), D(), r = e, a = Se(), e = null)), "undefined" == typeof r && H(";")), "undefined" == typeof r && (z(";") || (t = Se()), H(";"), z(")") || (n = Se())), H(")"), o = yt.inIteration, yt.inIteration = !0, i = Ve(), yt.inIteration = o, "undefined" == typeof r ? ft.createForStatement(e, t, n, i) : ft.createForInStatement(r, a, i)
                }

                function Ue() {
                    var e, t = null;
                    return q("continue"), 59 === ct.charCodeAt(lt) ? (D(), yt.inIteration || K({}, at.IllegalContinue), ft.createContinueStatement(null)) : G() ? (yt.inIteration || K({}, at.IllegalContinue), ft.createContinueStatement(null)) : (pt.type === _e.Identifier && (t = ke(), e = "$" + t.name, Object.prototype.hasOwnProperty.call(yt.labelSet, e) || K({}, at.UnknownLabel, t.name)), J(), null !== t || yt.inIteration || K({}, at.IllegalContinue), ft.createContinueStatement(t))
                }

                function Re() {
                    var e, t = null;
                    return q("break"), 59 === ct.charCodeAt(lt) ? (D(), yt.inIteration || yt.inSwitch || K({}, at.IllegalBreak), ft.createBreakStatement(null)) : G() ? (yt.inIteration || yt.inSwitch || K({}, at.IllegalBreak), ft.createBreakStatement(null)) : (pt.type === _e.Identifier && (t = ke(), e = "$" + t.name, Object.prototype.hasOwnProperty.call(yt.labelSet, e) || K({}, at.UnknownLabel, t.name)), J(), null !== t || yt.inIteration || yt.inSwitch || K({}, at.IllegalBreak), ft.createBreakStatement(t))
                }

                function Fe() {
                    var e = null;
                    return q("return"), yt.inFunctionBody || V({}, at.IllegalReturn), 32 === ct.charCodeAt(lt) && c(ct.charCodeAt(lt + 1)) ? (e = Se(), J(), ft.createReturnStatement(e)) : G() ? ft.createReturnStatement(null) : (z(";") || z("}") || pt.type === _e.EOF || (e = Se()), J(), ft.createReturnStatement(e))
                }

                function Te() {
                    var e, t;
                    return ut && (h(), V({}, at.StrictModeWith)), q("with"), H("("), e = Se(), H(")"), t = Ve(), ft.createWithStatement(e, t)
                }

                function De() {
                    var e, t, n, r = [];
                    for (n = pt, $("default") ? (D(), e = null) : (q("case"), e = Se()), H(":"); dt > lt && !(z("}") || $("default") || $("case"));) t = Ve(), r.push(t);
                    return ft.markEnd(ft.createSwitchCase(e, r), n)
                }

                function Be() {
                    var e, t, n, r, a;
                    if (q("switch"), H("("), e = Se(), H(")"), H("{"), t = [], z("}")) return D(), ft.createSwitchStatement(e, t);
                    for (r = yt.inSwitch, yt.inSwitch = !0, a = !1; dt > lt && !z("}");) n = De(), null === n.test && (a && K({}, at.MultipleDefaultsInSwitch), a = !0), t.push(n);
                    return yt.inSwitch = r, H("}"), ft.createSwitchStatement(e, t)
                }

                function We() {
                    var e;
                    return q("throw"), G() && K({}, at.NewlineAfterThrow), e = Se(), J(), ft.createThrowStatement(e)
                }

                function je() {
                    var e, t, n;
                    return n = pt, q("catch"), H("("), z(")") && M(pt), e = ke(), ut && m(e.name) && V({}, at.StrictCatchVariable), H(")"), t = ve(), ft.markEnd(ft.createCatchClause(e, t), n)
                }

                function Ge() {
                    var e, t = [], n = null;
                    return q("try"), e = ve(), $("catch") && t.push(je()), $("finally") && (D(), n = ve()), 0 !== t.length || n || K({}, at.NoCatchOrFinally), ft.createTryStatement(e, [], t, n)
                }

                function Ke() {
                    return q("debugger"), J(), ft.createDebuggerStatement()
                }

                function Ve() {
                    var e, t, n, r, a = pt.type;
                    if (a === _e.EOF && M(pt), a === _e.Punctuator && "{" === pt.value) return ve();
                    if (r = pt, a === _e.Punctuator) switch (pt.value) {
                        case";":
                            return ft.markEnd(we(), r);
                        case"(":
                            return ft.markEnd(Ie(), r)
                    }
                    if (a === _e.Keyword) switch (pt.value) {
                        case"break":
                            return ft.markEnd(Re(), r);
                        case"continue":
                            return ft.markEnd(Ue(), r);
                        case"debugger":
                            return ft.markEnd(Ke(), r);
                        case"do":
                            return ft.markEnd(Ae(), r);
                        case"for":
                            return ft.markEnd(Oe(), r);
                        case"function":
                            return ft.markEnd(qe(), r);
                        case"if":
                            return ft.markEnd(Le(), r);
                        case"return":
                            return ft.markEnd(Fe(), r);
                        case"switch":
                            return ft.markEnd(Be(), r);
                        case"throw":
                            return ft.markEnd(We(), r);
                        case"try":
                            return ft.markEnd(Ge(), r);
                        case"var":
                            return ft.markEnd(xe(), r);
                        case"while":
                            return ft.markEnd(Pe(), r);
                        case"with":
                            return ft.markEnd(Te(), r)
                    }
                    return e = Se(), e.type === nt.Identifier && z(":") ? (D(), n = "$" + e.name, Object.prototype.hasOwnProperty.call(yt.labelSet, n) && K({}, at.Redeclaration, "Label", e.name), yt.labelSet[n] = !0, t = Ve(), delete yt.labelSet[n], ft.markEnd(ft.createLabeledStatement(e, t), r)) : (J(), ft.markEnd(ft.createExpressionStatement(e), r))
                }

                function Me() {
                    var e, t, n, r, a, i, o, c, u, l = [];
                    for (u = pt, H("{"); dt > lt && pt.type === _e.StringLiteral && (t = pt, e = $e(), l.push(e), e.expression.type === nt.Literal);) n = ct.slice(t.start + 1, t.end - 1), "use strict" === n ? (ut = !0, r && V(r, at.StrictOctalLiteral)) : !r && t.octal && (r = t);
                    for (a = yt.labelSet, i = yt.inIteration, o = yt.inSwitch, c = yt.inFunctionBody, yt.labelSet = {}, yt.inIteration = !1, yt.inSwitch = !1, yt.inFunctionBody = !0; dt > lt && !z("}") && (e = $e(), "undefined" != typeof e);) l.push(e);
                    return H("}"), yt.labelSet = a, yt.inIteration = i, yt.inSwitch = o, yt.inFunctionBody = c, ft.markEnd(ft.createBlockStatement(l), u)
                }

                function He(e) {
                    var t, n, r, a, i, o, c = [];
                    if (H("("), !z(")")) for (a = {}; dt > lt && (n = pt, t = ke(), i = "$" + n.value, ut ? (m(n.value) && (r = n, o = at.StrictParamName), Object.prototype.hasOwnProperty.call(a, i) && (r = n, o = at.StrictParamDupe)) : e || (m(n.value) ? (e = n, o = at.StrictParamName) : s(n.value) ? (e = n, o = at.StrictReservedWord) : Object.prototype.hasOwnProperty.call(a, i) && (e = n, o = at.StrictParamDupe)), c.push(t), a[i] = !0, !z(")"));) H(",");
                    return H(")"), {params: c, stricted: r, firstRestricted: e, message: o}
                }

                function qe() {
                    var e, t, n, r, a, i, o, c, u, l = [];
                    return u = pt, q("function"), n = pt, e = ke(), ut ? m(n.value) && V(n, at.StrictFunctionName) : m(n.value) ? (i = n, o = at.StrictFunctionName) : s(n.value) && (i = n, o = at.StrictReservedWord), a = He(i), l = a.params, r = a.stricted, i = a.firstRestricted, a.message && (o = a.message), c = ut, t = Me(), ut && i && K(i, o), ut && r && V(r, o), ut = c, ft.markEnd(ft.createFunctionDeclaration(e, l, [], t), u)
                }

                function ze() {
                    var e, t, n, r, a, i, o, c, u = null, l = [];
                    return c = pt, q("function"), z("(") || (e = pt, u = ke(), ut ? m(e.value) && V(e, at.StrictFunctionName) : m(e.value) ? (n = e, r = at.StrictFunctionName) : s(e.value) && (n = e, r = at.StrictReservedWord)), a = He(n), l = a.params, t = a.stricted, n = a.firstRestricted, a.message && (r = a.message), o = ut, i = Me(), ut && n && K(n, r), ut && t && V(t, r), ut = o, ft.markEnd(ft.createFunctionExpression(u, l, [], i), c)
                }

                function $e() {
                    if (pt.type === _e.Keyword) switch (pt.value) {
                        case"const":
                        case"let":
                            return Ce(pt.value);
                        case"function":
                            return qe();
                        default:
                            return Ve()
                    }
                    return pt.type !== _e.EOF ? Ve() : void 0
                }

                function Xe() {
                    for (var e, t, n, r, a = []; dt > lt && (t = pt, t.type === _e.StringLiteral) && (e = $e(), a.push(e), e.expression.type === nt.Literal);) n = ct.slice(t.start + 1, t.end - 1), "use strict" === n ? (ut = !0, r && V(r, at.StrictOctalLiteral)) : !r && t.octal && (r = t);
                    for (; dt > lt && (e = $e(), "undefined" != typeof e);) a.push(e);
                    return a
                }

                function Je() {
                    var e, t;
                    return h(), B(), t = pt, ut = !1, e = Xe(), ft.markEnd(ft.createProgram(e), t)
                }

                function Qe() {
                    var e, t, n, r = [];
                    for (e = 0; e < ht.tokens.length; ++e) t = ht.tokens[e], n = {
                        type: t.type,
                        value: t.value
                    }, ht.range && (n.range = t.range), ht.loc && (n.loc = t.loc), r.push(n);
                    ht.tokens = r
                }

                function Ye(e, t) {
                    var n, r, a;
                    n = String, "string" == typeof e || e instanceof String || (e = n(e)), ft = ot, ct = e, lt = 0, st = ct.length > 0 ? 1 : 0, mt = 0, dt = ct.length, pt = null, yt = {
                        allowIn: !0,
                        labelSet: {},
                        inFunctionBody: !1,
                        inIteration: !1,
                        inSwitch: !1,
                        lastCommentStart: -1
                    }, ht = {}, t = t || {}, t.tokens = !0, ht.tokens = [], ht.tokenize = !0, ht.openParenToken = -1, ht.openCurlyToken = -1, ht.range = "boolean" == typeof t.range && t.range, ht.loc = "boolean" == typeof t.loc && t.loc, "boolean" == typeof t.comment && t.comment && (ht.comments = []), "boolean" == typeof t.tolerant && t.tolerant && (ht.errors = []);
                    try {
                        if (B(), pt.type === _e.EOF) return ht.tokens;
                        for (r = D(); pt.type !== _e.EOF;) try {
                            r = D()
                        } catch (i) {
                            if (r = pt, ht.errors) {
                                ht.errors.push(i);
                                break
                            }
                            throw i
                        }
                        Qe(), a = ht.tokens, "undefined" != typeof ht.comments && (a.comments = ht.comments), "undefined" != typeof ht.errors && (a.errors = ht.errors)
                    } catch (o) {
                        throw o
                    } finally {
                        ht = {}
                    }
                    return a
                }

                function Ze(e, t) {
                    var n, r;
                    r = String, "string" == typeof e || e instanceof String || (e = r(e)), ft = ot, ct = e, lt = 0, st = ct.length > 0 ? 1 : 0, mt = 0, dt = ct.length, pt = null, yt = {
                        allowIn: !0,
                        labelSet: {},
                        inFunctionBody: !1,
                        inIteration: !1,
                        inSwitch: !1,
                        lastCommentStart: -1
                    }, ht = {}, "undefined" != typeof t && (ht.range = "boolean" == typeof t.range && t.range, ht.loc = "boolean" == typeof t.loc && t.loc, ht.attachComment = "boolean" == typeof t.attachComment && t.attachComment, ht.loc && null !== t.source && void 0 !== t.source && (ht.source = r(t.source)), "boolean" == typeof t.tokens && t.tokens && (ht.tokens = []), "boolean" == typeof t.comment && t.comment && (ht.comments = []), "boolean" == typeof t.tolerant && t.tolerant && (ht.errors = []), ht.attachComment && (ht.range = !0, ht.comments = [], ht.bottomRightStack = [], ht.trailingComments = [], ht.leadingComments = []));
                    try {
                        n = Je(), "undefined" != typeof ht.comments && (n.comments = ht.comments), "undefined" != typeof ht.tokens && (Qe(), n.tokens = ht.tokens), "undefined" != typeof ht.errors && (n.errors = ht.errors)
                    } catch (a) {
                        throw a
                    } finally {
                        ht = {}
                    }
                    return n
                }

                var _e, et, tt, nt, rt, at, it, ot, ct, ut, lt, st, mt, dt, ft, pt, yt, ht;
                _e = {
                    BooleanLiteral: 1,
                    EOF: 2,
                    Identifier: 3,
                    Keyword: 4,
                    NullLiteral: 5,
                    NumericLiteral: 6,
                    Punctuator: 7,
                    StringLiteral: 8,
                    RegularExpression: 9
                }, et = {}, et[_e.BooleanLiteral] = "Boolean", et[_e.EOF] = "<end>", et[_e.Identifier] = "Identifier", et[_e.Keyword] = "Keyword", et[_e.NullLiteral] = "Null", et[_e.NumericLiteral] = "Numeric", et[_e.Punctuator] = "Punctuator", et[_e.StringLiteral] = "String", et[_e.RegularExpression] = "RegularExpression", tt = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void", "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",", "+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="], nt = {
                    AssignmentExpression: "AssignmentExpression",
                    ArrayExpression: "ArrayExpression",
                    BlockStatement: "BlockStatement",
                    BinaryExpression: "BinaryExpression",
                    BreakStatement: "BreakStatement",
                    CallExpression: "CallExpression",
                    CatchClause: "CatchClause",
                    ConditionalExpression: "ConditionalExpression",
                    ContinueStatement: "ContinueStatement",
                    DoWhileStatement: "DoWhileStatement",
                    DebuggerStatement: "DebuggerStatement",
                    EmptyStatement: "EmptyStatement",
                    ExpressionStatement: "ExpressionStatement",
                    ForStatement: "ForStatement",
                    ForInStatement: "ForInStatement",
                    FunctionDeclaration: "FunctionDeclaration",
                    FunctionExpression: "FunctionExpression",
                    Identifier: "Identifier",
                    IfStatement: "IfStatement",
                    Literal: "Literal",
                    LabeledStatement: "LabeledStatement",
                    LogicalExpression: "LogicalExpression",
                    MemberExpression: "MemberExpression",
                    NewExpression: "NewExpression",
                    ObjectExpression: "ObjectExpression",
                    Program: "Program",
                    Property: "Property",
                    ReturnStatement: "ReturnStatement",
                    SequenceExpression: "SequenceExpression",
                    SwitchStatement: "SwitchStatement",
                    SwitchCase: "SwitchCase",
                    ThisExpression: "ThisExpression",
                    ThrowStatement: "ThrowStatement",
                    TryStatement: "TryStatement",
                    UnaryExpression: "UnaryExpression",
                    UpdateExpression: "UpdateExpression",
                    VariableDeclaration: "VariableDeclaration",
                    VariableDeclarator: "VariableDeclarator",
                    WhileStatement: "WhileStatement",
                    WithStatement: "WithStatement"
                }, rt = {Data: 1, Get: 2, Set: 4}, at = {
                    UnexpectedToken: "Unexpected token %0",
                    UnexpectedNumber: "Unexpected number",
                    UnexpectedString: "Unexpected string",
                    UnexpectedIdentifier: "Unexpected identifier",
                    UnexpectedReserved: "Unexpected reserved word",
                    UnexpectedEOS: "Unexpected end of input",
                    NewlineAfterThrow: "Illegal newline after throw",
                    InvalidRegExp: "Invalid regular expression",
                    UnterminatedRegExp: "Invalid regular expression: missing /",
                    InvalidLHSInAssignment: "Invalid left-hand side in assignment",
                    InvalidLHSInForIn: "Invalid left-hand side in for-in",
                    MultipleDefaultsInSwitch: "More than one default clause in switch statement",
                    NoCatchOrFinally: "Missing catch or finally after try",
                    UnknownLabel: "Undefined label '%0'",
                    Redeclaration: "%0 '%1' has already been declared",
                    IllegalContinue: "Illegal continue statement",
                    IllegalBreak: "Illegal break statement",
                    IllegalReturn: "Illegal return statement",
                    StrictModeWith: "Strict mode code may not include a with statement",
                    StrictCatchVariable: "Catch variable may not be eval or arguments in strict mode",
                    StrictVarName: "Variable name may not be eval or arguments in strict mode",
                    StrictParamName: "Parameter name eval or arguments is not allowed in strict mode",
                    StrictParamDupe: "Strict mode function may not have duplicate parameter names",
                    StrictFunctionName: "Function name may not be eval or arguments in strict mode",
                    StrictOctalLiteral: "Octal literals are not allowed in strict mode.",
                    StrictDelete: "Delete of an unqualified identifier in strict mode.",
                    StrictDuplicateProperty: "Duplicate data property in object literal not allowed in strict mode",
                    AccessorDataProperty: "Object literal may not have data and accessor property with the same name",
                    AccessorGetSet: "Object literal may not have multiple get/set accessors with the same name",
                    StrictLHSAssignment: "Assignment to eval or arguments is not allowed in strict mode",
                    StrictLHSPostfix: "Postfix increment/decrement may not have eval or arguments operand in strict mode",
                    StrictLHSPrefix: "Prefix increment/decrement may not have eval or arguments operand in strict mode",
                    StrictReservedWord: "Use of future reserved word in strict mode"
                }, it = {
                    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
                    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
                }, ot = {
                    name: "SyntaxTree", processComment: function (e) {
                        var t, n;
                        if (!(e.type === nt.Program && e.body.length > 0)) {
                            for (ht.trailingComments.length > 0 ? ht.trailingComments[0].range[0] >= e.range[1] ? (n = ht.trailingComments, ht.trailingComments = []) : ht.trailingComments.length = 0 : ht.bottomRightStack.length > 0 && ht.bottomRightStack[ht.bottomRightStack.length - 1].trailingComments && ht.bottomRightStack[ht.bottomRightStack.length - 1].trailingComments[0].range[0] >= e.range[1] && (n = ht.bottomRightStack[ht.bottomRightStack.length - 1].trailingComments, delete ht.bottomRightStack[ht.bottomRightStack.length - 1].trailingComments); ht.bottomRightStack.length > 0 && ht.bottomRightStack[ht.bottomRightStack.length - 1].range[0] >= e.range[0];) t = ht.bottomRightStack.pop();
                            t ? t.leadingComments && t.leadingComments[t.leadingComments.length - 1].range[1] <= e.range[0] && (e.leadingComments = t.leadingComments, delete t.leadingComments) : ht.leadingComments.length > 0 && ht.leadingComments[ht.leadingComments.length - 1].range[1] <= e.range[0] && (e.leadingComments = ht.leadingComments, ht.leadingComments = []), n && (e.trailingComments = n), ht.bottomRightStack.push(e)
                        }
                    }, markEnd: function (e, t) {
                        return ht.range && (e.range = [t.start, lt]), ht.loc && (e.loc = new j(void 0 === t.startLineNumber ? t.lineNumber : t.startLineNumber, t.start - (void 0 === t.startLineStart ? t.lineStart : t.startLineStart), st, lt - mt), this.postProcess(e)), ht.attachComment && this.processComment(e), e
                    }, postProcess: function (e) {
                        return ht.source && (e.loc.source = ht.source), e
                    }, createArrayExpression: function (e) {
                        return {type: nt.ArrayExpression, elements: e}
                    }, createAssignmentExpression: function (e, t, n) {
                        return {type: nt.AssignmentExpression, operator: e, left: t, right: n}
                    }, createBinaryExpression: function (e, t, n) {
                        var r = "||" === e || "&&" === e ? nt.LogicalExpression : nt.BinaryExpression;
                        return {type: r, operator: e, left: t, right: n}
                    }, createBlockStatement: function (e) {
                        return {type: nt.BlockStatement, body: e}
                    }, createBreakStatement: function (e) {
                        return {type: nt.BreakStatement, label: e}
                    }, createCallExpression: function (e, t) {
                        return {type: nt.CallExpression, callee: e, arguments: t}
                    }, createCatchClause: function (e, t) {
                        return {type: nt.CatchClause, param: e, body: t}
                    }, createConditionalExpression: function (e, t, n) {
                        return {type: nt.ConditionalExpression, test: e, consequent: t, alternate: n}
                    }, createContinueStatement: function (e) {
                        return {type: nt.ContinueStatement, label: e}
                    }, createDebuggerStatement: function () {
                        return {type: nt.DebuggerStatement}
                    }, createDoWhileStatement: function (e, t) {
                        return {type: nt.DoWhileStatement, body: e, test: t}
                    }, createEmptyStatement: function () {
                        return {type: nt.EmptyStatement}
                    }, createExpressionStatement: function (e) {
                        return {type: nt.ExpressionStatement, expression: e}
                    }, createForStatement: function (e, t, n, r) {
                        return {type: nt.ForStatement, init: e, test: t, update: n, body: r}
                    }, createForInStatement: function (e, t, n) {
                        return {type: nt.ForInStatement, left: e, right: t, body: n, each: !1}
                    }, createFunctionDeclaration: function (e, t, n, r) {
                        return {
                            type: nt.FunctionDeclaration,
                            id: e,
                            params: t,
                            defaults: n,
                            body: r,
                            rest: null,
                            generator: !1,
                            expression: !1
                        }
                    }, createFunctionExpression: function (e, t, n, r) {
                        return {
                            type: nt.FunctionExpression,
                            id: e,
                            params: t,
                            defaults: n,
                            body: r,
                            rest: null,
                            generator: !1,
                            expression: !1
                        }
                    }, createIdentifier: function (e) {
                        return {type: nt.Identifier, name: e}
                    }, createIfStatement: function (e, t, n) {
                        return {type: nt.IfStatement, test: e, consequent: t, alternate: n}
                    }, createLabeledStatement: function (e, t) {
                        return {type: nt.LabeledStatement, label: e, body: t}
                    }, createLiteral: function (e) {
                        return {type: nt.Literal, value: e.value, raw: ct.slice(e.start, e.end)}
                    }, createMemberExpression: function (e, t, n) {
                        return {type: nt.MemberExpression, computed: "[" === e, object: t, property: n}
                    }, createNewExpression: function (e, t) {
                        return {type: nt.NewExpression, callee: e, arguments: t}
                    }, createObjectExpression: function (e) {
                        return {type: nt.ObjectExpression, properties: e}
                    }, createPostfixExpression: function (e, t) {
                        return {type: nt.UpdateExpression, operator: e, argument: t, prefix: !1}
                    }, createProgram: function (e) {
                        return {type: nt.Program, body: e}
                    }, createProperty: function (e, t, n) {
                        return {type: nt.Property, key: t, value: n, kind: e}
                    }, createReturnStatement: function (e) {
                        return {type: nt.ReturnStatement, argument: e}
                    }, createSequenceExpression: function (e) {
                        return {type: nt.SequenceExpression, expressions: e}
                    }, createSwitchCase: function (e, t) {
                        return {type: nt.SwitchCase, test: e, consequent: t}
                    }, createSwitchStatement: function (e, t) {
                        return {type: nt.SwitchStatement, discriminant: e, cases: t}
                    }, createThisExpression: function () {
                        return {type: nt.ThisExpression}
                    }, createThrowStatement: function (e) {
                        return {type: nt.ThrowStatement, argument: e}
                    }, createTryStatement: function (e, t, n, r) {
                        return {type: nt.TryStatement, block: e, guardedHandlers: t, handlers: n, finalizer: r}
                    }, createUnaryExpression: function (e, t) {
                        return "++" === e || "--" === e ? {
                            type: nt.UpdateExpression,
                            operator: e,
                            argument: t,
                            prefix: !0
                        } : {type: nt.UnaryExpression, operator: e, argument: t, prefix: !0}
                    }, createVariableDeclaration: function (e, t) {
                        return {type: nt.VariableDeclaration, declarations: e, kind: t}
                    }, createVariableDeclarator: function (e, t) {
                        return {type: nt.VariableDeclarator, id: e, init: t}
                    }, createWhileStatement: function (e, t) {
                        return {type: nt.WhileStatement, test: e, body: t}
                    }, createWithStatement: function (e, t) {
                        return {type: nt.WithStatement, object: e, body: t}
                    }
                }, e.version = "1.2.5", e.tokenize = Ye, e.parse = Ze, e.Syntax = function () {
                    var e, t = {};
                    "function" == typeof Object.create && (t = Object.create(null));
                    for (e in nt) nt.hasOwnProperty(e) && (t[e] = nt[e]);
                    return "function" == typeof Object.freeze && Object.freeze(t), t
                }()
            });
        }, {}],
        9: [function (require, module, exports) {
            function EventEmitter() {
                this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
            }

            function isFunction(e) {
                return "function" == typeof e
            }

            function isNumber(e) {
                return "number" == typeof e
            }

            function isObject(e) {
                return "object" == typeof e && null !== e
            }

            function isUndefined(e) {
                return void 0 === e
            }

            module.exports = EventEmitter, EventEmitter.EventEmitter = EventEmitter, EventEmitter.prototype._events = void 0, EventEmitter.prototype._maxListeners = void 0, EventEmitter.defaultMaxListeners = 10, EventEmitter.prototype.setMaxListeners = function (e) {
                if (!isNumber(e) || 0 > e || isNaN(e)) throw TypeError("n must be a positive number");
                return this._maxListeners = e, this
            }, EventEmitter.prototype.emit = function (e) {
                var t, n, i, s, r, o;
                if (this._events || (this._events = {}), "error" === e && (!this._events.error || isObject(this._events.error) && !this._events.error.length)) {
                    if (t = arguments[1], t instanceof Error) throw t;
                    throw TypeError('Uncaught, unspecified "error" event.')
                }
                if (n = this._events[e], isUndefined(n)) return !1;
                if (isFunction(n)) switch (arguments.length) {
                    case 1:
                        n.call(this);
                        break;
                    case 2:
                        n.call(this, arguments[1]);
                        break;
                    case 3:
                        n.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        s = Array.prototype.slice.call(arguments, 1), n.apply(this, s)
                } else if (isObject(n)) for (s = Array.prototype.slice.call(arguments, 1), o = n.slice(), i = o.length, r = 0; i > r; r++) o[r].apply(this, s);
                return !0
            }, EventEmitter.prototype.addListener = function (e, t) {
                var n;
                if (!isFunction(t)) throw TypeError("listener must be a function");
                return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", e, isFunction(t.listener) ? t.listener : t), this._events[e] ? isObject(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t, isObject(this._events[e]) && !this._events[e].warned && (n = isUndefined(this._maxListeners) ? EventEmitter.defaultMaxListeners : this._maxListeners, n && n > 0 && this._events[e].length > n && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), "function" == typeof console.trace && console.trace())), this
            }, EventEmitter.prototype.on = EventEmitter.prototype.addListener, EventEmitter.prototype.once = function (e, t) {
                function n() {
                    this.removeListener(e, n), i || (i = !0, t.apply(this, arguments))
                }

                if (!isFunction(t)) throw TypeError("listener must be a function");
                var i = !1;
                return n.listener = t, this.on(e, n), this
            }, EventEmitter.prototype.removeListener = function (e, t) {
                var n, i, s, r;
                if (!isFunction(t)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[e]) return this;
                if (n = this._events[e], s = n.length, i = -1, n === t || isFunction(n.listener) && n.listener === t) delete this._events[e], this._events.removeListener && this.emit("removeListener", e, t); else if (isObject(n)) {
                    for (r = s; r-- > 0;) if (n[r] === t || n[r].listener && n[r].listener === t) {
                        i = r;
                        break
                    }
                    if (0 > i) return this;
                    1 === n.length ? (n.length = 0, delete this._events[e]) : n.splice(i, 1), this._events.removeListener && this.emit("removeListener", e, t)
                }
                return this
            }, EventEmitter.prototype.removeAllListeners = function (e) {
                var t, n;
                if (!this._events) return this;
                if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e], this;
                if (0 === arguments.length) {
                    for (t in this._events) "removeListener" !== t && this.removeAllListeners(t);
                    return this.removeAllListeners("removeListener"), this._events = {}, this
                }
                if (n = this._events[e], isFunction(n)) this.removeListener(e, n); else if (n) for (; n.length;) this.removeListener(e, n[n.length - 1]);
                return delete this._events[e], this
            }, EventEmitter.prototype.listeners = function (e) {
                var t;
                return t = this._events && this._events[e] ? isFunction(this._events[e]) ? [this._events[e]] : this._events[e].slice() : []
            }, EventEmitter.prototype.listenerCount = function (e) {
                if (this._events) {
                    var t = this._events[e];
                    if (isFunction(t)) return 1;
                    if (t) return t.length
                }
                return 0
            }, EventEmitter.listenerCount = function (e, t) {
                return e.listenerCount(t)
            };
        }, {}],
        10: [function (require, module, exports) {
            "use strict";

            function iota(r) {
                for (var t = new Array(r), o = 0; r > o; ++o) t[o] = o;
                return t
            }

            module.exports = iota;
        }, {}],
        11: [function (require, module, exports) {
            module.exports = function (r) {
                return !(null == r || !(r._isBuffer || r.constructor && "function" == typeof r.constructor.isBuffer && r.constructor.isBuffer(r)))
            };
        }, {}],
        12: [function (require, module, exports) {
            "use strict";

            function fixup(a) {
                if (!a) return EmptyProc;
                for (var r = 0; r < a.args.length; ++r) {
                    var s = a.args[r];
                    0 === r ? a.args[r] = {
                        name: s,
                        lvalue: !0,
                        rvalue: !!a.rvalue,
                        count: a.count || 1
                    } : a.args[r] = {name: s, lvalue: !1, rvalue: !0, count: 1}
                }
                return a.thisVars || (a.thisVars = []), a.localVars || (a.localVars = []), a
            }

            function pcompile(a) {
                return compile({
                    args: a.args,
                    pre: fixup(a.pre),
                    body: fixup(a.body),
                    post: fixup(a.proc),
                    funcName: a.funcName
                })
            }

            function makeOp(a) {
                for (var r = [], s = 0; s < a.args.length; ++s) r.push("a" + s);
                var i = new Function("P", ["return function ", a.funcName, "_ndarrayops(", r.join(","), ") {P(", r.join(","), ");return a0}"].join(""));
                return i(pcompile(a))
            }

            var compile = require("cwise-compiler"), EmptyProc = {body: "", args: [], thisVars: [], localVars: []},
                assign_ops = {
                    add: "+",
                    sub: "-",
                    mul: "*",
                    div: "/",
                    mod: "%",
                    band: "&",
                    bor: "|",
                    bxor: "^",
                    lshift: "<<",
                    rshift: ">>",
                    rrshift: ">>>"
                };
            !function () {
                for (var a in assign_ops) {
                    var r = assign_ops[a];
                    exports[a] = makeOp({
                        args: ["array", "array", "array"],
                        body: {args: ["a", "b", "c"], body: "a=b" + r + "c"},
                        funcName: a
                    }), exports[a + "eq"] = makeOp({
                        args: ["array", "array"],
                        body: {args: ["a", "b"], body: "a" + r + "=b"},
                        rvalue: !0,
                        funcName: a + "eq"
                    }), exports[a + "s"] = makeOp({
                        args: ["array", "array", "scalar"],
                        body: {args: ["a", "b", "s"], body: "a=b" + r + "s"},
                        funcName: a + "s"
                    }), exports[a + "seq"] = makeOp({
                        args: ["array", "scalar"],
                        body: {args: ["a", "s"], body: "a" + r + "=s"},
                        rvalue: !0,
                        funcName: a + "seq"
                    })
                }
            }();
            var unary_ops = {not: "!", bnot: "~", neg: "-", recip: "1.0/"};
            !function () {
                for (var a in unary_ops) {
                    var r = unary_ops[a];
                    exports[a] = makeOp({
                        args: ["array", "array"],
                        body: {args: ["a", "b"], body: "a=" + r + "b"},
                        funcName: a
                    }), exports[a + "eq"] = makeOp({
                        args: ["array"],
                        body: {args: ["a"], body: "a=" + r + "a"},
                        rvalue: !0,
                        count: 2,
                        funcName: a + "eq"
                    })
                }
            }();
            var binary_ops = {and: "&&", or: "||", eq: "===", neq: "!==", lt: "<", gt: ">", leq: "<=", geq: ">="};
            !function () {
                for (var a in binary_ops) {
                    var r = binary_ops[a];
                    exports[a] = makeOp({
                        args: ["array", "array", "array"],
                        body: {args: ["a", "b", "c"], body: "a=b" + r + "c"},
                        funcName: a
                    }), exports[a + "s"] = makeOp({
                        args: ["array", "array", "scalar"],
                        body: {args: ["a", "b", "s"], body: "a=b" + r + "s"},
                        funcName: a + "s"
                    }), exports[a + "eq"] = makeOp({
                        args: ["array", "array"],
                        body: {args: ["a", "b"], body: "a=a" + r + "b"},
                        rvalue: !0,
                        count: 2,
                        funcName: a + "eq"
                    }), exports[a + "seq"] = makeOp({
                        args: ["array", "scalar"],
                        body: {args: ["a", "s"], body: "a=a" + r + "s"},
                        rvalue: !0,
                        count: 2,
                        funcName: a + "seq"
                    })
                }
            }();
            var math_unary = ["abs", "acos", "asin", "atan", "ceil", "cos", "exp", "floor", "log", "round", "sin", "sqrt", "tan"];
            !function () {
                for (var a = 0; a < math_unary.length; ++a) {
                    var r = math_unary[a];
                    exports[r] = makeOp({
                        args: ["array", "array"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b"], body: "a=this_f(b)", thisVars: ["this_f"]},
                        funcName: r
                    }), exports[r + "eq"] = makeOp({
                        args: ["array"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a"], body: "a=this_f(a)", thisVars: ["this_f"]},
                        rvalue: !0,
                        count: 2,
                        funcName: r + "eq"
                    })
                }
            }();
            var math_comm = ["max", "min", "atan2", "pow"];
            !function () {
                for (var a = 0; a < math_comm.length; ++a) {
                    var r = math_comm[a];
                    exports[r] = makeOp({
                        args: ["array", "array", "array"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b", "c"], body: "a=this_f(b,c)", thisVars: ["this_f"]},
                        funcName: r
                    }), exports[r + "s"] = makeOp({
                        args: ["array", "array", "scalar"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b", "c"], body: "a=this_f(b,c)", thisVars: ["this_f"]},
                        funcName: r + "s"
                    }), exports[r + "eq"] = makeOp({
                        args: ["array", "array"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b"], body: "a=this_f(a,b)", thisVars: ["this_f"]},
                        rvalue: !0,
                        count: 2,
                        funcName: r + "eq"
                    }), exports[r + "seq"] = makeOp({
                        args: ["array", "scalar"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b"], body: "a=this_f(a,b)", thisVars: ["this_f"]},
                        rvalue: !0,
                        count: 2,
                        funcName: r + "seq"
                    })
                }
            }();
            var math_noncomm = ["atan2", "pow"];
            !function () {
                for (var a = 0; a < math_noncomm.length; ++a) {
                    var r = math_noncomm[a];
                    exports[r + "op"] = makeOp({
                        args: ["array", "array", "array"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b", "c"], body: "a=this_f(c,b)", thisVars: ["this_f"]},
                        funcName: r + "op"
                    }), exports[r + "ops"] = makeOp({
                        args: ["array", "array", "scalar"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b", "c"], body: "a=this_f(c,b)", thisVars: ["this_f"]},
                        funcName: r + "ops"
                    }), exports[r + "opeq"] = makeOp({
                        args: ["array", "array"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b"], body: "a=this_f(b,a)", thisVars: ["this_f"]},
                        rvalue: !0,
                        count: 2,
                        funcName: r + "opeq"
                    }), exports[r + "opseq"] = makeOp({
                        args: ["array", "scalar"],
                        pre: {args: [], body: "this_f=Math." + r, thisVars: ["this_f"]},
                        body: {args: ["a", "b"], body: "a=this_f(b,a)", thisVars: ["this_f"]},
                        rvalue: !0,
                        count: 2,
                        funcName: r + "opseq"
                    })
                }
            }(), exports.any = compile({
                args: ["array"],
                pre: EmptyProc,
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 1}],
                    body: "if(a){return true}",
                    localVars: [],
                    thisVars: []
                },
                post: {args: [], localVars: [], thisVars: [], body: "return false"},
                funcName: "any"
            }), exports.all = compile({
                args: ["array"],
                pre: EmptyProc,
                body: {
                    args: [{name: "x", lvalue: !1, rvalue: !0, count: 1}],
                    body: "if(!x){return false}",
                    localVars: [],
                    thisVars: []
                },
                post: {args: [], localVars: [], thisVars: [], body: "return true"},
                funcName: "all"
            }), exports.sum = compile({
                args: ["array"],
                pre: {args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0"},
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 1}],
                    body: "this_s+=a",
                    localVars: [],
                    thisVars: ["this_s"]
                },
                post: {args: [], localVars: [], thisVars: ["this_s"], body: "return this_s"},
                funcName: "sum"
            }), exports.prod = compile({
                args: ["array"],
                pre: {args: [], localVars: [], thisVars: ["this_s"], body: "this_s=1"},
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 1}],
                    body: "this_s*=a",
                    localVars: [],
                    thisVars: ["this_s"]
                },
                post: {args: [], localVars: [], thisVars: ["this_s"], body: "return this_s"},
                funcName: "prod"
            }), exports.norm2squared = compile({
                args: ["array"],
                pre: {args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0"},
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 2}],
                    body: "this_s+=a*a",
                    localVars: [],
                    thisVars: ["this_s"]
                },
                post: {args: [], localVars: [], thisVars: ["this_s"], body: "return this_s"},
                funcName: "norm2squared"
            }), exports.norm2 = compile({
                args: ["array"],
                pre: {args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0"},
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 2}],
                    body: "this_s+=a*a",
                    localVars: [],
                    thisVars: ["this_s"]
                },
                post: {args: [], localVars: [], thisVars: ["this_s"], body: "return Math.sqrt(this_s)"},
                funcName: "norm2"
            }), exports.norminf = compile({
                args: ["array"],
                pre: {args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0"},
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 4}],
                    body: "if(-a>this_s){this_s=-a}else if(a>this_s){this_s=a}",
                    localVars: [],
                    thisVars: ["this_s"]
                },
                post: {args: [], localVars: [], thisVars: ["this_s"], body: "return this_s"},
                funcName: "norminf"
            }), exports.norm1 = compile({
                args: ["array"],
                pre: {args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0"},
                body: {
                    args: [{name: "a", lvalue: !1, rvalue: !0, count: 3}],
                    body: "this_s+=a<0?-a:a",
                    localVars: [],
                    thisVars: ["this_s"]
                },
                post: {args: [], localVars: [], thisVars: ["this_s"], body: "return this_s"},
                funcName: "norm1"
            }), exports.sup = compile({
                args: ["array"],
                pre: {body: "this_h=-Infinity", args: [], thisVars: ["this_h"], localVars: []},
                body: {
                    body: "if(_inline_1_arg0_>this_h)this_h=_inline_1_arg0_",
                    args: [{name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2}],
                    thisVars: ["this_h"],
                    localVars: []
                },
                post: {body: "return this_h", args: [], thisVars: ["this_h"], localVars: []}
            }), exports.inf = compile({
                args: ["array"],
                pre: {body: "this_h=Infinity", args: [], thisVars: ["this_h"], localVars: []},
                body: {
                    body: "if(_inline_1_arg0_<this_h)this_h=_inline_1_arg0_",
                    args: [{name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2}],
                    thisVars: ["this_h"],
                    localVars: []
                },
                post: {body: "return this_h", args: [], thisVars: ["this_h"], localVars: []}
            }), exports.argmin = compile({
                args: ["index", "array", "shape"],
                pre: {
                    body: "{this_v=Infinity;this_i=_inline_0_arg2_.slice(0)}",
                    args: [{name: "_inline_0_arg0_", lvalue: !1, rvalue: !1, count: 0}, {
                        name: "_inline_0_arg1_",
                        lvalue: !1,
                        rvalue: !1,
                        count: 0
                    }, {name: "_inline_0_arg2_", lvalue: !1, rvalue: !0, count: 1}],
                    thisVars: ["this_i", "this_v"],
                    localVars: []
                },
                body: {
                    body: "{if(_inline_1_arg1_<this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
                    args: [{name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2}, {
                        name: "_inline_1_arg1_",
                        lvalue: !1,
                        rvalue: !0,
                        count: 2
                    }],
                    thisVars: ["this_i", "this_v"],
                    localVars: ["_inline_1_k"]
                },
                post: {body: "{return this_i}", args: [], thisVars: ["this_i"], localVars: []}
            }), exports.argmax = compile({
                args: ["index", "array", "shape"],
                pre: {
                    body: "{this_v=-Infinity;this_i=_inline_0_arg2_.slice(0)}",
                    args: [{name: "_inline_0_arg0_", lvalue: !1, rvalue: !1, count: 0}, {
                        name: "_inline_0_arg1_",
                        lvalue: !1,
                        rvalue: !1,
                        count: 0
                    }, {name: "_inline_0_arg2_", lvalue: !1, rvalue: !0, count: 1}],
                    thisVars: ["this_i", "this_v"],
                    localVars: []
                },
                body: {
                    body: "{if(_inline_1_arg1_>this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
                    args: [{name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2}, {
                        name: "_inline_1_arg1_",
                        lvalue: !1,
                        rvalue: !0,
                        count: 2
                    }],
                    thisVars: ["this_i", "this_v"],
                    localVars: ["_inline_1_k"]
                },
                post: {body: "{return this_i}", args: [], thisVars: ["this_i"], localVars: []}
            }), exports.random = makeOp({
                args: ["array"],
                pre: {args: [], body: "this_f=Math.random", thisVars: ["this_f"]},
                body: {args: ["a"], body: "a=this_f()", thisVars: ["this_f"]},
                funcName: "random"
            }), exports.assign = makeOp({
                args: ["array", "array"],
                body: {args: ["a", "b"], body: "a=b"},
                funcName: "assign"
            }), exports.assigns = makeOp({
                args: ["array", "scalar"],
                body: {args: ["a", "b"], body: "a=b"},
                funcName: "assigns"
            }), exports.equals = compile({
                args: ["array", "array"],
                pre: EmptyProc,
                body: {
                    args: [{name: "x", lvalue: !1, rvalue: !0, count: 1}, {
                        name: "y",
                        lvalue: !1,
                        rvalue: !0,
                        count: 1
                    }], body: "if(x!==y){return false}", localVars: [], thisVars: []
                },
                post: {args: [], localVars: [], thisVars: [], body: "return true"},
                funcName: "equals"
            });
        }, {"cwise-compiler": 1}],
        13: [function (require, module, exports) {
            "use strict";
            var ndarray = require("ndarray"), do_convert = require("./doConvert.js");
            module.exports = function (r, e) {
                for (var n = [], a = r, t = 1; a instanceof Array;) n.push(a.length), t *= a.length, a = a[0];
                return 0 === n.length ? ndarray() : (e || (e = ndarray(new Float64Array(t), n)), do_convert(e, r), e)
            };
        }, {"./doConvert.js": 14, "ndarray": 16}],
        14: [function (require, module, exports) {
            module.exports = require("cwise-compiler")({
                args: ["array", "scalar", "index"],
                pre: {body: "{}", args: [], thisVars: [], localVars: []},
                body: {
                    body: "{\nvar _inline_1_v=_inline_1_arg1_,_inline_1_i\nfor(_inline_1_i=0;_inline_1_i<_inline_1_arg2_.length-1;++_inline_1_i) {\n_inline_1_v=_inline_1_v[_inline_1_arg2_[_inline_1_i]]\n}\n_inline_1_arg0_=_inline_1_v[_inline_1_arg2_[_inline_1_arg2_.length-1]]\n}",
                    args: [{name: "_inline_1_arg0_", lvalue: !0, rvalue: !1, count: 1}, {
                        name: "_inline_1_arg1_",
                        lvalue: !1,
                        rvalue: !0,
                        count: 1
                    }, {name: "_inline_1_arg2_", lvalue: !1, rvalue: !0, count: 4}],
                    thisVars: [],
                    localVars: ["_inline_1_i", "_inline_1_v"]
                },
                post: {body: "{}", args: [], thisVars: [], localVars: []},
                funcName: "convert",
                blockSize: 64
            });
        }, {"cwise-compiler": 1}],
        15: [function (require, module, exports) {
            "use strict";
            var dup = require("dup"), do_unpack = require("cwise/lib/wrapper")({
                args: ["array", "scalar", "index"],
                pre: {body: "{}", args: [], thisVars: [], localVars: []},
                body: {
                    body: "{var _inline_1_a,_inline_1_e=_inline_1_arg1_;for(_inline_1_a=0;_inline_1_a<_inline_1_arg2_.length-1;++_inline_1_a)_inline_1_e=_inline_1_e[_inline_1_arg2_[_inline_1_a]];_inline_1_e[_inline_1_arg2_[_inline_1_arg2_.length-1]]=_inline_1_arg0_}",
                    args: [{name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 1}, {
                        name: "_inline_1_arg1_",
                        lvalue: !1,
                        rvalue: !0,
                        count: 1
                    }, {name: "_inline_1_arg2_", lvalue: !1, rvalue: !0, count: 4}],
                    thisVars: [],
                    localVars: ["_inline_1_a", "_inline_1_e"]
                },
                post: {body: "{}", args: [], thisVars: [], localVars: []},
                debug: !1,
                funcName: "unpackCwise",
                blockSize: 64
            });
            module.exports = function (_) {
                var n = dup(_.shape);
                return do_unpack(_, n), n
            };
        }, {"cwise/lib/wrapper": 6, "dup": 7}],
        16: [function (require, module, exports) {
            function compare1st(t, r) {
                return t[0] - r[0]
            }

            function order() {
                var t, r = this.stride, e = new Array(r.length);
                for (t = 0; t < e.length; ++t) e[t] = [Math.abs(r[t]), t];
                e.sort(compare1st);
                var n = new Array(e.length);
                for (t = 0; t < n.length; ++t) n[t] = e[t][1];
                return n
            }

            function compileConstructor(t, r) {
                var e = ["View", r, "d", t].join("");
                0 > r && (e = "View_Nil" + t);
                var n = "generic" === t;
                if (-1 === r) {
                    var o = "function " + e + "(a){this.data=a;};var proto=" + e + ".prototype;proto.dtype='" + t + "';proto.index=function(){return -1};proto.size=0;proto.dimension=-1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function(){return new " + e + "(this.data);};proto.get=proto.set=function(){};proto.pick=function(){return null};return function construct_" + e + "(a){return new " + e + "(a);}",
                        i = new Function(o);
                    return i()
                }
                if (0 === r) {
                    var o = "function " + e + "(a,d) {this.data = a;this.offset = d};var proto=" + e + ".prototype;proto.dtype='" + t + "';proto.index=function(){return this.offset};proto.dimension=0;proto.size=1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function " + e + "_copy() {return new " + e + "(this.data,this.offset)};proto.pick=function " + e + "_pick(){return TrivialArray(this.data);};proto.valueOf=proto.get=function " + e + "_get(){return " + (n ? "this.data.get(this.offset)" : "this.data[this.offset]") + "};proto.set=function " + e + "_set(v){return " + (n ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v") + "};return function construct_" + e + "(a,b,c,d){return new " + e + "(a,d)}",
                        i = new Function("TrivialArray", o);
                    return i(CACHED_CONSTRUCTORS[t][0])
                }
                var o = ["'use strict'"], a = iota(r), s = a.map(function (t) {
                    return "i" + t
                }), u = "this.offset+" + a.map(function (t) {
                    return "this.stride[" + t + "]*i" + t
                }).join("+"), p = a.map(function (t) {
                    return "b" + t
                }).join(","), f = a.map(function (t) {
                    return "c" + t
                }).join(",");
                o.push("function " + e + "(a," + p + "," + f + ",d){this.data=a", "this.shape=[" + p + "]", "this.stride=[" + f + "]", "this.offset=d|0}", "var proto=" + e + ".prototype", "proto.dtype='" + t + "'", "proto.dimension=" + r), o.push("Object.defineProperty(proto,'size',{get:function " + e + "_size(){return " + a.map(function (t) {
                    return "this.shape[" + t + "]"
                }).join("*"), "}})"), 1 === r ? o.push("proto.order=[0]") : (o.push("Object.defineProperty(proto,'order',{get:"), 4 > r ? (o.push("function " + e + "_order(){"), 2 === r ? o.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})") : 3 === r && o.push("var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);if(s0>s1){if(s1>s2){return [2,1,0];}else if(s0>s2){return [1,2,0];}else{return [1,0,2];}}else if(s0>s2){return [2,0,1];}else if(s2>s1){return [0,1,2];}else{return [0,2,1];}}})")) : o.push("ORDER})")), o.push("proto.set=function " + e + "_set(" + s.join(",") + ",v){"), n ? o.push("return this.data.set(" + u + ",v)}") : o.push("return this.data[" + u + "]=v}"), o.push("proto.get=function " + e + "_get(" + s.join(",") + "){"), n ? o.push("return this.data.get(" + u + ")}") : o.push("return this.data[" + u + "]}"), o.push("proto.index=function " + e + "_index(", s.join(), "){return " + u + "}"), o.push("proto.hi=function " + e + "_hi(" + s.join(",") + "){return new " + e + "(this.data," + a.map(function (t) {
                    return ["(typeof i", t, "!=='number'||i", t, "<0)?this.shape[", t, "]:i", t, "|0"].join("")
                }).join(",") + "," + a.map(function (t) {
                    return "this.stride[" + t + "]"
                }).join(",") + ",this.offset)}");
                var h = a.map(function (t) {
                    return "a" + t + "=this.shape[" + t + "]"
                }), c = a.map(function (t) {
                    return "c" + t + "=this.stride[" + t + "]"
                });
                o.push("proto.lo=function " + e + "_lo(" + s.join(",") + "){var b=this.offset,d=0," + h.join(",") + "," + c.join(","));
                for (var d = 0; r > d; ++d) o.push("if(typeof i" + d + "==='number'&&i" + d + ">=0){d=i" + d + "|0;b+=c" + d + "*d;a" + d + "-=d}");
                o.push("return new " + e + "(this.data," + a.map(function (t) {
                    return "a" + t
                }).join(",") + "," + a.map(function (t) {
                    return "c" + t
                }).join(",") + ",b)}"), o.push("proto.step=function " + e + "_step(" + s.join(",") + "){var " + a.map(function (t) {
                    return "a" + t + "=this.shape[" + t + "]"
                }).join(",") + "," + a.map(function (t) {
                    return "b" + t + "=this.stride[" + t + "]"
                }).join(",") + ",c=this.offset,d=0,ceil=Math.ceil");
                for (var d = 0; r > d; ++d) o.push("if(typeof i" + d + "==='number'){d=i" + d + "|0;if(d<0){c+=b" + d + "*(a" + d + "-1);a" + d + "=ceil(-a" + d + "/d)}else{a" + d + "=ceil(a" + d + "/d)}b" + d + "*=d}");
                o.push("return new " + e + "(this.data," + a.map(function (t) {
                    return "a" + t
                }).join(",") + "," + a.map(function (t) {
                    return "b" + t
                }).join(",") + ",c)}");
                for (var y = new Array(r), l = new Array(r), d = 0; r > d; ++d) y[d] = "a[i" + d + "]", l[d] = "b[i" + d + "]";
                o.push("proto.transpose=function " + e + "_transpose(" + s + "){" + s.map(function (t, r) {
                    return t + "=(" + t + "===undefined?" + r + ":" + t + "|0)"
                }).join(";"), "var a=this.shape,b=this.stride;return new " + e + "(this.data," + y.join(",") + "," + l.join(",") + ",this.offset)}"), o.push("proto.pick=function " + e + "_pick(" + s + "){var a=[],b=[],c=this.offset");
                for (var d = 0; r > d; ++d) o.push("if(typeof i" + d + "==='number'&&i" + d + ">=0){c=(c+this.stride[" + d + "]*i" + d + ")|0}else{a.push(this.shape[" + d + "]);b.push(this.stride[" + d + "])}");
                o.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"), o.push("return function construct_" + e + "(data,shape,stride,offset){return new " + e + "(data," + a.map(function (t) {
                    return "shape[" + t + "]"
                }).join(",") + "," + a.map(function (t) {
                    return "stride[" + t + "]"
                }).join(",") + ",offset)}");
                var i = new Function("CTOR_LIST", "ORDER", o.join("\n"));
                return i(CACHED_CONSTRUCTORS[t], order)
            }

            function arrayDType(t) {
                if (isBuffer(t)) return "buffer";
                if (hasTypedArrays) switch (Object.prototype.toString.call(t)) {
                    case"[object Float64Array]":
                        return "float64";
                    case"[object Float32Array]":
                        return "float32";
                    case"[object Int8Array]":
                        return "int8";
                    case"[object Int16Array]":
                        return "int16";
                    case"[object Int32Array]":
                        return "int32";
                    case"[object Uint8Array]":
                        return "uint8";
                    case"[object Uint16Array]":
                        return "uint16";
                    case"[object Uint32Array]":
                        return "uint32";
                    case"[object Uint8ClampedArray]":
                        return "uint8_clamped"
                }
                return Array.isArray(t) ? "array" : "generic"
            }

            function wrappedNDArrayCtor(t, r, e, n) {
                if (void 0 === t) {
                    var o = CACHED_CONSTRUCTORS.array[0];
                    return o([])
                }
                "number" == typeof t && (t = [t]), void 0 === r && (r = [t.length]);
                var i = r.length;
                if (void 0 === e) {
                    e = new Array(i);
                    for (var a = i - 1, s = 1; a >= 0; --a) e[a] = s, s *= r[a]
                }
                if (void 0 === n) {
                    n = 0;
                    for (var a = 0; i > a; ++a) e[a] < 0 && (n -= (r[a] - 1) * e[a])
                }
                for (var u = arrayDType(t), p = CACHED_CONSTRUCTORS[u]; p.length <= i + 1;) p.push(compileConstructor(u, p.length - 1));
                var o = p[i + 1];
                return o(t, r, e, n)
            }

            var iota = require("iota-array"), isBuffer = require("is-buffer"),
                hasTypedArrays = "undefined" != typeof Float64Array, CACHED_CONSTRUCTORS = {
                    float32: [],
                    float64: [],
                    int8: [],
                    int16: [],
                    int32: [],
                    uint8: [],
                    uint16: [],
                    uint32: [],
                    array: [],
                    uint8_clamped: [],
                    buffer: [],
                    generic: []
                };
            module.exports = wrappedNDArrayCtor;
        }, {"iota-array": 10, "is-buffer": 11}],
        17: [function (require, module, exports) {
            "use strict";

            function unique_pred(n, e) {
                for (var u = 1, t = n.length, i = n[0], r = n[0], o = 1; t > o; ++o) if (r = i, i = n[o], e(i, r)) {
                    if (o === u) {
                        u++;
                        continue
                    }
                    n[u++] = i
                }
                return n.length = u, n
            }

            function unique_eq(n) {
                for (var e = 1, u = n.length, t = n[0], i = n[0], r = 1; u > r; ++r, i = t) if (i = t, t = n[r], t !== i) {
                    if (r === e) {
                        e++;
                        continue
                    }
                    n[e++] = t
                }
                return n.length = e, n
            }

            function unique(n, e, u) {
                return 0 === n.length ? n : e ? (u || n.sort(e), unique_pred(n, e)) : (u || n.sort(), unique_eq(n))
            }

            module.exports = unique;
        }, {}],
        18: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(e) {
                return e && e.__esModule ? e : {"default": e}
            }

            function _toConsumableArray(e) {
                if (Array.isArray(e)) {
                    for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
                    return r
                }
                return Array.from(e)
            }

            function _classCallCheck(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(e, t) {
                if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !t || "object" != typeof t && "function" != typeof t ? e : t
            }

            function _inherits(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }

            Object.defineProperty(exports, "__esModule", {value: !0});
            var _slicedToArray = function () {
                    function e(e, t) {
                        var r = [], a = !0, i = !1, n = void 0;
                        try {
                            for (var u, s = e[Symbol.iterator](); !(a = (u = s.next()).done) && (r.push(u.value), !t || r.length !== t); a = !0) ;
                        } catch (o) {
                            i = !0, n = o
                        } finally {
                            try {
                                !a && s["return"] && s["return"]()
                            } finally {
                                if (i) throw n
                            }
                        }
                        return r
                    }

                    return function (t, r) {
                        if (Array.isArray(t)) return t;
                        if (Symbol.iterator in Object(t)) return e(t, r);
                        throw new TypeError("Invalid attempt to destructure non-iterable instance")
                    }
                }(), _createClass = function () {
                    function e(e, t) {
                        for (var r = 0; r < t.length; r++) {
                            var a = t[r];
                            a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), Object.defineProperty(e, a.key, a)
                        }
                    }

                    return function (t, r, a) {
                        return r && e(t.prototype, r), a && e(t, a), t
                    }
                }(), _events = require("events"), _ndarray = require("ndarray"),
                _ndarray2 = _interopRequireDefault(_ndarray), _ndarrayOps = require("ndarray-ops"),
                _ndarrayOps2 = _interopRequireDefault(_ndarrayOps), _ndarrayPack = require("ndarray-pack"),
                _ndarrayPack2 = _interopRequireDefault(_ndarrayPack), _ndarrayUnpack = require("ndarray-unpack"),
                _ndarrayUnpack2 = _interopRequireDefault(_ndarrayUnpack), _cwise = require("cwise"),
                _cwise2 = _interopRequireDefault(_cwise), _randn = require("./randn"),
                _randn2 = _interopRequireDefault(_randn), _pairwiseDistances = require("./pairwise-distances"),
                _pairwiseDistances2 = _interopRequireDefault(_pairwiseDistances),
                _jointProbabilities = require("./joint-probabilities"),
                _jointProbabilities2 = _interopRequireDefault(_jointProbabilities),
                _klDivergence = require("./kl-divergence"), _klDivergence2 = _interopRequireDefault(_klDivergence),
                TSNE = function (e) {
                    function t(e) {
                        _classCallCheck(this, t);
                        var r = _possibleConstructorReturn(this, Object.getPrototypeOf(t).call(this));
                        return e = e || {}, r.dim = e.dim || 2, r.perplexity = e.perplexity || 30, r.earlyExaggeration = e.earlyExaggeration || 4, r.learningRate = e.learningRate || 1e3, r.nIter = e.nIter || 1e3, r.metric = e.metric || "euclidean", r.barneshut = e.barneshut || !1, r.inputData = null, r.outputEmbedding = null, r
                    }

                    return _inherits(t, e), _createClass(t, [{
                        key: "init", value: function (e) {
                            e = e || {};
                            var t = e.data || [], r = e.type || "dense";
                            if ("dense" === r) this.inputData = (0, _ndarrayPack2["default"])(t); else {
                                if ("sparse" !== r) throw new Error("input data type must be dense or sparse");
                                for (var a = [], i = 1, n = function (e) {
                                    var r = Math.max.apply(null, t.map(function (t) {
                                        return t[e]
                                    })) + 1;
                                    a.push(r), i *= r
                                }, u = 0; u < t[0].length; u++) n(u);
                                this.inputData = (0, _ndarray2["default"])(new Float64Array(i), a);
                                var s = !0, o = !1, l = void 0;
                                try {
                                    for (var d, p = t[Symbol.iterator](); !(s = (d = p.next()).done); s = !0) {
                                        var c, f = d.value;
                                        (c = this.inputData).set.apply(c, _toConsumableArray(f).concat([1]))
                                    }
                                } catch (y) {
                                    o = !0, l = y
                                } finally {
                                    try {
                                        !s && p["return"] && p["return"]()
                                    } finally {
                                        if (o) throw l
                                    }
                                }
                            }
                            this.outputEmbedding = (0, _randn2["default"])(this.inputData.shape[0], this.dim)
                        }
                    }, {
                        key: "run", value: function () {
                            this.emit("progressStatus", "Calculating pairwise distances"), this.distances = (0, _pairwiseDistances2["default"])(this.inputData, this.metric), this.emit("progressStatus", "Calculating joint probabilities"), this.alpha = Math.max(this.dim - 1, 1), this.P = (0, _jointProbabilities2["default"])(this.distances, this.perplexity);
                            var e = Number.MAX_VALUE, t = 0;
                            this.emit("progressStatus", "Early exaggeration with momentum 0.5"), _ndarrayOps2["default"].mulseq(this.P, this.earlyExaggeration);
                            var r = this._gradDesc(t, 50, .5, 0, 0), a = _slicedToArray(r, 2);
                            e = a[0], t = a[1], this.emit("progressStatus", "Early exaggeration with momentum 0.8");
                            var i = this._gradDesc(t + 1, 100, .8, 0, 0), n = _slicedToArray(i, 2);
                            e = n[0], t = n[1], this.emit("progressStatus", "Final optimization with momentum 0.8"), _ndarrayOps2["default"].divseq(this.P, this.earlyExaggeration);
                            var u = this._gradDesc(t + 1, this.nIter, .8, 1e-6, 1e-6), s = _slicedToArray(u, 2);
                            return e = s[0], t = s[1], this.emit("progressStatus", "Optimization end"), [e, t]
                        }
                    }, {
                        key: "rerun", value: function () {
                            this.outputEmbedding = (0, _randn2["default"])(this.inputData.shape[0], this.dim);
                            var e = this.run(), t = _slicedToArray(e, 2), r = t[0], a = t[1];
                            return [r, a]
                        }
                    }, {
                        key: "getOutput", value: function () {
                            return (0, _ndarrayUnpack2["default"])(this.outputEmbedding)
                        }
                    }, {
                        key: "getOutputScaled", value: function () {
                            for (var e = (0, _ndarray2["default"])(new Float64Array(this.outputEmbedding.size), this.outputEmbedding.shape), t = (0, _ndarray2["default"])(new Float64Array(this.outputEmbedding.shape[0]), [this.outputEmbedding.shape[0]]), r = 0; r < this.outputEmbedding.shape[1]; r++) {
                                var a = _ndarrayOps2["default"].sup(_ndarrayOps2["default"].abs(t, this.outputEmbedding.pick(null, r)));
                                _ndarrayOps2["default"].divs(e.pick(null, r), this.outputEmbedding.pick(null, r), a)
                            }
                            return (0, _ndarrayUnpack2["default"])(e)
                        }
                    }, {
                        key: "_gradDesc", value: function (e, t, r) {
                            for (var a = arguments.length <= 3 || void 0 === arguments[3] ? 1e-6 : arguments[3], i = arguments.length <= 4 || void 0 === arguments[4] ? 1e-6 : arguments[4], n = 30, u = (0, _ndarray2["default"])(new Float64Array(this.outputEmbedding.size), this.outputEmbedding.shape), s = new Float64Array(this.outputEmbedding.size), o = 0; o < s.length; o++) s[o] = 1;
                            var l = (0, _ndarray2["default"])(s, this.outputEmbedding.shape), d = Number.MAX_VALUE,
                                p = Number.MAX_VALUE, c = 0, f = (0, _cwise2["default"])({
                                    args: ["array"], pre: function (e) {
                                        this.sum = 0
                                    }, body: function (e) {
                                        this.sum += e * e
                                    }, post: function (e) {
                                        return Math.sqrt(this.sum)
                                    }
                                }), y = (0, _cwise2["default"])({
                                    args: ["array", "array", "array"],
                                    body: function (e, t, r) {
                                        t * r >= 0 ? e += .05 : e *= .95, e = Math.max(e, .01)
                                    }
                                }), h = void 0;
                            for (h = e; t > h; h++) {
                                var _ = (0, _klDivergence2["default"])(this.outputEmbedding, this.P, this.alpha),
                                    m = _slicedToArray(_, 2), g = m[0], b = m[1], v = Math.abs(g - d);
                                d = g;
                                var w = f(b);
                                if (this.emit("progressIter", [h, d, w]), p > d) p = d, c = h; else if (h - c > n) break;
                                if (a >= w) break;
                                if (i >= v) break;
                                y(l, u, b), _ndarrayOps2["default"].muleq(b, l);
                                var E = (0, _ndarray2["default"])(new Float64Array(b.size), b.shape);
                                _ndarrayOps2["default"].muls(E, b, this.learningRate), _ndarrayOps2["default"].mulseq(u, r), _ndarrayOps2["default"].subeq(u, E), _ndarrayOps2["default"].addeq(this.outputEmbedding, u), this.emit("progressData", this.getOutputScaled())
                            }
                            return [d, h]
                        }
                    }]), t
                }(_events.EventEmitter);
            exports["default"] = TSNE, module.exports = exports["default"];
        }, {
            "./joint-probabilities": 19,
            "./kl-divergence": 20,
            "./pairwise-distances": 21,
            "./randn": 22,
            "cwise": 5,
            "events": 9,
            "ndarray": 16,
            "ndarray-ops": 12,
            "ndarray-pack": 13,
            "ndarray-unpack": 15
        }],
        19: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(r) {
                return r && r.__esModule ? r : {"default": r}
            }

            Object.defineProperty(exports, "__esModule", {value: !0}), exports["default"] = function (r, a) {
                for (var e = 100, t = r.shape[0], d = (0, _ndarray2["default"])(new Float64Array(t * t), [t, t]), o = (0, _ndarray2["default"])(new Float64Array(t * t), [t, t]), u = void 0, n = void 0, s = 1 / 0, _ = 0, f = Math.log(a), i = void 0, l = void 0, p = void 0, y = void 0, E = 0; t > E; E++) {
                    u = 1, n = -(1 / 0), s = 1 / 0;
                    for (var O = 0; e > O; O++) {
                        for (var v = 0; t > v; v++) d.set(E, v, Math.exp(-r.get(E, v) * u));
                        d.set(E, E, 0), p = 0;
                        for (var v = 0; t > v; v++) p += d.get(E, v);
                        0 == p && (p = EPSILON_DBL), y = 0;
                        for (var v = 0; t > v; v++) d.set(E, v, d.get(E, v) / p), y += r.get(E, v) * d.get(E, v);
                        if (l = Math.log(p) + u * y, i = l - f, Math.abs(i) <= PERPLEXITY_TOLERANCE) break;
                        i > 0 ? (n = u, u = s == 1 / 0 ? 2 * u : (u + s) / 2) : (s = u, n == -(1 / 0) ? u /= 2 : u = (u + n) / 2)
                    }
                    _ += u
                }
                _ndarrayOps2["default"].add(o, d, d.transpose(1, 0));
                var L = Math.max(_ndarrayOps2["default"].sum(o), MACHINE_EPSILON);
                return _ndarrayOps2["default"].divseq(o, L), _ndarrayOps2["default"].maxseq(o, MACHINE_EPSILON), o
            };
            var _ndarray = require("ndarray"), _ndarray2 = _interopRequireDefault(_ndarray),
                _ndarrayOps = require("ndarray-ops"), _ndarrayOps2 = _interopRequireDefault(_ndarrayOps),
                EPSILON_DBL = 1e-7, MACHINE_EPSILON = Number.EPSILON || 2.220446049250313e-16,
                PERPLEXITY_TOLERANCE = 1e-5;
            module.exports = exports["default"];
        }, {"ndarray": 16, "ndarray-ops": 12}],
        20: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(a) {
                return a && a.__esModule ? a : {"default": a}
            }

            Object.defineProperty(exports, "__esModule", {value: !0}), exports["default"] = function (a, r, e) {
                var d = a.shape[0], s = a.shape[1], t = (0, _ndarray2["default"])(new Float64Array(d * d), [d, d]),
                    u = (0, _pairwiseDistances2["default"])(a, "euclidean");
                square(u);
                var n = (e + 1) / -2;
                _ndarrayOps2["default"].powseq(_ndarrayOps2["default"].divseq(_ndarrayOps2["default"].addseq(u, 1), e), n);
                for (var l = 0; d > l; l++) u.set(l, l, 0);
                var _ = Math.max(_ndarrayOps2["default"].sum(u), MACHINE_EPSILON);
                _ndarrayOps2["default"].divs(t, u, _), _ndarrayOps2["default"].maxseq(t, MACHINE_EPSILON);
                var i = (0, _ndarray2["default"])(new Float64Array(d * d), [d, d]),
                    p = (0, _ndarray2["default"])(new Float64Array(d * d), [d, d]);
                _ndarrayOps2["default"].div(i, r, t), _ndarrayOps2["default"].logeq(i), _ndarrayOps2["default"].assign(p, r);
                var f = _ndarrayOps2["default"].sum(_ndarrayOps2["default"].muleq(i, p)),
                    y = (0, _ndarray2["default"])(new Float64Array(a.size), a.shape),
                    o = (0, _ndarray2["default"])(new Float64Array(d * d), [d, d]);
                _ndarrayOps2["default"].sub(o, r, t), _ndarrayOps2["default"].muleq(o, u);
                for (var l = 0; d > l; l++) for (var O = 0; s > O; O++) {
                    var q = (0, _ndarray2["default"])(new Float64Array(a.shape[0]), [a.shape[0]]);
                    _ndarrayOps2["default"].assign(q, a.pick(null, O)), _ndarrayOps2["default"].addseq(_ndarrayOps2["default"].negeq(q), a.get(l, O)), _ndarrayOps2["default"].muleq(q, o.pick(l, null)), y.set(l, O, _ndarrayOps2["default"].sum(q))
                }
                var c = 2 * (e + 1) / e;
                return _ndarrayOps2["default"].mulseq(y, c), [f, y]
            };
            var _ndarray = require("ndarray"), _ndarray2 = _interopRequireDefault(_ndarray),
                _ndarrayOps = require("ndarray-ops"), _ndarrayOps2 = _interopRequireDefault(_ndarrayOps),
                _cwise = require("cwise"), _cwise2 = _interopRequireDefault(_cwise),
                _pairwiseDistances = require("./pairwise-distances"),
                _pairwiseDistances2 = _interopRequireDefault(_pairwiseDistances),
                MACHINE_EPSILON = Number.EPSILON || 2.220446049250313e-16, square = (0, _cwise2["default"])({
                    args: ["array"], body: function (a) {
                        a *= a
                    }
                });
            module.exports = exports["default"];
        }, {"./pairwise-distances": 21, "cwise": 5, "ndarray": 16, "ndarray-ops": 12}],
        21: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(t) {
                return t && t.__esModule ? t : {"default": t}
            }

            Object.defineProperty(exports, "__esModule", {value: !0}), exports["default"] = function (t, r) {
                var a = t.shape[0], e = (0, _ndarray2["default"])(new Float64Array(a * a), [a, a]);
                switch (r) {
                    case"euclidean":
                        for (var i = 0; a > i; i++) for (var s = i + 1; a > s; s++) {
                            var n = euclidean(t.pick(i, null), t.pick(s, null));
                            e.set(i, s, n), e.set(s, i, n)
                        }
                        break;
                    case"manhattan":
                        for (var i = 0; a > i; i++) for (var s = i + 1; a > s; s++) {
                            var n = manhattan(t.pick(i, null), t.pick(s, null));
                            e.set(i, s, n), e.set(s, i, n)
                        }
                        break;
                    case"jaccard":
                        for (var i = 0; a > i; i++) for (var s = i + 1; a > s; s++) {
                            var n = jaccard(t.pick(i, null), t.pick(s, null));
                            e.set(i, s, n), e.set(s, i, n)
                        }
                        break;
                    case"dice":
                        for (var i = 0; a > i; i++) for (var s = i + 1; a > s; s++) {
                            var n = dice(t.pick(i, null), t.pick(s, null));
                            e.set(i, s, n), e.set(s, i, n)
                        }
                }
                return e
            };
            var _ndarray = require("ndarray"), _ndarray2 = _interopRequireDefault(_ndarray), _cwise = require("cwise"),
                _cwise2 = _interopRequireDefault(_cwise), euclidean = (0, _cwise2["default"])({
                    args: ["array", "array"], pre: function (t, r) {
                        this.sum = 0
                    }, body: function (t, r) {
                        var a = t - r;
                        this.sum += a * a
                    }, post: function (t, r) {
                        return Math.sqrt(this.sum)
                    }
                }), manhattan = (0, _cwise2["default"])({
                    args: ["array", "array"], pre: function (t, r) {
                        this.sum = 0
                    }, body: function (t, r) {
                        this.sum += Math.abs(t - r)
                    }, post: function (t, r) {
                        return this.sum
                    }
                }), jaccard = (0, _cwise2["default"])({
                    args: ["array", "array"], pre: function (t, r) {
                        this.tf = 0, this.tt = 0
                    }, body: function (t, r) {
                        var a = Math.round(t), e = Math.round(r);
                        this.tf += +(a != e), this.tt += +(1 == a && 1 == e)
                    }, post: function (t, r) {
                        return this.tf + this.tt === 0 ? 1 : this.tf / (this.tf + this.tt)
                    }
                }), dice = (0, _cwise2["default"])({
                    args: ["array", "array"], pre: function (t, r) {
                        this.tf = 0, this.tt = 0
                    }, body: function (t, r) {
                        var a = Math.round(t), e = Math.round(r);
                        this.tf += +(a != e), this.tt += +(1 == a && 1 == e)
                    }, post: function (t, r) {
                        return this.tf + this.tt === 0 ? 1 : this.tf / (this.tf + 2 * this.tt)
                    }
                });
            module.exports = exports["default"];
        }, {"cwise": 5, "ndarray": 16}],
        22: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(r) {
                return r && r.__esModule ? r : {"default": r}
            }

            function gaussRandom() {
                var r = 2 * Math.random() - 1, e = 2 * Math.random() - 1, a = r * r + e * e;
                return 0 == a || a > 1 ? gaussRandom() : r * Math.sqrt(-2 * Math.log(a) / a)
            }

            Object.defineProperty(exports, "__esModule", {value: !0}), exports["default"] = function (r, e) {
                for (var a = new Float64Array(r * e), t = 0; t < a.length; t++) a[t] = 1e-4 * gaussRandom();
                return (0, _ndarray2["default"])(a, [r, e])
            };
            var _ndarray = require("ndarray"), _ndarray2 = _interopRequireDefault(_ndarray);
            module.exports = exports["default"];
        }, {"ndarray": 16}]
    }, {}, [18])(18)
});