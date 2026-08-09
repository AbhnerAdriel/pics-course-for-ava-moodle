(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var noop = function () {};
  var activeCleanup = noop;

  function findSections(root) {
    var scope = root && typeof root.querySelectorAll === 'function' ? root : document;
    var sections = Array.from(scope.querySelectorAll('[data-pics-video]'));
    if (scope.matches && scope.matches('[data-pics-video]')) sections.unshift(scope);
    return sections;
  }

  function destroyPicsVideoSections() {
    activeCleanup();
    activeCleanup = noop;
  }

  function initPicsVideoSections(root) {
    destroyPicsVideoSections();

    var sections = findSections(root);
    if (!sections.length) return noop;

    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      sections.forEach(function (section) {
        section.classList.add('is-visible');
      });
      return noop;
    }

    var observer = new IntersectionObserver(function (entries, instance) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -5% 0px'
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    var disposed = false;
    var cleanup = function () {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      if (activeCleanup === cleanup) activeCleanup = noop;
    };
    activeCleanup = cleanup;
    return cleanup;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPicsVideoSections(document);
    }, { once: true });
  } else {
    initPicsVideoSections(document);
  }

  window.PICSVideo = {
    init: initPicsVideoSections,
    destroy: destroyPicsVideoSections
  };
}());
