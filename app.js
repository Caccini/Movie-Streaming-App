document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "b49443a3b93ddf4c3d3ab50e1698ccbc";
    const recentlyAddedUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc`;
    const trendingUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;
    fetchAndUpdateSlider(recentlyAddedUrl, "search-results");
    fetchAndUpdateSlider(trendingUrl, "search-result");

    let activeSlider = "search-results";

    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const genreId = this.getAttribute("data-genre-id");
            const genreUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc`;
            fetchAndUpdateSlider(genreUrl, activeSlider);
            activeSlider =
                activeSlider === "search-results" ? "search-result" : "search-results";
        });
    });

    // Hamburger menu functionality
    const sidebar = document.querySelector(".sidebar");
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const mainContent = document.querySelector(".main-content");
    const closeSidebar = document.querySelector(".close-sidebar");

    hamburgerMenu.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        mainContent.classList.toggle("sidebar-active");
    });

    closeSidebar.addEventListener("click", function () {
        sidebar.classList.remove("active");
        mainContent.classList.remove("sidebar-active");
    });
});

function fetchAndUpdateSlider(url, sliderId) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            updateSlider(data.results, sliderId);
        })
        .catch((error) => console.error("Error fetching movies:", error));
}

function updateSlider(movies, sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) {
        console.error("Slider not found:", sliderId);
        return;
    }
    slider.innerHTML = "";

    movies.forEach((movie) => {
        const imgPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        const imgElement = document.createElement("img");
        imgElement.src = imgPath;
        imgElement.alt = movie.title;
        slider.appendChild(imgElement);
    });

    const progressBar = slider.closest(".row").querySelector(".progress-bar");
    if (progressBar) {
        calculateProgressBar(progressBar);
    }
}

document.addEventListener("click", (e) => {
    let handle;
    if (e.target.matches(".handle")) {
        handle = e.target;
    } else {
        handle = e.target.closest(".handle");
    }
    if (handle != null) onHandleClick(handle);
});

const throttleProgressBar = throttle(() => {
    document.querySelectorAll(".progress-bar").forEach(calculateProgressBar);
}, 250);
window.addEventListener("resize", throttleProgressBar);

document.querySelectorAll(".progress-bar").forEach(calculateProgressBar);

function calculateProgressBar(progressBar) {
    progressBar.innerHTML = "";
    const slider = progressBar.closest(".row").querySelector(".slider");
    const itemCount = slider.children.length;
    const itemsPerScreen = parseInt(
        getComputedStyle(slider).getPropertyValue("--items-per-screen")
    );
    let sliderIndex = parseInt(
        getComputedStyle(slider).getPropertyValue("--slider-index")
    );
    const progressBarItemCount = Math.ceil(itemCount / itemsPerScreen);

    if (sliderIndex >= progressBarItemCount) {
        slider.style.setProperty("--slider-index", progressBarItemCount - 1);
        sliderIndex = progressBarItemCount - 1;
    }

    for (let i = 0; i < progressBarItemCount; i++) {
        const barItem = document.createElement("div");
        barItem.classList.add("progress-item");
        if (i === sliderIndex) {
            barItem.classList.add("active");
        }
        progressBar.append(barItem);
    }
}

function onHandleClick(handle) {
    const progressBar = handle.closest(".row").querySelector(".progress-bar");
    const slider = handle.closest(".slider-container").querySelector(".slider");
    const sliderIndex = parseInt(
        getComputedStyle(slider).getPropertyValue("--slider-index")
    );
    const progressBarItemCount = progressBar.children.length;
    if (handle.classList.contains("left-handle")) {
        if (sliderIndex - 1 < 0) {
            slider.style.setProperty("--slider-index", progressBarItemCount - 1);
            progressBar.children[sliderIndex].classList.remove("active");
            progressBar.children[progressBarItemCount - 1].classList.add("active");
        } else {
            slider.style.setProperty("--slider-index", sliderIndex - 1);
            progressBar.children[sliderIndex].classList.remove("active");
            progressBar.children[sliderIndex - 1].classList.add("active");
        }
    }

    if (handle.classList.contains("right-handle")) {
        if (sliderIndex + 1 >= progressBarItemCount) {
            slider.style.setProperty("--slider-index", 0);
            progressBar.children[sliderIndex].classList.remove("active");
            progressBar.children[0].classList.add("active");
        } else {
            slider.style.setProperty("--slider-index", sliderIndex + 1);
            progressBar.children[sliderIndex].classList.remove("active");
            progressBar.children[sliderIndex + 1].classList.add("active");
        }
    }
}

function throttle(cb, delay = 1000) {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
        if (waitingArgs == null) {
            shouldWait = false;
        } else {
            cb(...waitingArgs);
            waitingArgs = null;
            setTimeout(timeoutFunc, delay);
        }
    };

    return (...args) => {
        if (shouldWait) {
            waitingArgs = args;
            return;
        }

        cb(...args);
        shouldWait = true;
        setTimeout(timeoutFunc, delay);
    };
}

