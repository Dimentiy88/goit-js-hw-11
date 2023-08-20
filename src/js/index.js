import { fetchPics } from './key-api';
import { createMarkup } from '../js/markup';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.getElementById(`search-form`),
  input: document.querySelector('.input-form'),
  loadMoreBtn: document.querySelector(`.load-more`),
  gallery: document.querySelector(`.gallery`),
};

const lightboxOptions = {
  overlay: true,
  spinner: true,
  nav: true,
  captions: true,
  captionType: 'data',
};
const lightbox = new SimpleLightbox('.gallery a', lightboxOptions);

let page = 0;
const limitPic = 40;
let totalPage = 0;
const previousTerm = { value: '' };

loadMoreHide();

refs.form.addEventListener(`submit`, showSetPictures);

refs.loadMoreBtn.addEventListener(`click`, showSetPictures);

async function showSetPictures(event) {
  event.preventDefault();

  loadMoreHide();

  let currentSearchTerm = refs.input.value;

  if (currentSearchTerm !== ``) {
    checkNewDataImput(currentSearchTerm, previousTerm);

    try {
      const data = await fetchPics(currentSearchTerm, (page += 1), limitPic);

      showTotalImagesFound(page, data.totalHits);

      totalPage = Math.ceil(data.totalHits / limitPic);

      refs.gallery.insertAdjacentHTML(`beforeend`, createMarkup(data.hits));

      refreshLightbox();

      const { height: cardHeight } =
        refs.gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      checkTheEnd(page, totalPage);
    } catch (error) {
      loadMoreHide();
      console.error(error);
    }
  } else {
    Notiflix.Notify.failure(`Enter a topic to search in the input field!
        As long as the field is empty, the search will not be activated!`);
    return;
  }
}

function loadMoreShow() {
  refs.loadMoreBtn.style.display = 'block';
}

function loadMoreHide() {
  refs.loadMoreBtn.style.display = 'none';
}

function checkTheEnd(p, tp) {
  if (p < tp) {
    loadMoreShow();
  } else {
    loadMoreHide();
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function checkNewDataImput(currentTerm, previousTerm) {
  if (currentTerm !== previousTerm.value) {
    refs.gallery.innerHTML = '';
    previousTerm.value = currentTerm;
    page = 0;
    totalPage = 0;
    return page, totalPage;
  }
}

function showTotalImagesFound(pagecurent, totalimage) {
  if (pagecurent === 1) {
    Notiflix.Notify.success(`Hooray! We found ${totalimage} images.`);
  }
}

function refreshLightbox() {
  lightbox.refresh();
}
