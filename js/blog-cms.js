(function () {
  var BLOG_POSTS = [
    {
      slug: "post-01",
      title: "All You Need to Know About Network Design & Implementation",
      excerpt: "A breakdown of the process behind designing and implementing a business network, from consultation and diagramming through to installation and testing.",
      dateLabel: "10/12/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-01-resources.jpg"
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
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-03-resources.jpg"
    },
    {
      slug: "post-04",
      title: "A Guide to Wireless Security Solutions",
      excerpt: "Wireless security is essential for modern businesses. Explore five practical solutions to protect your wireless network from threats.",
      dateLabel: "10/12/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-04-resources.jpg"
    },
    {
      slug: "post-05",
      title: "Why Your Business Needs Cloud Networking",
      excerpt: "Cloud networking is transforming how businesses operate. Discover the key benefits and how to implement it effectively in your organisation.",
      dateLabel: "10/12/2026",
      category: "Cloud",
      image: "/images/pages/unique/resources-blog-post-05-resources.png"
    },
    {
      slug: "post-06",
      title: "Network Validation: Everything You Need To Know",
      excerpt: "Ensure your secure wireless network is trustworthy. Learn the key authentication methods and why proactive network validation beats reactive fixes.",
      dateLabel: "10/12/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-06-resources.jpg"
    },
    {
      slug: "post-07",
      title: "Leveraging Cloud Networking for Business Efficiency",
      excerpt: "Cloud networking unlocks new levels of efficiency and agility. Explore how to leverage cloud-based networking to drive business performance.",
      dateLabel: "10/12/2026",
      category: "Cloud",
      image: "/images/pages/unique/resources-blog-post-07-resources.jpg"
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
      category: "Managed Services",
      image: "/images/pages/unique/resources-blog-post-09-resources.png"
    },
    {
      slug: "post-10",
      title: "Everything You Need to Know About WLANs",
      excerpt: "WLANs are central to modern connectivity. A comprehensive guide to everything you need to know about wireless local area networks.",
      dateLabel: "10/12/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-10-resources.jpg"
    },
    {
      slug: "post-11",
      title: "How AI is Reducing Network Downtime and IT Costs",
      excerpt: "Artificial intelligence is changing network management by enabling predictive maintenance, anomaly detection, and intelligent resource allocation.",
      dateLabel: "10/12/2026",
      category: "Infrastructure",
      image: "/images/pages/unique/resources-blog-post-11-resources.jpg"
    },
    {
      slug: "post-12",
      title: "Top Network Security Management Solutions for Remote Working",
      excerpt: "Remote working creates new network security challenges. Discover the top management solutions to keep distributed teams secure in 2025.",
      dateLabel: "10/12/2026",
      category: "Security",
      image: "/images/pages/unique/resources-blog-post-12-resources.png"
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
      title: "Optimising Your Network with Network Consultancy",
      excerpt: "A well-designed network is crucial for smooth data flow and robust security. Learn how strategic optimisation and redundancy strengthen infrastructure.",
      dateLabel: "10/12/2026",
      category: "Managed Services",
      image: "/images/pages/unique/resources-blog-post-15-resources.jpg"
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
      category: "Industry News",
      image: "/images/pages/unique/resources-blog-post-17-resources.jpg"
    },
    {
      slug: "post-18",
      title: "Virtualised Networks Designed & Installed by Us",
      excerpt: "Organisations transform their business with integrated technology from Cisco and VMware. See how converged compute, storage, and virtualisation accelerate IT agility.",
      dateLabel: "10/12/2026",
      category: "Industry News",
      image: "/images/pages/unique/resources-blog-post-18-resources.jpg"
    },
    {
      slug: "post-19",
      title: "Why Your Business Needs a Network Consultant Partner",
      excerpt: "A strategic network consultant partner delivers more than IT fixes. Learn why businesses need expert consultancy to future-proof their infrastructure.",
      dateLabel: "10/12/2026",
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

      // The blog cards above are injected after the page's initial
      // IntersectionObserver scan (js/animations.js) has already run, so
      // scroll-triggered reveal is unreliable for them (never observed,
      // or dependent on scroll position/cache state of animations.js).
      // Reveal them directly and synchronously instead — no rAF/timers,
      // since those can also be suspended on backgrounded/inactive tabs.
      list.querySelectorAll(".animate-fade-up, .animate-fade-in").forEach(function (el) {
        el.classList.add("is-visible");
      });
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
