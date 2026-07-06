(function () {
  var BLOG_POSTS = [
    {
      slug: "post-01",
      title: "Why Your Business Network Needs a Health Check in 2025",
      excerpt: "Most business networks evolve over time. A structured health check helps identify hidden risk, performance bottlenecks, and upgrade priorities before issues impact operations.",
      dateLabel: "10 Dec 2026",
      category: "Strategy",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-02",
      title: "Key Elements of an Effective Firewall Strategy",
      excerpt: "A firewall is only as effective as its configuration. Build layered controls, tighten policy design, and continuously review traffic posture to reduce risk.",
      dateLabel: "08 Jun 2025",
      category: "Security",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-03",
      title: "The Rise of Managed Network Services for UK SMEs",
      excerpt: "Managed support gives SMEs access to proactive monitoring, specialist engineering, and predictable service outcomes without expanding internal headcount.",
      dateLabel: "01 Jun 2025",
      category: "Managed Services",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-04",
      title: "Understanding Network Segmentation and Why It Matters",
      excerpt: "Segmentation reduces lateral threat movement and simplifies policy enforcement, helping organisations protect critical systems more effectively.",
      dateLabel: "25 May 2025",
      category: "Security",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-05",
      title: "How to Prepare Your Network for Microsoft 365",
      excerpt: "Successful Microsoft 365 adoption requires baseline analysis, bandwidth planning, secure identity controls, and continuous user-experience monitoring.",
      dateLabel: "18 May 2025",
      category: "Cloud",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-06",
      title: "What is Zero Trust Network Access and Should Your Business Use It?",
      excerpt: "ZTNA modernises remote access by enforcing identity-driven policy decisions and limiting trust boundaries around users, devices, and applications.",
      dateLabel: "11 May 2025",
      category: "Security",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-07",
      title: "Network Cabling Best Practices for Modern Offices",
      excerpt: "Well-planned cabling enables scalable performance, cleaner maintenance, and future upgrades across fast-growing office environments.",
      dateLabel: "04 May 2025",
      category: "Infrastructure",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-08",
      title: "Business Continuity Planning: How Your Network Affects Recovery Time",
      excerpt: "Recovery performance depends on resilient architecture, tested failover design, and clear operational playbooks during disruption.",
      dateLabel: "27 Apr 2025",
      category: "Continuity",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-09",
      title: "The Pros and Cons of Cloud-Managed Wireless Networks",
      excerpt: "Cloud-managed wireless improves visibility and control, but design, security, and governance choices still determine long-term outcomes.",
      dateLabel: "20 Apr 2025",
      category: "Cloud",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-10",
      title: "How to Choose a Managed Network Support Provider",
      excerpt: "Selecting a provider means evaluating service scope, SLA commitments, governance quality, and engineering depth, not just cost.",
      dateLabel: "13 Apr 2025",
      category: "Managed Services",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-11",
      title: "What is SD-WAN and Is It Right for Your Business?",
      excerpt: "SD-WAN can improve application performance and branch connectivity, but suitability depends on traffic patterns, cloud usage, and policy requirements.",
      dateLabel: "06 Apr 2025",
      category: "Infrastructure",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-12",
      title: "Cybersecurity Essentials Every Business Should Have in Place",
      excerpt: "Baseline controls such as MFA, endpoint policy, segmentation, and logging provide a practical security foundation for most organisations.",
      dateLabel: "30 Mar 2025",
      category: "Security",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-13",
      title: "Network Performance Monitoring: Why Reactive Support Is Not Enough",
      excerpt: "Reactive troubleshooting misses weak signals. Continuous monitoring helps teams prevent downtime and improve service quality before incidents escalate.",
      dateLabel: "23 Mar 2025",
      category: "Managed Services",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-14",
      title: "Remote Working Security: Protecting Your Network Beyond the Office",
      excerpt: "Remote and hybrid teams need identity-aware access, device posture checks, and policy consistency beyond perimeter-based security models.",
      dateLabel: "16 Mar 2025",
      category: "Security",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-15",
      title: "How AI is Changing IT Infrastructure Requirements",
      excerpt: "AI workloads raise new demands around compute density, storage throughput, latency tolerance, and network observability across environments.",
      dateLabel: "09 Mar 2025",
      category: "Infrastructure",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-16",
      title: "The Hidden Costs of Outdated Network Infrastructure",
      excerpt: "Legacy environments create invisible cost through support overhead, downtime exposure, security debt, and limited agility.",
      dateLabel: "02 Mar 2025",
      category: "Infrastructure",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-17",
      title: "VPN vs SASE: Which is Right for Your Remote Workforce?",
      excerpt: "Choosing between VPN and SASE depends on scale, user distribution, application mix, and long-term security posture.",
      dateLabel: "23 Feb 2025",
      category: "Cloud",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-18",
      title: "Network Design Principles for High-Growth Businesses",
      excerpt: "Growth-ready design prioritises modular architecture, standards-based operations, security-by-design, and predictable capacity planning.",
      dateLabel: "16 Feb 2025",
      category: "Infrastructure",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-19",
      title: "How to Build a Business Case for IT Network Investment",
      excerpt: "Strong business cases connect technical upgrades to financial value, risk reduction, service quality, and measurable operational impact.",
      dateLabel: "09 Feb 2025",
      category: "Strategy",
      image: "/images/pages/professional.jpg"
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

    if (!list || !chipsWrap || !meta) {
      return;
    }

    var activeCategory = "All";
    var pageSize = 10;
    var shuffled = shuffle(BLOG_POSTS);

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

    function renderPosts() {
      var filtered = shuffled.filter(function (post) {
        return activeCategory === "All" || post.category === activeCategory;
      });

      var visible = filtered.slice(0, pageSize);
      list.innerHTML = visible.map(function (post) {
        return "<article class=\"blog-item animate-fade-up\">" +
          "<div class=\"blog-item__media\">" +
          "<picture>" +
          "<source srcset=\"" + escapeHtml(post.image) + "\" type=\"image/jpeg\">" +
          "<img src=\"" + escapeHtml(post.image) + "\" alt=\"" + escapeHtml(post.title) + "\" loading=\"lazy\" width=\"451\" height=\"312\">" +
          "</picture>" +
          "<span class=\"blog-item__cat\">" + escapeHtml(post.category) + "</span>" +
          "<span class=\"blog-item__date\">" + escapeHtml(post.dateLabel) + "</span>" +
          "</div>" +
          "<div class=\"blog-item__content\">" +
          "<h3>" + escapeHtml(post.title) + "</h3>" +
          "<p>" + escapeHtml(post.excerpt) + "</p>" +
          "<a class=\"blog-item__link\" href=\"/resources/blog/" + escapeHtml(post.slug) + ".html\">Read More</a>" +
          "</div>" +
          "</article>";
      }).join("");

      var total = filtered.length;
      var shownEnd = Math.min(pageSize, total);
      if (total === 0) {
        meta.textContent = "No articles found for this category.";
      } else {
        meta.textContent = "Showing 1-" + shownEnd + " of " + total + " article" + (total === 1 ? "" : "s") + " in " + activeCategory + ".";
      }
    }

    chipsWrap.addEventListener("click", function (event) {
      var button = event.target.closest(".blog-filter__chip");
      if (!button) {
        return;
      }
      activeCategory = button.getAttribute("data-category") || "All";
      setActiveChip();
      renderPosts();
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        activeCategory = "All";
        shuffled = shuffle(BLOG_POSTS);
        setActiveChip();
        renderPosts();
      });
    }

    setActiveChip();
    renderPosts();
  }

  window.NETCON_BLOG_POSTS = BLOG_POSTS;
  document.addEventListener("DOMContentLoaded", renderBlogIndex);
})();
