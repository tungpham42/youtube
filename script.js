// Utility function to set equal height for a group of elements
function setEqualHeight(selector, offset = 0) {
  const elements = document.querySelectorAll(selector);
  const maxHeight = Array.from(elements).reduce((maxHeight, element) => {
    element.style.height = ""; // Reset height to recalculate properly
    return Math.max(maxHeight, element.getBoundingClientRect().height);
  }, 0);

  elements.forEach((element) => {
    element.style.height = `${maxHeight + offset}px`;
  });
}

// Function to limit text content within a specified length
function limitText(selector, maxLength) {
  $(selector).each(function () {
    const text = $(this).text();
    if (text.length > maxLength) {
      $(this).text(`${text.substring(0, maxLength)}...`);
    }
  });
}

// Function to create and append a news item card to the container
function createNewsItemCard(item) {
  const descriptionWithoutImg = item.description.replace(/<img[^>]*>/g, "");
  const formattedDate = new Date(item.pubDate).toISOString().slice(0, 10);
  const videoId = extractYouTubeVideoId(item.link); // Extract video ID from the link

  return `
    <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
      <div class="card">
        <img src="${item.image}" class="card-img-top" alt="${item.title}" data-bs-toggle="modal" data-bs-target="#videoModal" data-video-id="${videoId}">
        <div class="card-body">
          <h5 class="card-title">
            <a href="${item.link}" target="_blank">${item.title}</a>
          </h5>
          <p class="card-text">${descriptionWithoutImg}</p>
          <small class="text-muted d-block my-3">${formattedDate}</small>
        </div>
      </div>
    </div>
  `;
}

// Function to extract YouTube video ID from a URL
function extractYouTubeVideoId(url) {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return videoIdMatch ? videoIdMatch[1] : null;
}

// Function to fetch RSS feed and populate a container with news items
function fetchRss(rssUrl, containerID) {
  $.ajax({
    url: "fetch_rss.php",
    method: "GET",
    data: { rssUrl },
    success: function (data) {
      const $newsContainer = $(containerID);
      $newsContainer.empty();

      data.forEach((item) => {
        $newsContainer.append(createNewsItemCard(item));
      });

      limitText("p.card-text", 100);
    },
    error: function (err) {
      console.error("Error fetching RSS feed:", err);
    },
  });
}

// Function to update the heights of elements on the page
function updateHeights() {
  setEqualHeight("img.card-img-top");
  setEqualHeight("h5.card-title");
  setEqualHeight(".card-text");
}

// Function to initialize event listeners for dynamically updating content
function setEvents() {
  updateHeights();

  window.addEventListener("load", updateHeights);
  window.addEventListener("resize", updateHeights);
  $('button[data-bs-toggle="tab"]').on("shown.bs.tab", updateHeights);
  $(document).on("ajaxComplete", updateHeights);
}

// Function to handle the back-to-top button visibility and functionality
function initializeBackToTopButton() {
  const $btn = $("#back-to-top");

  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $btn.fadeIn();
    } else {
      $btn.fadeOut();
    }
  });

  $btn.on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, 300);
  });
}

// Function to initialize the modal event to load YouTube video
function initializeModalEvent() {
  $("#videoModal").on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget); // Button that triggered the modal
    const videoId = button.data("video-id"); // Extract video ID from data-* attributes

    const modal = $(this);
    const iframe = modal.find("iframe");

    // Set the iframe source to the YouTube embed URL
    iframe.attr("src", `https://www.youtube.com/embed/${videoId}?autoplay=1`);
  });

  $("#videoModal").on("hide.bs.modal", function () {
    // Stop the video playback when the modal is closed
    $(this).find("iframe").attr("src", "");
  });
}

// Document ready function to initialize events and fetch news data
$(document).ready(function () {
  setEvents();
  initializeBackToTopButton();
  initializeModalEvent();

  newsData.forEach((news) => {
    const newsContainerID = `#${news.name}-news-container`;
    fetchRss(news.url, newsContainerID);

    $(`#${news.name}-tab`).on("click", function () {
      fetchRss(news.url, newsContainerID);
    });
  });
});
