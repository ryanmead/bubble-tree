const bubbleTree = (function () {

    // var randomBubbleColors = true; //if true, does what the variable name suggests. skips any bubbles with IDs assigned

    const that = {};
    const topListID = 'bubbleTree';
    const topList = document.getElementById(topListID);
    // portrait gutter (fraction of width) so children peek in; from CSS to match navigate()
    const portraitChildPeek = parseFloat(getComputedStyle(topList).getPropertyValue('--portrait-child-peek')) || 0.15;
    // top-level node count, for CSS portrait sizing
    topList.style.setProperty('--top-node-count', topList.querySelectorAll(':scope > li').length);
    // topList.style.transformOrigin = "top left";

    const identityTransform = "matrix(1, 0, 0, 1, 0, 0)"; // the home / un-zoomed transform
    const histObj = {};
    histObj.transform = identityTransform; //initial state

    // seed the initial (page-load) entry so backing up to it has restorable state
    window.history.replaceState(JSON.stringify(histObj), 'nav', window.location.href);

    window.addEventListener('popstate', function(event) { //restore the view for the entry we moved to
        const recalled = event.state ? JSON.parse(event.state).transform : identityTransform;
        topList.style.transform = recalled;
        // keep the up/back bubble in sync: hide it only when we're back at the home view
        document.getElementById('bubbleTopLink').classList.toggle('hidden', recalled === identityTransform);
    });

    function getTotalOffset(node, totalNodeOffset = {'totalOffsetTop' : 0, 'totalOffsetLeft' : 0 }) { //recursively calc total offset of click target from top-level ancestor
        totalNodeOffset.totalOffsetTop += node.offsetTop;
        totalNodeOffset.totalOffsetLeft += node.offsetLeft;
        if ((node.offsetParent.tagName=='UL')&&(node.offsetParent.id==topListID)) { //reached the top
            return totalNodeOffset; //exit
        } else {
            if (node.tagName=='LI') {
                // totalNodeOffset.totalOffsetLeft +=parseInt(node.offsetWidth/2);
                // totalNodeOffset.totalOffsetLeft +=parseInt(node.offsetWidth/2); //account for the translate transform applied to non-top-level LI elements
            }
            return getTotalOffset(node.offsetParent, totalNodeOffset); //recursive call
        }
        return "exception";
    }

    function top() {
        histObj.transform = identityTransform; //initial state
        topList.style.transform = histObj.transform;
        window.history.pushState(JSON.stringify(histObj), 'nav', window.location.href);
    }

    function navigate(node) { //apply translate and scale transforms when bubble clicked
        // transform topList appropriately
        const totalOffset = getTotalOffset(node);
        // fit to the visual viewport (handles pinch/pan); use client* when un-pinched, as
        // innerWidth/Height are unsettled at load on Android
        const doc = document.documentElement;
        const vv = window.visualViewport;
        const pinched = vv && Math.abs(vv.scale - 1) > 0.01; // only trust vv once pinched
        const viewW = pinched ? vv.width    : doc.clientWidth;
        const viewH = pinched ? vv.height   : doc.clientHeight;
        const panX  = pinched ? vv.pageLeft : 0;
        const panY  = pinched ? vv.pageTop  : 0;

        let sizeFraction;
        if (viewH > viewW) { // portrait: fit node to visible width, leave room for children
            const nodeWidth = Number.parseFloat(window.getComputedStyle(node).width);
            const peek = node.querySelector('ul') ? portraitChildPeek : 0; // leaf nodes have no children to reveal
            sizeFraction = (viewW * (1 - peek)) / nodeWidth;
        } else { // landscape: fit node to visible height
            sizeFraction = viewH / Number.parseFloat(window.getComputedStyle(node).height);
        }

        // land the node in the current view, not the layout origin
        const tx = panX - totalOffset.totalOffsetLeft * sizeFraction;
        const ty = panY - totalOffset.totalOffsetTop  * sizeFraction;
        const transform = 'translate('+ tx + 'px, '+ ty + 'px) scale('+ sizeFraction*100 + '%)';
        topList.style.transform = transform;

        // store the value we set, not a mid-transition computed read
        histObj.transform = transform;
        window.history.pushState(JSON.stringify(histObj), 'nav', window.location.href);
    }

    (function() { //runs once; adds mouseover event listeners for changing cursor depending on viewed size of LI at time of event
        const ullis = topList.getElementsByTagName('LI');
        for (let thisli=0;thisli<ullis.length;thisli++) {
            ullis[thisli].addEventListener('mouseenter', function(evt) {
                // console.log(evt.target.id);
                // evt.target.classList.add('emph');
                if (evt.target.hasAttribute('data-dest')) {
                    if ((evt.target.getBoundingClientRect().left/evt.target.getBoundingClientRect().height)>10) {
                        evt.target.style.cursor = "zoom-in";
                    } else {
                        evt.target.style.cursor = "pointer";
                    }
                } else {
                    switch (true) {
                        case evt.target.getBoundingClientRect().height>window.innerHeight:
                            evt.target.style.cursor = "zoom-out";
                            break;
                        case evt.target.getBoundingClientRect().height/window.innerHeight<0.5:
                            evt.target.style.cursor = "zoom-in";
                            break;
                        default:
                            evt.target.style.cursor = "default";
                    }

                }
                // evt.stopPropagation();
            });
        }
        const as = topList.getElementsByTagName('A');
        for (let thisa=0;thisa<as.length;thisa++) {
            as[thisa].addEventListener('mouseenter', function(evt) {
                const myParentLi = evt.target.closest('LI');
                if ((myParentLi.getBoundingClientRect().left/myParentLi.getBoundingClientRect().height)>10) {
                    evt.target.style.cursor = "zoom-in";
                } else {
                    evt.target.style.cursor = "pointer";
                }
            });
        }
        const imgs = topList.getElementsByTagName('IMG');
        for (let thisimg=0;thisimg<imgs.length;thisimg++) {
            imgs[thisimg].addEventListener('mouseenter', function(evt) {
                const myParentLi = evt.target.closest('LI');
                if ((myParentLi.getBoundingClientRect().left/myParentLi.getBoundingClientRect().height)>10) {
                    evt.target.style.cursor = "zoom-in";
                } else {
                    evt.target.style.cursor = "pointer";
                }
            });
        }
    }());

    // initial sizing is handled in CSS (see the orientation media queries)

    topList.addEventListener('click', function(evt) {
        // console.log(evt.target.tagName);
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
                        }
                    } else {
                        navigate(evt.target);
                    }
                }
            break;
            case 'A':
                //check the size of the parent LI on the screen
                const parentLISize = evt.target.closest('LI').getBoundingClientRect();
                // console.log('clicked A', parentLISize.top, parentLISize.left, parentLISize.height, parentLISize.width);
                if ((parentLISize.left/parentLISize.width)>10) {
                    navigate(evt.target.closest('LI'));
                    evt.preventDefault();
                } else {
                    if (evt.target.getAttribute('href')[0]=="#") {
                        evt.preventDefault();
                        if (evt.target.getAttribute('href').length > 1) {
                            const dest = document.getElementById(evt.target.getAttribute('href').substring(1));
                            if (dest!=null) {
                                navigate(dest.closest('LI'));
                            } else {
                                console.log('no id matching href');
                            }
                        } else {
                            console.log('empty href');
                        }
                    } else {
                        evt.target.style.cursor = 'wait';
                    }
                }
                break;
            default:
            }
            if ((evt.target.parentElement.id!=topListID)||(document.querySelectorAll('#'+topListID+' > li').length>1)) {
                document.getElementById('bubbleTopLink').classList.remove('hidden');
            } else {
                document.getElementById('bubbleTopLink').classList.add('hidden');
            }

        });

    if ((typeof randomBubbleColors !== 'undefined')&&randomBubbleColors) {
        const allBubbles = document.querySelectorAll('#' + topListID + ' li');
        for (let i=0;i<allBubbles.length;i++) {
            // var hue = 160 + parseInt(Math.random() * 80);
            const hue = parseInt(Math.random() * 360);
            if (!allBubbles[i].id) {
                allBubbles[i].style.backgroundColor = 'hsla(' + hue + ', 70%, 30%, 0.5)';
            }
        }
    }

    document.getElementById('bubbleTopLink').addEventListener('click', function (evt) {
        bubbleTree.top();
        evt.target.classList.add('hidden');
    });

    that.top = top;
    return that;
})();
