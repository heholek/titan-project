ace.define("ace/mode/logstash_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text_highlight_rules").TextHighlightRules,
        s = t.constantOtherSymbol = {
            token: "constant.other.symbol.logstash",
            regex: "[:](?:[A-Za-z_]|[@$](?=[a-zA-Z0-9_]))[a-zA-Z0-9_]*[!=?]?"
        },
        o = t.qString = {
            token: "string",
            regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
        },
        u = t.qqString = {
            token: "string",
            regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
        },
        a = t.tString = {
            token: "string",
            regex: "[`](?:(?:\\\\.)|(?:[^'\\\\]))*?[`]"
        },
        f = t.constantNumericHex = {
            token: "constant.numeric",
            regex: "0[xX][0-9a-fA-F](?:[0-9a-fA-F]|_(?=[0-9a-fA-F]))*\\b"
        },
        l = t.constantNumericFloat = {
            token: "constant.numeric",
            regex: "[+-]?\\d(?:\\d|_(?=\\d))*(?:(?:\\.\\d(?:\\d|_(?=\\d))*)?(?:[eE][+-]?\\d+)?)?\\b"
        },
        c = t.instanceVariable = {
            token: "variable.instance",
            regex: "@{1,2}[a-zA-Z_\\d]+|\[[a-zA-Z_.]+\]"
        },
        h = function() {
            var e = "",
                t = "and|else|elsif|if|in|not|or",
                n = "True|False|true|false",
                r = "",
                i = this.$keywords = this.createKeywordMapper({
                    keyword: t,
                    "constant.language": n,
                    "variable.language": r,
                    "support.function": e,
                    "invalid.deprecated": "debugger"
                }, "identifier");
            this.$rules = {
                start: [{
                        token: "comment",
                        regex: "#.*$"
                    }, {
                        token: "comment",
                        regex: "^=begin(?:$|\\s.*$)",
                        next: "comment"
                    }, {
                        token: "string.regexp",
                        regex: "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"
                    },
                    [{
                        regex: "[{}]",
                        onMatch: function(e, t, n) {
                            this.next = e == "{" ? this.nextState : "";
                            if (e == "{" && n.length) return n.unshift("start", t), "paren.lparen";
                            if (e == "}" && n.length) {
                                n.shift(), this.next = n.shift();
                                if (this.next.indexOf("string") != -1) return "paren.end"
                            }
                            return e == "{" ? "paren.lparen" : "paren.rparen"
                        },
                        nextState: "start"
                    }, {
                        token: "string.start",
                        regex: /"/,
                        push: [{
                            token: "constant.language.escape",
                            regex: /\\(?:[nsrtvfbae'"\\]|c.|C-.|M-.(?:\\C-.)?|[0-7]{3}|x[\da-fA-F]{2}|u[\da-fA-F]{4})/
                        },{
                            token: "support.class",
                            regex: "%{([a-zA-Z]+)(?:\:)[@a-zA-Z_]+}"
                        },{
                            token: "support.class",
                            regex: "%{([@a-zA-Z]+)}"
                        },{
                            token: "variable.instance",
                            regex: "@[a-zA-Z]+"
                        },{
                            token: "constant.language.boolean",
                            regex: "integer|integer_eu|float|float_eu|string|boolean",
                        },{
                            token: "string.end",
                            regex: /"/,
                            next: "pop"
                        }, {
                            defaultToken: "string"
                        }]
                    }, {
                        token: "string.start",
                        regex: /`/,
                        push: [{
                            token: "constant.language.escape",
                            regex: /\\(?:[nsrtvfbae'"\\]|c.|C-.|M-.(?:\\C-.)?|[0-7]{3}|x[\da-fA-F]{2}|u[\da-fA-F]{4})/
                        },{
                            token: "support.class",
                            regex: "%{([a-zA-Z]+)(?:\:)[@a-zA-Z_]+}"
                        },{
                            token: "support.class",
                            regex: "%{([@a-zA-Z]+)}"
                        },{
                            token: "variable.instance",
                            regex: "@[a-zA-Z]+"
                        },{
                            token: "constant.language.boolean",
                            regex: "integer|integer_eu|float|float_eu|string|boolean",
                        },{
                            token: "string.end",
                            regex: /'/,
                            next: "pop"
                        }, {
                            defaultToken: "string"
                        }]
                    }, {
                        token: "string.start",
                        regex: /'/,
                        push: [{
                            token: "constant.language.escape",
                            regex: /\\['\\]/
                        }, {
                            token: "string.end",
                            regex: /'/,
                            next: "pop"
                        }, {
                            defaultToken: "string"
                        }]
                    }], {
                        token: "text",
                        regex: "::"
                    }, {
                        token: "variable.instance",
                        regex: "@{1,2}[a-zA-Z_\\d]+|\[[a-zA-Z_.]+\]"
                    }, {
                        token: "support.class",
                        regex: "[A-Z][a-zA-Z_\\d]+"
                    },
                    s, f, l, {
                        token: "constant.language.boolean",
                        regex: "(?:true|false)\\b"
                    }, {
                        token: i,
                        regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                    }, {
                        stateName: "heredoc",
                        onMatch: function(e, t, n) {
                            var r = e[2] == "-" ? "indentedHeredoc" : "heredoc",
                                i = e.split(this.splitRegex);
                            return n.push(r, i[3]), [{
                                type: "constant",
                                value: i[1]
                            }, {
                                type: "string",
                                value: i[2]
                            }, {
                                type: "support.class",
                                value: i[3]
                            }, {
                                type: "string",
                                value: i[4]
                            }]
                        },
                        regex: "(<<-?)(['\"`]?)([\\w]+)(['\"`]?)",
                        rules: {
                            heredoc: [{
                                onMatch: function(e, t, n) {
                                    return e === n[1] ? (n.shift(), n.shift(), this.next = n[0] || "start", "support.class") : (this.next = "", "string")
                                },
                                regex: ".*$",
                                next: "start"
                            }],
                            indentedHeredoc: [{
                                token: "string",
                                regex: "^ +"
                            }, {
                                onMatch: function(e, t, n) {
                                    return e === n[1] ? (n.shift(), n.shift(), this.next = n[0] || "start", "support.class") : (this.next = "", "string")
                                },
                                regex: ".*$",
                                next: "start"
                            }]
                        }
                    }, {
                        regex: "$",
                        token: "empty",
                        next: function(e, t) {
                            return t[0] === "heredoc" || t[0] === "indentedHeredoc" ? t[0] : e
                        }
                    }, {
                        token: "string.character",
                        regex: "\\B\\?."
                    }, {
                        token: "keyword.operator",
                        regex: "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|=>|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
                    }, {
                        token: "paren.lparen",
                        regex: "[[({]"
                    }, {
                        token: "paren.rparen",
                        regex: "[\\])}]"
                    }, {
                        token: "text",
                        regex: "\\s+"
                    }
                ],
                comment: [{
                    token: "comment",
                    regex: "^=end(?:$|\\s.*$)",
                    next: "start"
                }, {
                    token: "comment",
                    regex: ".+"
                }]
            }, this.normalizeRules()
        };
    r.inherits(h, i), t.LogstashHighlightRules = h
}), ace.define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], function(e, t, n) {
    "use strict";
    var r = e("../range").Range,
        i = function() {};
    (function() {
        this.checkOutdent = function(e, t) {
            return /^\s+$/.test(e) ? /^\s*\}/.test(t) : !1
        }, this.autoOutdent = function(e, t) {
            var n = e.getLine(t),
                i = n.match(/^(\s*\})/);
            if (!i) return 0;
            var s = i[1].length,
                o = e.findMatchingBracket({
                    row: t,
                    column: s
                });
            if (!o || o.row == t) return 0;
            var u = this.$getIndent(e.getLine(o.row));
            e.replace(new r(t, 0, t, s - 1), u)
        }, this.$getIndent = function(e) {
            return e.match(/^\s*/)[0]
        }
    }).call(i.prototype), t.MatchingBraceOutdent = i
}), ace.define("ace/mode/folding/coffee", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range"], function(e, t, n) {
    "use strict";
    var r = e("../../lib/oop"),
        i = e("./fold_mode").FoldMode,
        s = e("../../range").Range,
        o = t.FoldMode = function() {};
    r.inherits(o, i),
        function() {
            this.getFoldWidgetRange = function(e, t, n) {
                var r = this.indentationBlock(e, n);
                if (r) return r;
                var i = /\S/,
                    o = e.getLine(n),
                    u = o.search(i);
                if (u == -1 || o[u] != "#") return;
                var a = o.length,
                    f = e.getLength(),
                    l = n,
                    c = n;
                while (++n < f) {
                    o = e.getLine(n);
                    var h = o.search(i);
                    if (h == -1) continue;
                    if (o[h] != "#") break;
                    c = n
                }
                if (c > l) {
                    var p = e.getLine(c).length;
                    return new s(l, a, c, p)
                }
            }, this.getFoldWidget = function(e, t, n) {
                var r = e.getLine(n),
                    i = r.search(/\S/),
                    s = e.getLine(n + 1),
                    o = e.getLine(n - 1),
                    u = o.search(/\S/),
                    a = s.search(/\S/);
                if (i == -1) return e.foldWidgets[n - 1] = u != -1 && u < a ? "start" : "", "";
                if (u == -1) {
                    if (i == a && r[i] == "#" && s[i] == "#") return e.foldWidgets[n - 1] = "", e.foldWidgets[n + 1] = "", "start"
                } else if (u == i && r[i] == "#" && o[i] == "#" && e.getLine(n - 2).search(/\S/) == -1) return e.foldWidgets[n - 1] = "start", e.foldWidgets[n + 1] = "", "";
                return u != -1 && u < i ? e.foldWidgets[n - 1] = "start" : e.foldWidgets[n - 1] = "", i < a ? "start" : ""
            }
        }.call(o.prototype)
}), ace.define("ace/mode/logstash", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/logstash_highlight_rules", "ace/mode/matching_brace_outdent", "ace/range", "ace/mode/behaviour/cstyle", "ace/mode/folding/coffee"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text").Mode,
        s = e("./logstash_highlight_rules").LogstashHighlightRules,
        o = e("./matching_brace_outdent").MatchingBraceOutdent,
        u = e("../range").Range,
        a = e("./behaviour/cstyle").CstyleBehaviour,
        f = e("./folding/coffee").FoldMode,
        l = function() {
            this.HighlightRules = s, this.$outdent = new o, this.$behaviour = new a, this.foldingRules = new f
        };
    r.inherits(l, i),
        function() {
            this.lineCommentStart = "#", this.getNextLineIndent = function(e, t, n) {
                var r = this.$getIndent(t),
                    i = this.getTokenizer().getLineTokens(t, e),
                    s = i.tokens;
                if (s.length && s[s.length - 1].type == "comment") return r;
                if (e == "start") {
                    var o = t.match(/^.*[\{\(\[]\s*$/),
                        u = t.match(/^\s*(class|def|module)\s.*$/),
                        a = t.match(/.*do(\s*|\s+\|.*\|\s*)$/),
                        f = t.match(/^\s*(if|else|when)\s*/);
                    if (o || u || a || f) r += n
                }
                return r
            }, this.checkOutdent = function(e, t, n) {
                return /^\s+(end|else)$/.test(t + n) || this.$outdent.checkOutdent(t, n)
            }, this.autoOutdent = function(e, t, n) {
                var r = t.getLine(n);
                if (/}/.test(r)) return this.$outdent.autoOutdent(t, n);
                var i = this.$getIndent(r),
                    s = t.getLine(n - 1),
                    o = this.$getIndent(s),
                    a = t.getTabString();
                o.length <= i.length && i.slice(-a.length) == a && t.remove(new u(n, i.length - a.length, n, i.length))
            }, this.$id = "ace/mode/logstash"
        }.call(l.prototype), t.Mode = l
});
(function() {                    ace.require(["ace/mode/logstash"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            