(function () {
  var BLOG_POSTS = [
    {
      slug: "post-01",
      title: "Why Your Business Network Needs a Health Check in 2025",
      excerpt: "Most businesses run on networks that have grown organically over time. Learn why regular health checks are essential.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-02",
      title: "Key Elements of a Resilient Network",
      excerpt: "Build a network that withstands failures. Learn the four key factors every organisation needs to design genuine resilience into their infrastructure.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-03",
      title: "Wireless vs Wired Networks",
      excerpt: "Wireless and wired networks each have distinct advantages. Understand the trade-offs to make the right choice for your office environment.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-04",
      title: "A Guide to Wireless Security Solutions",
      excerpt: "Wireless security is essential for modern businesses. Explore five practical solutions to protect your wireless network from threats.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-05",
      title: "Why Your Business Needs Cloud Networking",
      excerpt: "Cloud networking is transforming how businesses operate. Discover the key benefits and how to implement it effectively in your organisation.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-06",
      title: "Network Validation: Everything You Need To Know",
      excerpt: "WLANs are central to modern connectivity. A comprehensive guide to everything you need to know about wireless local area networks.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-07",
      title: "Leveraging Cloud Networking for Business Efficiency",
      excerpt: "Cloud networking unlocks new levels of efficiency and agility. Explore how to leverage cloud-based networking to drive business performance.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-08",
      title: "Key Benefits of Cloud Networking",
      excerpt: "Cloud networking delivers flexibility, scalability, and cost savings. Learn the key benefits and how they apply to growing businesses.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-09",
      title: "The Value of Professional IT Services",
      excerpt: "Professional IT services deliver more than fixes. Understand the full value of working with expert consultants and network specialists.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-10",
      title: "The Different Types of IT Networks",
      excerpt: "Different IT networks suit different business needs. An overview of LAN, WAN, VPN, and other network types to help you choose wisely.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-11",
      title: "Proactive Defence: Why Continuous Monitoring is Critical",
      excerpt: "Continuous monitoring provides proactive defence against cyber threats. Learn why reactive security is no longer enough for modern businesses.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-12",
      title: "Top Network Security Management Solutions for Remote Working",
      excerpt: "Remote working creates new network security challenges. Discover the top management solutions to keep distributed teams secure in 2025.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-13",
      title: "Creating a Secure Hybrid Workspace",
      excerpt: "Hybrid workplaces depend on secure, reliable networks. Three practical steps to build a secure hybrid workspace using your IT infrastructure.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-14",
      title: "Is Your SME Network Holding Your Business Back?",
      excerpt: "Is your SME network limiting your growth? Explore the common network challenges facing small businesses and how a consultant can help.",
      dateLabel: "10/12/2026",
      category: "Industries",
      image: "/images/pages/professional.jpg"
    },
    {
      slug: "post-15",
      title: "How Network Consultancy Services Strengthen Business Infrastructure",
      excerpt: "Expert network consultancy services deliver stronger, more reliable business infrastructure. Understand the real-world impact on modern organisations.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/servers.jpg"
    },
    {
      slug: "post-16",
      title: "Reasons to Upgrade Your Network",
      excerpt: "Outdated network infrastructure costs more than you think. Explore the performance, security, and reliability benefits of upgrading your network.",
      dateLabel: "10/12/2026",
      category: "Services",
      image: "/images/pages/network-abstract.jpg"
    },
    {
      slug: "post-17",
      title: "Cisco Network Convergence System",
      excerpt: "Cisco Network Convergence System delivers petabit-scale performance for global service providers. Learn about the breakthroughs powering next-generation networks.",
      dateLabel: "10/12/2026",
      category: "Industries",
      image: "/images/pages/technician.jpg"
    },
    {
      slug: "post-18",
      title: "Cisco Security Solutions",
      excerpt: "Cisco security services protect your business from threats. From cloud storage to firewall management, discover how Cisco solutions keep you secure.",
      dateLabel: "10/12/2026",
      category: "Solutions",
      image: "/images/pages/cyber-security.jpg"
    },
    {
      slug: "post-19",
      title: "Why Your Business Needs a Network Consultant Partner",
      excerpt: "A strategic network consultant partner delivers more than IT fixes. Learn why businesses need expert consultancy to future-proof their infrastructure.",
      dateLabel: "10/12/2026",
      category: "Services",
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
        shuffled = BLOG_POSTS.slice();
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
