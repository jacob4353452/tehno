function t_menu__highlightActiveLinks(selector) {
  var url = window.location.href,
    urlWithoutSlash,
    path = window.location.pathname;
  "/" === url[url.length - 1] && (urlWithoutSlash = url.slice(0, -1)),
    "/" === path[path.length - 1] && (path = path.slice(0, -1)),
    "/" === path[0] && (path = path.slice(1)),
    "" === path && (path = "/");
  var shouldBeActiveElements = document.querySelectorAll(selector);
  Array.prototype.forEach.call(shouldBeActiveElements, function (element) {
    var slicedPath = element.getAttribute("href");
    if (slicedPath) {
      var fullPath = element.href,
        tpost;
      -1 !== path.indexOf("tpost") &&
        (tpost = "/" + path.slice(0, path.indexOf("tpost"))),
        (fullPath !== url &&
          fullPath !== path &&
          slicedPath !== url &&
          slicedPath !== path &&
          urlWithoutSlash !== url &&
          urlWithoutSlash !== path &&
          slicedPath !== tpost) ||
          element.classList.add("t-active");
    }
  });
}
function t_menu__findAnchorLinks(recid, selector) {
  var rec = document.getElementById("rec" + recid);
  if (rec && t_menu__isBlockVisible(rec)) {
    var anchorSelector = selector + '[href*="#"]:not(.tooltipstered)',
      navLinks = rec ? rec.querySelectorAll(anchorSelector) : [];
    navLinks.length && t_menu__updateActiveLinks(navLinks, selector);
  }
}
function t_menu__updateActiveLinks(navLinks, selector) {
  var menuClassName = selector.slice(2);
  (menuClassName = ".t" + (menuClassName = parseInt(menuClassName, 10))),
    (navLinks = Array.prototype.slice.call(navLinks));
  var clickedSectionID = null,
    sections = [],
    sectionToNavigationLinkID = {};
  (navLinks = navLinks.reverse()).forEach(function (link) {
    var currentSection = t_menu__getSectionByHref(link);
    currentSection &&
      currentSection.id &&
      (sections.push(currentSection),
      (sectionToNavigationLinkID[currentSection.id] = link));
  }),
    t_menu__updateSectionsOffsets(sections),
    sections.sort(function (a, b) {
      var firstTopOffset = parseInt(a.getAttribute("data-offset-top"), 10) || 0,
        secondTopOffset;
      return (
        (parseInt(b.getAttribute("data-offset-top"), 10) || 0) - firstTopOffset
      );
    }),
    window.addEventListener(
      "resize",
      t_throttle(function () {
        t_menu__updateSectionsOffsets(sections);
      }, 200)
    );
  var menuEls = document.querySelectorAll(menuClassName);
  Array.prototype.forEach.call(menuEls, function (menu) {
    menu.addEventListener("displayChanged", function () {
      t_menu__updateSectionsOffsets(sections);
    });
  }),
    t_menu__highlightNavLinks(
      navLinks,
      sections,
      sectionToNavigationLinkID,
      clickedSectionID
    ),
    navLinks.forEach(function (navLink, i) {
      navLink.addEventListener("click", function () {
        var clickedSection = t_menu__getSectionByHref(navLink);
        !navLink.classList.contains("tooltipstered") &&
          clickedSection &&
          clickedSection.id &&
          (navLinks.forEach(function (link, index) {
            index === i
              ? link.classList.add("t-active")
              : link.classList.remove("t-active");
          }),
          (clickedSectionID = clickedSection.id));
      });
    }),
    window.addEventListener(
      "scroll",
      t_throttle(function () {
        clickedSectionID = t_menu__highlightNavLinks(
          navLinks,
          sections,
          sectionToNavigationLinkID,
          clickedSectionID
        );
      }, 100)
    ),
    "ResizeObserver" in window &&
      setTimeout(function () {
        var documentResizeObserver;
        new ResizeObserver(function () {
          t_menu__updateSectionsOffsets(sections);
        }).observe(document.body);
      }, 500);
}
function t_menu__updateSectionsOffsets(sections) {
  sections.forEach(function (section) {
    var sectionTopPos =
      section.getBoundingClientRect().top + window.pageYOffset;
    section.getAttribute("data-offset-top") !== sectionTopPos.toString() &&
      section.setAttribute("data-offset-top", sectionTopPos);
  });
}
function t_menu__getSectionByHref(curlink) {
  if (curlink) {
    var href = curlink.getAttribute("href"),
      curLinkValue = href ? href.replace(/\s+/g, "") : "";
    if (
      (0 === curLinkValue.indexOf("/") &&
        (curLinkValue = curLinkValue.slice(1)),
      href && curlink.matches('[href*="#rec"]'))
    )
      return (
        (curLinkValue = curLinkValue.replace(/.*#/, "")),
        document.getElementById(curLinkValue)
      );
    var selector = href ? href.trim() : "",
      slashIndex = -1 !== selector.indexOf("#") && selector.indexOf("#");
    "number" == typeof slashIndex
      ? (selector = selector.slice(slashIndex + 1))
      : "number" ==
          typeof (slashIndex =
            -1 !== selector.indexOf("/") && selector.indexOf("/")) &&
        (selector = selector.slice(slashIndex + 1));
    var fullSelector = '.r[data-record-type="215"] a[name="' + selector + '"]',
      el = document.querySelector(fullSelector);
    return el ? el.closest(".r") : null;
  }
}
function t_menu__highlightNavLinks(
  navLinks,
  sections,
  sectionToNavigationLinkID,
  clickedSectionID
) {
  if (document.documentElement.classList.contains("t-body_scroll-locked"))
    return null;
  var scrollPosition = window.pageYOffset,
    scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    ),
    returnValue = clickedSectionID,
    lastSection = sections.length ? sections[sections.length - 1] : null,
    lastSectionTopPos =
      (lastSection &&
        parseInt(lastSection.getAttribute("data-offset-top"), 10)) ||
      0;
  if (
    sections.length &&
    null === clickedSectionID &&
    lastSectionTopPos > scrollPosition + 300
  )
    return (
      navLinks.forEach(function (link) {
        link.classList.remove("t-active");
      }),
      null
    );
  for (var i = 0; i < sections.length; i++) {
    var sectionTopPos = parseInt(
        sections[i].getAttribute("data-offset-top"),
        10
      ),
      navLink = sections[i].id
        ? sectionToNavigationLinkID[sections[i].id]
        : null;
    if (
      scrollPosition + 300 >= sectionTopPos ||
      (0 === i && scrollPosition >= scrollHeight - window.innerHeight)
    ) {
      null === clickedSectionID &&
      navLink &&
      !navLink.classList.contains("t-active")
        ? (navLinks.forEach(function (link) {
            link.classList.remove("t-active");
          }),
          navLink && navLink.classList.add("t-active"),
          (returnValue = null))
        : null !== clickedSectionID &&
          sections[i].id &&
          clickedSectionID === sections[i].id &&
          (returnValue = null);
      break;
    }
  }
  return returnValue;
}
function t_menu__setBGcolor(recid, selector) {
  var menuBlocks = document.querySelectorAll(selector);
  Array.prototype.forEach.call(menuBlocks, function (menu) {
    window.innerWidth > 980
      ? "yes" === menu.getAttribute("data-bgcolor-setbyscript") &&
        (menu.style.backgroundColor = menu.getAttribute("data-bgcolor-rgba"))
      : ((menu.style.backgroundColor = menu.getAttribute("data-bgcolor-hex")),
        menu.setAttribute("data-bgcolor-setbyscript", "yes"),
        menu.style.transform && (menu.style.transform = ""),
        menu.style.opacity && (menu.style.opacity = ""));
  });
}
function t_menu__showFixedMenu(recid, selector) {
  var exceptionClasses,
    isHasExceptionClass = [
      ".t280",
      ".t282",
      ".t450",
      ".t451",
      ".t466",
      ".t453",
    ].some(function (className) {
      return className === selector;
    });
  if (!(window.innerWidth <= 980) || isHasExceptionClass) {
    var rec = document.getElementById("rec" + recid);
    if (!rec) return !1;
    var menuBlocks = rec.querySelectorAll(selector);
    Array.prototype.forEach.call(menuBlocks, function (menu) {
      var appearOffset = menu.getAttribute("data-appearoffset");
      if (appearOffset) {
        -1 !== appearOffset.indexOf("vh") &&
          (appearOffset = Math.floor(
            window.innerHeight * (parseInt(appearOffset) / 100)
          )),
          (appearOffset = parseInt(appearOffset, 10));
        var menuHeight = menu.clientHeight;
        "number" == typeof appearOffset && window.pageYOffset >= appearOffset
          ? menu.style.transform === "translateY(-" + menuHeight + "px)" &&
            t_menu__slideElement(menu, menuHeight, "toBottom")
          : "translateY(0px)" === menu.style.transform
          ? t_menu__slideElement(menu, menuHeight, "toTop")
          : ((menu.style.transform = "translateY(-" + menuHeight + "px)"),
            (menu.style.opacity = "0"));
      }
    });
  }
}
function t_menu__changeBgOpacity(recid, selector) {
  var exceptSelectorList,
    isExceptSelector = ["t280", "t282", "t451", "t466"].some(function (
      expectClass
    ) {
      return -1 !== selector.indexOf(expectClass);
    });
  if (!(window.innerWidth <= 980) || isExceptSelector) {
    var rec = document.getElementById("rec" + recid);
    if (!rec) return !1;
    var menuBlocks = rec.querySelectorAll(selector);
    Array.prototype.forEach.call(menuBlocks, function (menu) {
      var bgColor = menu.getAttribute("data-bgcolor-rgba"),
        bgColorAfterScroll = menu.getAttribute("data-bgcolor-rgba-afterscroll"),
        bgOpacity = menu.getAttribute("data-bgopacity"),
        bgOpacityTwo = menu.getAttribute("data-bgopacity-two"),
        menuShadow = menu.getAttribute("data-menushadow") || "0",
        menuShadowValue = "100" === menuShadow ? menuShadow : "0." + menuShadow;
      (menu.style.backgroundColor =
        window.pageYOffset > 20 ? bgColorAfterScroll : bgColor),
        (window.pageYOffset > 20 && "0" === bgOpacityTwo) ||
        (window.pageYOffset <= 20 &&
          ("0.0" === bgOpacity || "0" === bgOpacity)) ||
        " " === menuShadow
          ? (menu.style.boxShadow = "none")
          : (menu.style.boxShadow =
              "0px 1px 3px rgba(0,0,0," + menuShadowValue + ")");
    });
  }
}
function t_menu__createMobileMenu(recid, selector) {
  var rec = document.getElementById("rec" + recid);
  if (rec) {
    var menu = rec.querySelector(selector),
      menuMobileBurgerhook = menu
        ? menu.getAttribute("data-mobile-burgerhook")
        : "",
      oldMobileMenuSelector = rec.querySelector(selector + "__mobile"),
      mobileMenu = oldMobileMenuSelector || rec.querySelector(".tmenu-mobile"),
      mobileMenuOpenClass = oldMobileMenuSelector
        ? selector.slice(1) + "_opened"
        : "tmenu-mobile_opened",
      burgerOpenClass = "t-menuburger-opened";
    if (mobileMenu)
      if (
        menu &&
        menu.classList.contains(selector.slice(1) + "__mobile_burgerhook") &&
        menuMobileBurgerhook
      ) {
        if (mobileMenu.querySelector(".tmenu-mobile__burger"))
          var mobileBurger = mobileMenu.querySelector(".tmenu-mobile__burger");
        else if (mobileMenu.querySelector(".t-menuburger"))
          var mobileBurger = mobileMenu.querySelector(".t-menuburger");
        if (mobileBurger) {
          var mobileBurgerParent = mobileBurger.parentElement,
            link = document.createElement("a");
          (link.href = menuMobileBurgerhook),
            mobileBurgerParent &&
              (link.appendChild(mobileBurger),
              mobileBurgerParent.appendChild(link));
        }
      } else {
        var mobileBurger = mobileMenu.querySelector(".t-menuburger");
        mobileMenu.addEventListener("click", function (event) {
          if (!event.target.closest("a")) {
            if (mobileMenu.classList.contains(mobileMenuOpenClass))
              t_menu__FadeOut(menu, 300),
                mobileMenu.classList.remove(mobileMenuOpenClass),
                mobileBurger.classList.remove(burgerOpenClass),
                mobileBurger.setAttribute("aria-expanded", "false");
            else if (
              (t_menu__fadeIn(menu, 300, function () {
                menu.style.transform && (menu.style.transform = ""),
                  menu.style.opacity && (menu.style.opacity = "");
              }),
              mobileMenu.classList.add(mobileMenuOpenClass),
              mobileBurger.classList.add(burgerOpenClass),
              mobileBurger.setAttribute("aria-expanded", "true"),
              menu.classList.contains("tmenu-mobile__menucontent_fixed"))
            ) {
              var burgerHeight = getComputedStyle(mobileMenu).height;
              menu.style.top = burgerHeight;
            }
            t_menu_checkOverflow(recid, selector);
          }
        });
      }
    screen.width < 980 &&
      rec.addEventListener("click", function (e) {
        if (
          menu &&
          menu.classList.contains("tmenu-mobile__menucontent_fixed")
        ) {
          var menuLink = e.target.closest(
              ".t-menu__link-item, .t978__submenu-link, .t978__innermenu-link, .t966__menu-link, .t-menusub__link-item, .t-btn, .t794__link"
            ),
            submenuClassList,
            isSubmenuHook;
          if (menuLink)
            [
              "t978__menu-link_hook",
              "t978__tm-link",
              "t966__tm-link",
              "t794__tm-link",
              "t-menusub__target-link",
            ].some(function (submenuClass) {
              return menuLink.classList.contains(submenuClass);
            })
              ? menu.addEventListener("menuOverflow", function () {
                  t_menu_checkOverflow(recid, selector);
                })
              : (t_menu__FadeOut(menu, 300),
                mobileMenu && mobileMenu.classList.remove(mobileMenuOpenClass),
                mobileMenu && mobileBurger.classList.remove(burgerOpenClass));
        }
      }),
      window.addEventListener(
        "resize",
        t_throttle(function () {
          window.innerWidth > 980 &&
            (menu && (menu.style.opacity = ""),
            menu && (menu.style.display = ""),
            menu && (menu.style.top = ""),
            mobileMenu && mobileMenu.classList.remove(mobileMenuOpenClass)),
            t_menu_checkOverflow(recid, selector);
        }, 200)
      );
  }
}
function t_menu_checkOverflow(recid, selector) {
  var rec = document.getElementById("rec" + recid),
    menu = rec ? rec.querySelector(selector) : null;
  if (menu) {
    var oldMobileMenuSelector = rec.querySelector(selector + "__mobile"),
      burger = oldMobileMenuSelector || rec.querySelector(".tmenu-mobile");
    if (burger) {
      var burgerHeight = burger.offsetHeight,
        windowHeight = document.documentElement.clientHeight,
        menuPosition =
          menu.style.position || window.getComputedStyle(menu).position,
        menuHeight = menu.offsetHeight;
      "fixed" === menuPosition &&
        menuHeight > windowHeight - burgerHeight &&
        ((menu.style.overflow = "auto"),
        (menu.style.maxHeight = "calc(100% - " + burgerHeight + "px)"));
    }
  }
}
function t_menu__FadeOut(element, duration, callback) {
  if (!element) return !1;
  var opacity = 1;
  duration = parseInt(duration, 10);
  var speed,
    timer = setInterval(
      function () {
        (element.style.opacity = opacity),
          (opacity -= 0.1) <= 0.1 &&
            ((element.style.opacity = "0"),
            (element.style.display = "none"),
            "function" == typeof callback && callback(),
            clearInterval(timer));
      },
      duration > 0 ? duration / 10 : 40
    );
}
function t_menu__fadeIn(element, duration, callback) {
  if (!element) return !1;
  if (
    ("1" === getComputedStyle(element).opacity ||
      "" === getComputedStyle(element).opacity) &&
    "none" !== getComputedStyle(element).display
  )
    return !1;
  var opacity = 0,
    speed = (duration = parseInt(duration, 10)) > 0 ? duration / 10 : 40;
  (element.style.opacity = opacity), (element.style.display = "block");
  var timer = setInterval(function () {
    (element.style.opacity = opacity),
      (opacity += 0.1) >= 1 &&
        ((element.style.opacity = "1"),
        "function" == typeof callback && callback(),
        clearInterval(timer));
  }, speed);
}
function t_menu__slideElement(menu, menuHeight, direction) {
  var diff = "toTop" === direction ? 0 : menuHeight,
    diffOpacity = "toTop" === direction ? 1 : 0,
    timerID = setInterval(function () {
      (menu.style.transform = "translateY(-" + diff + "px)"),
        (menu.style.opacity = diffOpacity.toString()),
        (diffOpacity =
          "toTop" === direction ? diffOpacity - 0.1 : diffOpacity + 0.1),
        (diff =
          "toTop" === direction
            ? diff + menuHeight / 20
            : diff - menuHeight / 20),
        "toTop" === direction &&
          diff >= menuHeight &&
          ((menu.style.transform = "translateY(-" + menuHeight + "px)"),
          (menu.style.opacity = "0"),
          clearInterval(timerID)),
        "toBottom" === direction &&
          diff <= 0 &&
          ((menu.style.transform = "translateY(0px)"),
          (menu.style.opacity = "1"),
          clearInterval(timerID));
    }, 10);
}
function t_menu__interactFromKeyboard(recid) {
  var rec = document.getElementById("rec" + recid);
  if (rec) {
    var menuItems = rec.querySelectorAll(".t-menu__list > li > a"),
      submenuItems = rec.querySelectorAll(".t-menu__list > li li"),
      keysCode_tab = 9,
      keysCode_enter = 13,
      keysCode_esc = 27,
      keysCode_space = 32,
      menuCurrentIndex = 0,
      submenuCurrentIndex,
      t_menu__focusOnCurrentMenuItem = function (index) {
        index === menuItems.length
          ? (index = 0)
          : index < 0 && (index = menuItems.length - 1),
          menuItems[index].focus(),
          (menuCurrentIndex = index);
      },
      t_menu__focusOnCurrentSubmenuItem = function (menu, index) {
        var items = menu.querySelectorAll("a");
        index == items.length
          ? (index = 0)
          : index < 0 && (index = items.length - 1),
          items[index].focus(),
          (submenuCurrentIndex = index);
      },
      t_menu__interactWithMenuFromKeyboard = function (menuItem) {
        menuItem.addEventListener("keydown", function (event) {
          var submenu = this.parentNode.querySelector(".t-menusub__list");
          switch (event.keyCode) {
            case keysCode_tab:
              if (!event.shiftKey && menuCurrentIndex <= menuItems.length - 2)
                t_menu__focusOnCurrentMenuItem(menuCurrentIndex + 1);
              else {
                if (!(event.shiftKey && menuCurrentIndex > 0)) return;
                t_menu__focusOnCurrentMenuItem(menuCurrentIndex - 1);
              }
              break;
            case keysCode_enter:
            case keysCode_space:
              if (!submenu) return;
              this.click(),
                (submenuCurrentIndex = 0),
                t_menu__focusOnCurrentSubmenuItem(submenu, 0);
          }
          event.preventDefault();
        });
      },
      t_menu__focusOnMenuItem = function (menuItem) {
        menuItem.addEventListener("focus", function () {
          submenuCurrentIndex = 0;
        });
      },
      t_menu__clickOnMenuItem = function (menuItem) {
        var submenu = menuItem.parentNode.querySelector(".t-menusub__menu");
        menuItem.addEventListener("click", function (event) {
          if (
            "false" == this.getAttribute("aria-expanded") ||
            null == this.getAttribute("aria-expanded")
          ) {
            this.setAttribute("aria-expanded", "true");
            var menusubWrapper = menuItem.nextElementSibling,
              marginValue = menusubWrapper
                ? menusubWrapper.getAttribute("data-submenu-margin")
                : 0;
            t_menusub__showSubmenu(menuItem, submenu, marginValue);
          } else this.setAttribute("aria-expanded", "false");
          return event.preventDefault(), !1;
        });
      },
      t_menu__interactWithSubmenuFromKeyboard = function (submenuItem) {
        var submenu = submenuItem.closest(".t-menusub__menu"),
          prevent = !1;
        submenuItem.addEventListener("keydown", function (event) {
          var submenuList = this.parentNode;
          switch (event.keyCode) {
            case keysCode_tab:
              prevent = !0;
              var currentSubmenuItemsLength = submenuList.querySelectorAll(
                ".t-menusub__link-item"
              ).length;
              if (event.shiftKey)
                0 === submenuCurrentIndex
                  ? (t_menu__focusOnCurrentMenuItem(menuCurrentIndex),
                    t_menusub__hideSubmenu(submenu))
                  : t_menu__focusOnCurrentSubmenuItem(
                      submenuList,
                      submenuCurrentIndex - 1
                    );
              else if (submenuCurrentIndex === currentSubmenuItemsLength - 1) {
                if (
                  (t_menusub__hideSubmenu(submenu),
                  menuCurrentIndex === menuItems.length - 1)
                )
                  return;
                t_menu__focusOnCurrentMenuItem(menuCurrentIndex + 1);
              } else
                t_menu__focusOnCurrentSubmenuItem(
                  submenuList,
                  submenuCurrentIndex + 1
                );
              break;
            case keysCode_enter:
            case keysCode_space:
              (prevent = !1), t_menusub__hideSubmenu(submenu);
              break;
            case keysCode_esc:
              (prevent = !0),
                t_menu__focusOnCurrentMenuItem(menuCurrentIndex),
                t_menusub__hideSubmenu(submenu);
          }
          prevent && (event.preventDefault(), event.stopPropagation());
        });
      };
    Array.prototype.forEach.call(menuItems, function (menuItem) {
      var submenu;
      t_menu__focusOnMenuItem(menuItem),
        t_menu__interactWithMenuFromKeyboard(menuItem),
        !menuItem.parentNode.querySelector(".t-menusub__menu") ||
          window.isMobile ||
          "ontouchend" in document ||
          t_menu__clickOnMenuItem(menuItem);
    }),
      Array.prototype.forEach.call(submenuItems, function (submenuItem) {
        t_menu__interactWithSubmenuFromKeyboard(submenuItem);
      });
  }
}
function t_menu__isBlockVisible(rec) {
  var windowWidth = window.innerWidth,
    screenMin = rec.getAttribute("data-screen-min"),
    screenMax = rec.getAttribute("data-screen-max");
  return (
    !(screenMin && windowWidth < parseInt(screenMin, 10)) &&
    !(screenMax && windowWidth > parseInt(screenMax, 10))
  );
}
