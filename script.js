
// Get HTML elements
const searchForm = document.querySelector(".search-panel");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

// Search when the form is submitted
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchImages(searchInput.value);
});

// Search button click
searchButton.addEventListener("click", () => {
  searchImages(searchInput.value);
});

// Fetch images from Wikimedia Commons
async function searchImages(query) {
  query = query.trim();

  // Ignore empty searches
  if (query === "") return;

  // Clear previous results
  results.innerHTML = "";
  emptyState.style.display = "none";

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not fetch images.");
    }

    const data = await response.json();

    const images = data.query
      ? Object.values(data.query.pages)
      : [];

    // Update result count
    resultCount.textContent =
      `${images.length} results for "${query}"`;

    // Show empty state if no images exist
    if (images.length === 0) {
      emptyState.style.display = "flex";
      return;
    }

    // Create image cards
    images.forEach((item, index) => {
      if (!item.imageinfo || !item.imageinfo[0]) return;

      const imageInfo = item.imageinfo[0];
      const imageUrl = imageInfo.thumburl || imageInfo.url;

      // Card
      const card = document.createElement("article");
      card.className = "image-card";

      // Image link
      const link = document.createElement("a");
      link.href = imageInfo.descriptionurl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "image-link";

      // Image
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = `${query} image ${index + 1}`;
      image.loading = "lazy";

      // English caption instead of Wikimedia filename
      const caption = document.createElement("p");
      caption.className = "image-caption";
      caption.textContent = `${query} inspiration · ${index + 1}`;

      // Add everything to the card
      link.appendChild(image);
      card.appendChild(link);
      card.appendChild(caption);

      results.appendChild(card);
    });

  } catch (error) {
    console.error("Search error:", error);
    resultCount.textContent = "Unable to load images. Try again.";
    emptyState.style.display = "flex";
  }
}

// Clear search
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  results.innerHTML = "";
  resultCount.textContent = "0 results";
  emptyState.style.display = "flex";
});

// Category chip searches
const categoryChips = document.querySelectorAll(".category-chip");

categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const category = chip.textContent
      .replace(/^[^\w]+/, "")
      .trim();

    if (category === "All ideas") {
      searchInput.value = "";
      results.innerHTML = "";
      resultCount.textContent = "0 results";
      emptyState.style.display = "flex";
      return;
    }

    searchInput.value = category;
    searchImages(category);

    categoryChips.forEach((item) => {
      item.classList.remove("chip-active");
    });

    chip.classList.add("chip-active");
  });
});
