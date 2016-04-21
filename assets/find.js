var search = {
    sKeyToKeys: function(sKey){   //把字符串以，,分割成数组
        var reg = new RegExp('[,，；;]');
        return sKey.split(reg);
    },
    
    makeTree: function(strKeys){      
        var hash = {};
        var hBranch = hash;
        var keyChar;

        for(var j = 0; j< strKeys.length; j++){
            for(var i = 0; i < strKeys[j].length; i++){
                keyChar = strKeys[j].charAt(i);
                hBranch = hBranch.hasOwnProperty(keyChar)
                    ? hBranch[keyChar]
                    : hBranch[keyChar] = {};
            }
            hBranch.end = true;
            hBranch = hash;
        }
        return hash;   
    },

    search: function(context, hash){
        var hAttr;
        var pStart = 0;
        var pEnd;
        var match;
        var mLetter;
        var mWord;
        var arrMatch = [];
        var arrLength = 0;
        var wordLog = {};
        while(pStart < context.length){
            // 回溯至根部
            hAttr = hash;
            pEnd = pStart;
            mWord = '';
            match = false;

            do{
                mLetter = context.charAt(pEnd);
                // hash属性查询并往叶子靠拢
                if(!(hAttr = hAttr[mLetter])){
                    pStart++;
                    break;
                }
                else{
                    mWord += mLetter;
                }
                pEnd++;
                // 匹配success
                if(hAttr.end === true){
                    match = true;
                }
            }while(true);

            if(match){
                arrMatch[arrLength] = {
                    key: mWord,
                    begin: pStart - 1,
                    end: pEnd
                };
                // 关键词的个数
                if(wordLog[mWord]){
                    wordLog[mWord].num++;
                }
                else{
                    wordLog[mWord] = {
                        num: 1
                    };
                }
                arrLength += 1;
                pStart = pEnd;
            }
        }
        return{
            resMap: arrMatch,
            resLog: wordLog
        };
    },

    getRes: function(context, sKey){
        var me = this;
        var hash = me.makeTree(me.sKeyToKeys(sKey));
        var result = me.search(context, hash);
        return result;
    }
};

function FindText(op){
    op = op || {};
    this.oText = document.querySelector(op.area || '#text');
    this.oKeyword = document.querySelector(op.keyword || '#keyword');
    this.check = document.querySelector(op.check || '#btn');
    this.cancel = document.querySelector(op.cancel || '#btn2');
    this.oResult = document.querySelector(op.result || '#result');
    this.oTbody = this.oResult.querySelector('tbody');
    this.temp = '';
    this.init();
}
FindText.prototype = {
    init: function(){
        var me = this;
        me.bindEvent();
    },

    bindEvent: function(){
        var me = this;

        //hash
        me.check.onclick = function(e){
            var input = me.oKeyword.value;
            me.cancel.onclick();
            if (!input) {
                alert('请输入关键字!');
                me.oKeyword.focus();
                return;
            }
            me.preContext = me.oText.innerHTML;
            var result = search.getRes(me.preContext, input);
            var resMap = result.resMap;
            var resLog = result.resLog;
            // var time1 = +new Date();
            me.makeFlag(resMap);
            // console.log('hash查找: ' + (+new Date() - time1) + 'ms');
            for(var key in resLog){
                if(resLog.hasOwnProperty(key)){
                    me.sendLog(key, resLog[key].num);
                }
            }
        };

        //正则
        document.querySelector('#test').onclick = function(){
            var input = me.oKeyword.value;
            me.cancel.onclick();
            if (!input) {
                alert('请输入关键字!');
                me.oKeyword.focus();
                return;
            }
            // var time2 = +new Date();
            me.find(input);
            // console.log('正则查找: ' + (+new Date() - time2) + 'ms');
        };

        me.cancel.onclick = function(){
            if(!me.preContext){
                return;
            }
            me.clearLog();
            me.oText.innerHTML = me.preContext;
        };
    },

    //正则
    find: function(input){
        var me = this;
        // console.time('RegExp time');
        var keywords = input.match(/[^,，;]+/g);
        var patt = keywords.join('|');
        var str = me.oText.innerHTML;
        me.preContext = me.oText.innerHTML;
        var keywordRe = new RegExp('(' + patt + ')', 'g');
        me.temp = str.replace(keywordRe, '<b class="stress">$1</b>');
        // console.timeEnd('RegExp time');
        me.oText.innerHTML = me.temp;
    },

    //hash
    makeFlag: function(resMap){
        var me = this;
        // console.time('hash time');
        var newCon = [];
        var p = 0;
        for(var i = 0; i < resMap.length; i++){
            newCon.push(
                me.preContext.substring(p, resMap[i].begin),
                '<b class="stress">',
                me.preContext.substring(resMap[i].begin, p = resMap[i].end),
                '</b>'
            );
        }
        newCon.push(me.preContext.substring(p));
        // console.timeEnd('hash time');
        me.oText.innerHTML = newCon.join('');
    },

    sendLog: function(key, num){
        if(!this.oTbody){
            return;
        }
        var sTr = ''
                + '<tr>'
                + '<td>' + key + '</td>'
                + '<td>' + num + '</td>'
                + '</tr>';
        this.oTbody.innerHTML += sTr;
    },

    clearLog: function(){
        if(!this.oTbody){
            return;
        }
        this.oTbody.innerHTML = '';
    }
};
