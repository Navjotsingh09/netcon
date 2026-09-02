(function () {
  var BLOG_POSTS = [
    {
      slug: "post-01",
      urlSlug: "network-design-implementation",
      title: "All You Need to Know About Network Design & Implementation",
      excerpt: "A breakdown of the process behind designing and implementing a business network, from consultation and diagramming through to installation and testing.",
      dateLabel: "17/07/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-01-resources.jpg"
    },
    {
      slug: "post-02",
      urlSlug: "resilient-network-design",
      title: "Key Elements of a Resilient Network",
      excerpt: "Build a network that withstands failures. Learn the four key factors every organisation needs to design genuine resilience into their infrastructure.",
      dateLabel: "15/07/2026",
      category: "Services",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-03",
      urlSlug: "wireless-vs-wired-networks",
      title: "Wireless vs Wired Networks",
      excerpt: "Wireless and wired networks each have distinct advantages. Understand the trade-offs to make the right choice for your office environment.",
      dateLabel: "12/07/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-03-resources.jpg"
    },
    {
      slug: "post-04",
      urlSlug: "wireless-security-solutions",
      title: "A Guide to Wireless Security Solutions",
      excerpt: "Wireless security is essential for modern businesses. Explore five practical solutions to protect your wireless network from threats.",
      dateLabel: "10/07/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-04-resources.jpg"
    },
    {
      slug: "post-05",
      urlSlug: "cloud-networking-benefits",
      title: "Why Your Business Needs Cloud Networking",
      excerpt: "Cloud networking is transforming how businesses operate. Discover the key benefits and how to implement it effectively in your organisation.",
      dateLabel: "07/07/2026",
      category: "Cloud",
      image: "/images/pages/unique/resources-blog-post-05-resources.png"
    },
    {
      slug: "post-06",
      urlSlug: "network-validation",
      title: "Network Validation: Everything You Need to Know in 2026",
      excerpt: "Ensure your secure wireless network is trustworthy. Learn the key authentication methods and why proactive network validation beats reactive fixes.",
      dateLabel: "04/07/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-06-resources.jpg"
    },
    {
      slug: "post-07",
      urlSlug: "cloud-networking-efficiency",
      title: "Leveraging Cloud Networking for Business Efficiency",
      excerpt: "Cloud networking unlocks new levels of efficiency and agility. Explore how to leverage cloud-based networking to drive business performance.",
      dateLabel: "02/07/2026",
      category: "Cloud",
      image: "/images/pages/unique/resources-blog-post-07-resources.jpg"
    },
    {
      slug: "post-09",
      urlSlug: "professional-it-services",
      title: "The Value of Professional IT Services",
      excerpt: "Professional IT services deliver more than fixes. Understand the full value of working with expert consultants and network specialists.",
      dateLabel: "28/06/2026",
      category: "Managed Services",
      image: "/images/pages/unique/resources-blog-post-09-resources.png"
    },
    {
      slug: "post-10",
      urlSlug: "wlan-guide",
      title: "Everything You Need to Know About WLANs",
      excerpt: "WLANs are central to modern connectivity. A comprehensive guide to everything you need to know about wireless local area networks.",
      dateLabel: "25/06/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-10-resources.jpg"
    },
    {
      slug: "post-11",
      urlSlug: "continuous-network-monitoring",
      title: "How AI is Reducing Network Downtime and IT Costs",
      excerpt: "Artificial intelligence is changing network management by enabling predictive maintenance, anomaly detection, and intelligent resource allocation.",
      dateLabel: "22/06/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-11-resources.jpg"
    },
    {
      slug: "post-12",
      urlSlug: "remote-work-network-security",
      title: "Top Network Security Solutions for Remote Working: Expert Tips",
      excerpt: "Remote working creates new network security challenges. Discover practical network installation, cloud security, endpoint protection, and IT consulting solutions.",
      dateLabel: "19/06/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-12-resources.png"
    },
    {
      slug: "post-13",
      urlSlug: "secure-hybrid-workspace",
      title: "3 Steps to Creating a Secure Hybrid Workspace Using Your Network",
      excerpt: "Hybrid workplaces depend on secure, reliable networks. Learn how to create a balanced work experience, secure the cloud, and embrace zero trust.",
      dateLabel: "16/06/2026",
      category: "Solutions",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-14",
      urlSlug: "sme-network-consultancy",
      title: "Is Your SME Network Holding Your Business Back?",
      excerpt: "Is your SME network limiting your growth? Explore the common network challenges facing small businesses and how a consultant can help.",
      dateLabel: "13/06/2026",
      category: "Industries",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-15",
      urlSlug: "network-consultancy-services",
      title: "Optimising Your Network with Network Consultancy",
      excerpt: "A well-designed network is crucial for smooth data flow and robust security. Learn how strategic optimisation and redundancy strengthen infrastructure.",
      dateLabel: "10/06/2026",
      category: "Managed Services",
      image: "/images/pages/unique/resources-blog-post-15-resources.jpg"
    },
    {
      slug: "post-16",
      urlSlug: "network-upgrade-benefits",
      title: "Reasons to Upgrade Your Network",
      excerpt: "Outdated network infrastructure costs more than you think. Explore the performance, security, and reliability benefits of upgrading your network.",
      dateLabel: "07/06/2026",
      category: "Services",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-17",
      urlSlug: "cisco-network-convergence-system",
      title: "Cisco Network Convergence System",
      excerpt: "Cisco Network Convergence System delivers petabit-scale performance for global service providers. Learn about the breakthroughs powering next-generation networks.",
      dateLabel: "05/06/2026",
      category: "Industry News",
      image: "/images/pages/unique/resources-blog-post-17-resources.jpg"
    },
    {
      slug: "post-18",
      urlSlug: "cisco-security-solutions",
      title: "Cisco and VMware Virtualisation Solutions for Modern Business Networks",
      excerpt: "Discover how Cisco and VMware virtualisation solutions improve flexibility, resilience, security, and scalability for modern business networks.",
      dateLabel: "03/06/2026",
      category: "Industry News",
      image: "/images/pages/unique/resources-blog-post-18-resources.jpg"
    },
    {
      slug: "post-19",
      urlSlug: "network-consultant-benefits",
      title: "Why Your Business Needs a Network Consultant Partner, Not Just an IT Fixer",
      excerpt: "A strategic network consultant partner delivers more than IT fixes. Learn why businesses need expert consultancy to future-proof their infrastructure.",
      dateLabel: "31/05/2026",
      category: "Strategy",
      image: "/images/pages/unique/resources-blog-post-19-resources.jpg"
    },
    {
      slug: "post-20",
      urlSlug: "business-network-components",
      title: "10 Essential Components of a Modern Business Network",
      excerpt: "From reliable connectivity and next-generation firewalls to cloud networking and professional design, explore the ten components every modern business network needs.",
      dateLabel: "21/07/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-business-network-components.jpg"
    },
    {
      slug: "post-21",
      urlSlug: "network-audit-timeline-uk-businesses",
      title: "How Long Does a Network Audit Take? A Complete Guide to UK Businesses",
      excerpt: "Discover how long a network audit takes for UK businesses, what influences the timeline, what the process involves, and how expert audits improve security and performance.",
      dateLabel: "27/07/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-12-resources.png"
    }
  ];

  function parseDateLabel(label) {
    var parts = (label || "").split("/");
    if (parts.length !== 3) return 0;
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var year = parseInt(parts[2], 10);
    var timestamp = new Date(year, month, day).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  // Sort the master list once, newest first. Every place that reads
  // BLOG_POSTS (listing grid, sidebar, search) inherits this order,
  // so new posts always surface correctly regardless of where they
  // were added in the array above.
  BLOG_POSTS.sort(function (a, b) {
    return parseDateLabel(b.dateLabel) - parseDateLabel(a.dateLabel);
  });

  // A post is "NEW" if published within the last 7 days (relative to
  // the most recent post's own date, so this stays accurate even if
  // the site isn't visited for a while).
  var NEW_BADGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  function isNewPost(post) {
    if (!BLOG_POSTS.length) return false;
    var mostRecent = parseDateLabel(BLOG_POSTS[0].dateLabel);
    var reference = Math.max(mostRecent, Date.now());
    return reference - parseDateLabel(post.dateLabel) <= NEW_BADGE_WINDOW_MS;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderBlogIndex() {
    var list = document.getElementById("blog-list");
    var chipsWrap = document.getElementById("blog-filter-chips");
    var resetBtn = document.getElementById("blog-filter-reset");
    var meta = document.getElementById("blog-results-meta");
    var paginationWrap = document.getElementById("blog-pagination");
    var searchInput = document.getElementById("blog-search-input");
    var dateSort = document.getElementById("blog-date-sort");

    if (!list || !chipsWrap || !meta) {
      return;
    }

    var featuredCard = document.querySelector(".blog-featured__card");
    var featuredTitle = document.getElementById("featured-article-heading");
    var featuredMeta = document.querySelector(".blog-featured__meta");
    var featuredText = document.querySelector(".blog-featured__text");
    var featuredImage = document.querySelector(".blog-featured__media img");
    var featuredPost = BLOG_POSTS.filter(function (post) { return post.isFeatured; })
      .sort(function (a, b) { return (a.featuredRank || 999) - (b.featuredRank || 999); })[0];
    if (featuredPost && featuredCard && featuredTitle && featuredMeta && featuredText && featuredImage) {
      featuredCard.href = "/resources/blogs/" + featuredPost.urlSlug;
      featuredTitle.textContent = featuredPost.title;
      featuredMeta.textContent = featuredPost.dateLabel + " \u2022 " + featuredPost.category;
      featuredText.textContent = featuredPost.excerpt;
      featuredImage.src = featuredPost.image;
      featuredImage.alt = featuredPost.imageAlt || featuredPost.title;
    }

    var activeCategory = "All";
    var searchTerm = "";
    var pageSize = 6;
    var currentPage = 1;
    var dateSortDirection = "desc";

    var categories = BLOG_POSTS
      .map(function (post) { return post.category; })
      .filter(function (category, index, arr) { return arr.indexOf(category) === index; })
      .sort();

    categories.forEach(function (category) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "blog-filter__chip";
      chip.setAttribute("data-category", category);
      chip.textContent = category;
      chipsWrap.appendChild(chip);
    });

    function setActiveChip() {
      var chips = chipsWrap.querySelectorAll(".blog-filter__chip");
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-category") === activeCategory);
      });
    }

    function renderPagination(totalPages) {
      if (!paginationWrap || totalPages <= 1) {
        if (paginationWrap) paginationWrap.style.display = "none";
        return;
      }

      paginationWrap.style.display = "flex";
      paginationWrap.innerHTML = "";

      var prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "blog-pagination__btn";
      prevBtn.textContent = "← Previous";
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage--;
          renderPosts();
        }
      });
      paginationWrap.appendChild(prevBtn);

      var pageNumbers = document.createElement("div");
      pageNumbers.className = "blog-pagination__numbers";

      for (var i = 1; i <= totalPages; i++) {
        var pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.className = "blog-pagination__page";
        pageBtn.textContent = i;
        pageBtn.setAttribute("data-page", i);

        if (i === currentPage) {
          pageBtn.classList.add("is-active");
        }

        (function (pageNum) {
          pageBtn.addEventListener("click", function () {
            currentPage = pageNum;
            renderPosts();
          });
        })(i);

        pageNumbers.appendChild(pageBtn);
      }
      paginationWrap.appendChild(pageNumbers);

      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "blog-pagination__btn";
      nextBtn.textContent = "Next →";
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener("click", function () {
        if (currentPage < totalPages) {
          currentPage++;
          renderPosts();
        }
      });
      paginationWrap.appendChild(nextBtn);
    }

    function matchesSearch(post, term) {
      if (!term) return true;
      var haystack = (post.title + " " + post.excerpt + " " + post.category).toLowerCase();
      return haystack.indexOf(term) > -1;
    }

    function renderPosts() {
      var term = searchTerm.trim().toLowerCase();

      var filtered = BLOG_POSTS.filter(function (post) {
        var categoryOk = activeCategory === "All" || post.category === activeCategory;
        return categoryOk && matchesSearch(post, term);
      });
      filtered.sort(function (a, b) {
        return dateSortDirection === "asc"
          ? parseDateLabel(a.dateLabel) - parseDateLabel(b.dateLabel)
          : parseDateLabel(b.dateLabel) - parseDateLabel(a.dateLabel);
      });

      var total = filtered.length;
      var totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = Math.min(startIndex + pageSize, total);
      var visible = filtered.slice(startIndex, endIndex);

      list.innerHTML = visible.map(function (post) {
        var mime = /\.png$/i.test(post.image) ? "image/png" : "image/jpeg";
        var newBadge = isNewPost(post)
          ? "<span class=\"blog-item__new\">New</span>"
          : "";
        return "<article class=\"blog-item animate-fade-up\">" +
          "<div class=\"blog-item__media\">" +
          "<picture>" +
          "<source srcset=\"" + escapeHtml(post.image) + "\" type=\"" + mime + "\">" +
          "<img src=\"" + escapeHtml(post.image) + "\" alt=\"" + escapeHtml(post.title) + "\" loading=\"lazy\" width=\"451\" height=\"312\">" +
          "</picture>" +
          newBadge +
          "<span class=\"blog-item__cat\">" + escapeHtml(post.category) + "</span>" +
          "<span class=\"blog-item__date\">" + escapeHtml(post.dateLabel) + "</span>" +
          "</div>" +
          "<div class=\"blog-item__content\">" +
          "<h3>" + escapeHtml(post.title) + "</h3>" +
          "<p>" + escapeHtml(post.excerpt) + "</p>" +
          "<a class=\"blog-item__link\" href=\"/resources/blogs/" + escapeHtml(post.urlSlug) + "\">Read More</a>" +
          "</div>" +
          "</article>";
      }).join("");

      if (total === 0) {
        meta.textContent = term
          ? "No articles found matching \"" + searchTerm.trim() + "\"."
          : "No articles found for this category.";
      } else {
        meta.textContent = "Showing " + (startIndex + 1) + "-" + endIndex + " of " + total +
          " article" + (total === 1 ? "" : "s") +
          (activeCategory !== "All" ? " in " + activeCategory : "") +
          (term ? " matching \"" + searchTerm.trim() + "\"" : "") + ".";
      }

      renderPagination(totalPages);

      list.querySelectorAll(".animate-fade-up, .animate-fade-in").forEach(function (el) {
        el.classList.add("is-visible");
      });

      if (list) {
        var rect = list.getBoundingClientRect();
        if (rect.top < 0) {
          list.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    chipsWrap.addEventListener("click", function (event) {
      var button = event.target.closest(".blog-filter__chip");
      if (!button) {
        return;
      }
      activeCategory = button.getAttribute("data-category") || "All";
      currentPage = 1;
      setActiveChip();
      renderPosts();
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        activeCategory = "All";
        searchTerm = "";
        if (searchInput) searchInput.value = "";
        currentPage = 1;
        setActiveChip();
        renderPosts();
      });
    }

    if (searchInput) {
      var searchDebounce = null;
      searchInput.addEventListener("input", function () {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(function () {
          searchTerm = searchInput.value;
          currentPage = 1;
          renderPosts();
        }, 200);
      });
    }

    if (dateSort) {
      dateSort.addEventListener("change", function () {
        dateSortDirection = dateSort.value;
        currentPage = 1;
        renderPosts();
      });
    }

    setActiveChip();
    renderPosts();
  }

  // Populates the "Latest Blog" sidebar card on individual post detail
  // pages with real thumbnails, titles and links — excludes whichever
  // post is currently being viewed. Safe no-op on pages without this card.
  function renderLatestSidebar() {
    var card = null;
    document.querySelectorAll(".blog-side__card").forEach(function (candidate) {
      var heading = candidate.querySelector("h3");
      if (heading && heading.textContent.trim() === "Latest Blog") {
        card = candidate;
      }
    });

    var existingItems = card ? card.querySelectorAll(".latest-item") : [];
    if (!card || !existingItems.length) {
      return;
    }

    var pathParts = window.location.pathname.split("/").filter(Boolean);
    var currentUrlSlug = pathParts.length ? pathParts[pathParts.length - 1].replace(/\.html$/, "") : null;
    var moreLink = card.querySelector(".blog-side__more");

    var picks = BLOG_POSTS
      .filter(function (post) { return post.urlSlug !== currentUrlSlug; })
      .slice(0, 3);

    existingItems.forEach(function (item) { item.remove(); });

    picks.forEach(function (post) {
      var link = document.createElement("a");
      link.className = "latest-item";
      link.href = "/resources/blogs/" + post.urlSlug;
      link.innerHTML =
        "<div class=\"latest-item__thumb\">" +
        "<img src=\"" + escapeHtml(post.image) + "\" alt=\"\" loading=\"lazy\" width=\"80\" height=\"71\">" +
        "</div>" +
        "<div>" +
        "<p>" + escapeHtml(post.title) + "</p>" +
        "<time>" + escapeHtml(post.dateLabel) + "</time>" +
        "</div>";
      if (moreLink) {
        card.insertBefore(link, moreLink);
      } else {
        card.appendChild(link);
      }
    });
  }

  window.NETCON_BLOG_POSTS = BLOG_POSTS;
  function loadPublishedPosts() {
    return fetch("/api/public/blogs", { headers: { Accept: "application/json" } })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (data) {
        if (data && Array.isArray(data.posts) && data.posts.length) {
          BLOG_POSTS = data.posts;
          BLOG_POSTS.sort(function (a, b) { return parseDateLabel(b.dateLabel) - parseDateLabel(a.dateLabel); });
          window.NETCON_BLOG_POSTS = BLOG_POSTS;
        }
      })
      .catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadPublishedPosts().then(function () {
      renderBlogIndex();
      renderLatestSidebar();
    });
  });
})();