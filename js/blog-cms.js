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
      title: "Network Validation: Everything You Need To Know",
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
      title: "Top Network Security Management Solutions for Remote Working",
      excerpt: "Remote working creates new network security challenges. Discover the top management solutions to keep distributed teams secure in 2025.",
      dateLabel: "19/06/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-12-resources.png"
    },
    {
      slug: "post-13",
      urlSlug: "secure-hybrid-workspace",
      title: "Creating a Secure Hybrid Workspace",
      excerpt: "Hybrid workplaces depend on secure, reliable networks. Three practical steps to build a secure hybrid workspace using your IT infrastructure.",
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
      title: "Virtualised Networks Designed & Installed by Us",
      excerpt: "Organisations transform their business with integrated technology from Cisco and VMware. See how converged compute, storage, and virtualisation accelerate IT agility.",
      dateLabel: "03/06/2026",
      category: "Industry News",
      image: "/images/pages/unique/resources-blog-post-18-resources.jpg"
    },
    {
      slug: "post-19",
      urlSlug: "network-consultant-benefits",
      title: "Why Your Business Needs a Network Consultant Partner",
      excerpt: "A strategic network consultant partner delivers more than IT fixes. Learn why businesses need expert consultancy to future-proof their infrastructure.",
      dateLabel: "31/05/2026",
      category: "Strategy",
      image: "/images/pages/unique/resources-blog-post-19-resources.jpg"
    }
  ];

  function shuffle(array) {
    var copy = array.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function escapeHtml(value) {
    return value
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

    if (!list || !chipsWrap || !meta) {
      return;
    }

    var activeCategory = "All";
    var pageSize = 6;
    var currentPage = 1;
    var shuffled = BLOG_POSTS.slice();

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

      // Previous button
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

      // Page numbers
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
        
        (function(pageNum) {
          pageBtn.addEventListener("click", function () {
            currentPage = pageNum;
            renderPosts();
          });
        })(i);
        
        pageNumbers.appendChild(pageBtn);
      }
      paginationWrap.appendChild(pageNumbers);

      // Next button
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

    function renderPosts() {
      var filtered = shuffled.filter(function (post) {
        return activeCategory === "All" || post.category === activeCategory;
      });

      var total = filtered.length;
      var totalPages = Math.ceil(total / pageSize);
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = Math.min(startIndex + pageSize, total);
      var visible = filtered.slice(startIndex, endIndex);

      list.innerHTML = visible.map(function (post) {
        var mime = /\.png$/i.test(post.image) ? "image/png" : "image/jpeg";
        return "<article class=\"blog-item animate-fade-up\">" +
          "<div class=\"blog-item__media\">" +
          "<picture>" +
          "<source srcset=\"" + escapeHtml(post.image) + "\" type=\"" + mime + "\">" +
          "<img src=\"" + escapeHtml(post.image) + "\" alt=\"" + escapeHtml(post.title) + "\" loading=\"lazy\" width=\"451\" height=\"312\">" +
          "</picture>" +
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
        meta.textContent = "No articles found for this category.";
      } else {
        meta.textContent = "Showing " + (startIndex + 1) + "-" + endIndex + " of " + total + " article" + (total === 1 ? "" : "s") + (activeCategory !== "All" ? " in " + activeCategory : "") + ".";
      }

      renderPagination(totalPages);

      // The blog cards above are injected after the page's initial
      // IntersectionObserver scan (js/animations.js) has already run, so
      // scroll-triggered reveal is unreliable for them (never observed,
      // or dependent on scroll position/cache state of animations.js).
      // Reveal them directly and synchronously instead — no rAF/timers,
      // since those can also be suspended on backgrounded/inactive tabs.
      list.querySelectorAll(".animate-fade-up, .animate-fade-in").forEach(function (el) {
        el.classList.add("is-visible");
      });

      // Scroll to top of results smoothly
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
      currentPage = 1; // Reset to first page when changing category
      setActiveChip();
      renderPosts();
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        activeCategory = "All";
        currentPage = 1; // Reset to first page when resetting
        shuffled = BLOG_POSTS.slice();
        setActiveChip();
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
  document.addEventListener("DOMContentLoaded", function () {
    renderBlogIndex();
    renderLatestSidebar();
  });
})();
