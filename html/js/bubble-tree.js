var bubbleTree = (function () {  //placeholder; nuke it


    var that = {};
    var topListID = 'bubbleTree';
    var topList = document.getElementById(topListID);
    topList.style.transformOrigin = "top left";
    
    var histObj = {};
    histObj.transform = "matrix(1, 0, 0, 1, 0, 0)"; //initial state

    // top();
    
    window.addEventListener('popstate', function(event) { //go back in history
        var recalledTransform = JSON.parse(event.state).transform;
        console.log('recalled', recalledTransform);
        topList.style.transform = recalledTransform;
        
    });

    function getTotalOffset(node, totalNodeOffset = {'totalOffsetTop' : 0, 'totalOffsetLeft' : 0 }) { //recursively calc total offset of click target from top-level ancestor
        totalNodeOffset.totalOffsetTop += node.offsetTop;
        totalNodeOffset.totalOffsetLeft += node.offsetLeft;
        if ((node.offsetParent.tagName=='UL')&&(node.offsetParent.id==topListID)) { //reached the top
            return totalNodeOffset; //exit
        } else {
            if (node.tagName=='LI') {
                totalNodeOffset.totalOffsetLeft +=parseInt(node.offsetWidth/2); //account for the translate transform applied to non-top-level LI elements
            };
            return getTotalOffset(node.offsetParent, totalNodeOffset); //recursive call
        };
        return "exception";
    };

    function top() {
        histObj.transform = "matrix(1, 0, 0, 1, 0, 0)"; //initial state
        topList.style.transform = histObj.transform;
        window.history.pushState(JSON.stringify(histObj), 'nav', window.location.href);
    };
    
    function navigate(node) {

        // transform topList appropriately
        var totalOffset = getTotalOffset(node);
        var sizeFraction = Number.parseInt(Number.parseFloat(window.getComputedStyle(topList).height))/(Number.parseFloat(window.getComputedStyle(node).height));
        topList.style.transform = 'translate('+ -totalOffset.totalOffsetLeft*sizeFraction + 'px, '+ -totalOffset.totalOffsetTop*sizeFraction + 'px) scale('+ sizeFraction*100 + '%)';

        // save the transform in history
        histObj.transform = window.getComputedStyle(topList).transform;
        window.history.pushState(JSON.stringify(histObj), 'nav', window.location.href);
    };

    var initSizeDeptCursors = function() { //runs once; adds mouseover event listeners for changing cursor depending on viewed size of LI at time of event
        var ullis = topList.getElementsByTagName('LI');
        for (thisli=0;thisli<ullis.length;thisli++) {
            ullis[thisli].addEventListener('mouseenter', function(evt) {
                if (evt.target.hasAttribute('data-dest')) {
                    // console.log('has dest');
                    if ((evt.target.getBoundingClientRect().left/evt.target.getBoundingClientRect().height)>10) {
                        evt.target.style.cursor = "zoom-in";
                    } else {
                        evt.target.style.cursor = "pointer";
                    };
                };
                evt.stopPropagation();
            });
        };
        var as = topList.getElementsByTagName('A');
        for (thisa=0;thisa<as.length;thisa++) {
            as[thisa].addEventListener('mouseenter', function(evt) {
                var myParentLi = evt.target.closest('LI');
                if ((myParentLi.getBoundingClientRect().left/myParentLi.getBoundingClientRect().height)>10) {
                    evt.target.style.cursor = "zoom-in";
                } else {
                    evt.target.style.cursor = "pointer";
                };
            });
        };
        var imgs = topList.getElementsByTagName('IMG');
        for (thisimg=0;thisimg<imgs.length;thisimg++) {
            imgs[thisimg].addEventListener('mouseenter', function(evt) {
                var myParentLi = evt.target.closest('LI');
                if ((myParentLi.getBoundingClientRect().left/myParentLi.getBoundingClientRect().height)>10) {
                    evt.target.style.cursor = "zoom-in";
                } else {
                    evt.target.style.cursor = "pointer";
                };
            });
        };
    }();

    var fitListInViewport = function() {  //runs once; resize top UL if necessary
        var topListWidth = 0;
        var topListHeight = parseInt(window.getComputedStyle(topList).height);
        var thisLeafWidth;
        var leafNodes = document.querySelectorAll('ul#bubbleTree li:not(:has(ul))');
        for (ln=0;ln<leafNodes.length;ln++) {
            thisLeafWidth = getTotalOffset(leafNodes[ln]).totalOffsetLeft+ parseInt(window.getComputedStyle(leafNodes[ln]).width);
            topListWidth = ((thisLeafWidth>topListWidth)?topListWidth=thisLeafWidth:topListWidth);
        }
        // console.log('total width', topListWidth, 'height', topListHeight);
        // console.log(topListWidth/topListHeight>1?'landscape':'portrait', window.innerHeight, window.innerWidth);
        if (window.innerHeight > window.innerWidth) {
            if (topListWidth>topListHeight) { //the 0.9 feels a bit klugey
                topList.style.height = (window.innerWidth * 0.9 * (topListHeight/topListWidth))+'px';
                topList.style.width = (window.innerWidth * 0.9 * (topListHeight/topListWidth))+'px';
            } else { // if topList is portrait
                // compare the two aspect ratios?
                // leave at default aspect ratio for now though
            }
        }
    }();

    topList.addEventListener('click', function(evt) {
        console.log(evt.target.tagName);
        switch (evt.target.tagName) {
            case 'LI':
                if ((evt.target.getBoundingClientRect().left/evt.target.getBoundingClientRect().height)>10) {
                    navigate(evt.target);
                } else {
                    if (evt.target.hasAttribute('data-dest')) {
                        if (evt.target.dataset.dest=='email') {
                            prepMail();
                        } else {
                            evt.target.style.cursor = 'wait';
                            window.location.href = evt.target.dataset.dest;
                        };
                    } else {
                        navigate(evt.target);
                    }

                };
            break;
            case 'A':
                //check the size of the parent LI on the screen
                var parentLISize = evt.target.closest('LI').getBoundingClientRect();
                // console.log('clicked A', parentLISize.top, parentLISize.left, parentLISize.height, parentLISize.width);
                if ((parentLISize.left/parentLISize.width)>10) {
                    // console.log('too small');
                    navigate(evt.target.closest('LI'));
                    evt.preventDefault();
                } else {
                    evt.target.style.cursor = 'wait';
                };
                break;
            default:
            };
            if (evt.target.parentElement.id!=topListID) {
                document.getElementById('bubbleTopLink').classList.remove('hidden');
            } else {
                // document.getElementById('bubbleTopLink').classList.add('hidden');
            };

        });

    document.getElementById('bubbleTopLink').addEventListener('click', function (evt) {
        bubbleTree.top();
        evt.target.classList.add('hidden');
    });

    that.top = top;
    return that;
})();