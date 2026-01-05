// ==UserScript==
// @name     NYT Mini Navigator
// @version  1
// @grant    none
// @match    https://www.nytimes.com/crosswords/game/mini/*/*/*
// @run-at   document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log("[NYT Mini Navigator] Script loaded on:", window.location.href);

    // Extract current date from URL
    const url = window.location.href;
    const match = url.match(/(https:\/\/www\.nytimes\.com\/crosswords\/game\/mini)\/(\d{4})\/(\d{2})\/(\d{2})/);
    if (!match) {
        console.warn("[NYT Mini Navigator] URL pattern not matched");
        return;
    }

    const [ , base, year, month, day ] = match;
    const currentDate = new Date(`${year}-${month}-${day}`);

    const formatDate = date => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}/${m}/${d}`;
    };

    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 1);
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 1);
    const prevUrl = `${base}/${formatDate(prev)}`;
    const nextUrl = `${base}/${formatDate(next)}`;

    console.log("[NYT Mini Navigator] Prev:", prevUrl);
    console.log("[NYT Mini Navigator] Next:", nextUrl);

    function waitForToolbar() {
        const toolbar = document.querySelector('.xwd__toolbar--wrapper');
        if (toolbar) return toolbar;
        return null;
    }

    function addNavButtons() {
        const toolbar = waitForToolbar();
        if (!toolbar) {
            console.warn("[NYT Mini Navigator] Toolbar not found yet, retrying...");
            setTimeout(addNavButtons, 500);
            return;
        }

        console.log("[NYT Mini Navigator] Toolbar found, adding buttons...");

        function createToolbarButton(iconText, label, onClick) {
            const li = document.createElement('li');
            li.className = 'xwd__tool--button';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', label);
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<span style="font-weight: bold; font-size: 16px;">${iconText}</span>`;
            btn.addEventListener('click', onClick);

            li.appendChild(btn);
            return li;
        }

        const prevButton = createToolbarButton('⟨', 'Previous Day', () => {
            window.location.href = prevUrl;
        });

        const nextButton = createToolbarButton('⟩', 'Next Day', () => {
            window.location.href = nextUrl;
        });

        const toolbarList = toolbar.querySelector('ul');
        if (toolbarList) {
            toolbarList.appendChild(prevButton);
            toolbarList.appendChild(nextButton);
            console.log("[NYT Mini Navigator] Buttons added!");
        } else {
            console.warn("[NYT Mini Navigator] Toolbar <ul> not found.");
        }
    }

    window.addEventListener('load', addNavButtons);
  
    document.addEventListener('keydown', event => {
        if (!event.shiftKey) return; // Only trigger with Shift held
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        if (event.key === 'ArrowLeft') {
            console.log("[NYT Mini Navigator] Shift+Left → Previous Day");
            window.location.href = prevUrl;
        } else if (event.key === 'ArrowRight') {
            console.log("[NYT Mini Navigator] Shift+Right → Next Day");
            window.location.href = nextUrl;
        }
    });
})();
