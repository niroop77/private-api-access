const accessKey = "M9MO4VGTHydDuDwxqGNBilJH191l7NHVa6EWQt89lD4";

// ELEMENTS
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-box-input");
const searchResults = document.getElementById("search-results");
const loadMoreBtn = document.getElementById("load-more-btn");
const historyList = document.getElementById("history-list");
const themeToggle = document.getElementById("theme-toggle");
const recommendations = document.querySelectorAll(".tag");

// MODAL ELEMENTS
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const modalCaption = document.getElementById("modal-caption");
const modalClose = document.getElementById("modal-close");
const modalNext = document.querySelector(".modal-next");
const modalPrev = document.querySelector(".modal-prev");

// STATE
let keyword = "";
let page = 1;
let history = [];
let currentImages = [];
let currentIndex = 0;

// LOAD SEARCH HISTORY FROM LOCAL STORAGE
if(localStorage.getItem("searchHistory")) {
    history = JSON.parse(localStorage.getItem("searchHistory"));
}

// SEARCH FUNCTION
async function searchImages(append=false) {
    keyword = searchInput.value.trim();
    if(!keyword) return;

    // Save search history
    if(!history.includes(keyword)) {
        history.unshift(keyword);
        if(history.length > 10) history.pop();
        localStorage.setItem("searchHistory", JSON.stringify(history));
    }

    historyList.style.display = "none";

    // Fetch images from Unsplash API
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;
    const response = await fetch(url);
    const data = await response.json();
    const results = data.results;

    if(!append) searchResults.innerHTML = "";
    currentImages = append ? currentImages.concat(results) : results;

    results.forEach((photo, index) => {
        const link = document.createElement("a");
        link.setAttribute("data-photographer", photo.user.name || "Unknown");
        const img = document.createElement("img");
        img.src = photo.urls.small;
        link.appendChild(img);
        searchResults.appendChild(link);

        // OPEN MODAL ON CLICK
        img.addEventListener("click", () => {
            currentIndex = append ? currentImages.indexOf(photo) : index;
            openModal();
        });
    });

    // Show or hide Load More button
    loadMoreBtn.style.display = results.length === 12 ? "inline-block" : "none";
}

// SEARCH FORM SUBMIT
searchForm.addEventListener("submit", e => {
    e.preventDefault();
    page = 1;
    searchImages();
});

// LOAD MORE BUTTON
loadMoreBtn.addEventListener("click", () => {
    page++;
    searchImages(true);
});

// TRENDING TAGS CLICK
recommendations.forEach(tag => {
    tag.addEventListener("click", () => {
        searchInput.value = tag.textContent;
        page = 1;
        searchImages();
    });
});

// LIVE SEARCH HISTORY
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = history.filter(item => item.toLowerCase().includes(query));
    historyList.style.display = filtered.length ? "block" : "none";
    historyList.innerHTML = "";

    filtered.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.addEventListener("click", () => {
            searchInput.value = item;
            page = 1;
            searchImages();
            historyList.style.display = "none";
        });
        historyList.appendChild(li);
    });
});

// CLICK OUTSIDE TO CLOSE HISTORY
document.addEventListener("click", e => {
    if(!searchForm.contains(e.target)) historyList.style.display = "none";
});

// DARK/LIGHT MODE TOGGLE
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// MODAL FUNCTIONS
function openModal() {
    const photo = currentImages[currentIndex];
    modal.style.display = "block";
    modalImg.src = photo.urls.regular;
    modalCaption.textContent = photo.alt_description || photo.description || "Untitled";
}

function closeModal() { modal.style.display = "none"; }
function nextImage() { currentIndex = (currentIndex + 1) % currentImages.length; openModal(); }
function prevImage() { currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length; openModal(); }

// MODAL EVENTS
modalClose.addEventListener("click", closeModal);
modalNext.addEventListener("click", nextImage);
modalPrev.addEventListener("click", prevImage);
modal.addEventListener("click", e => { if(e.target === modal) closeModal(); });

// KEYBOARD NAVIGATION
document.addEventListener("keydown", e => {
    if(modal.style.display === "block") {
        if(e.key === "ArrowRight") nextImage();
        if(e.key === "ArrowLeft") prevImage();
        if(e.key === "Escape") closeModal();
    }
});
