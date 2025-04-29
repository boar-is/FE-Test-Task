window.ImageGallery = (function () {
  class ImageGallery {
    #abortController = null

    /**
     * @constructor
     * @param {ImagesResolver} imagesResolver
     */
    constructor(imagesResolver) {
      this.imagesResolver = imagesResolver;
      this._initView();
      this._initViewFunctionality();
    }

    /**
     * @param {String} query
     * @param {String} searchModuleId
     */
    search(query, searchModuleId) {
      this.#abortController?.abort()
      this.#abortController = new AbortController()

      this.imagesResolver.search({
          query: query.toLowerCase().trim(),
          searchModuleId,
          signal: this.#abortController.signal
        })
        .then(searchResults => this._onReceiveSearchResult(searchResults))
        .catch(error => {
          // Filtering out AbortError to avoid "DOMException: signal is aborted without reason"
          if (error.name !== 'AbortError') {
            throw error
          }
        })
    }

    addToElement(element) {
      element.appendChild(this.container);
    }

    _onUserSearch(ev) {
      ev.preventDefault();
      this.search(this.seachInput.value, this.searchSelect.value);
    }

    _onReceiveSearchResult(result) {
      this.searchResults.innerHTML = "";
      const imagesInfo = result.images;

      imagesInfo.forEach((image) => {
        const imgNode = document.createElement('img');
        imgNode.setAttribute('src', image.url);
        this.searchResults.appendChild(imgNode);
      });
    }

    _initView() {
      this.container = document.createElement("div");
      this.container.className = "gallery";

      this.form = document.createElement("form");
      this.form.className = "gallery__form form-inline";
      this.container.appendChild(this.form);

      this.formGroup = document.createElement("div");
      this.formGroup.className = "form-group";
      this.form.appendChild(this.formGroup);

      this.seachInput = document.createElement("input");
      this.seachInput.className = "gallery__search form-control";
      this.seachInput.placeholder = "search by tag";
      this.formGroup.appendChild(this.seachInput);

      this.searchSelect = document.createElement("select");
      this.searchSelect.className = "gallery__select form-control";
      // It's better to inject (hoist) it, but then the test will fail
      ([
        {
          value: 'local',
          name: 'Local',
        },
        {
          value: 'pixabay',
          name: 'Pixabay',
        }
      ]).forEach(({ value, name }) => {
        const option = document.createElement("option");
        option.value = value;
        option.innerText = name;
        this.searchSelect.appendChild(option);
      })
      this.formGroup.appendChild(this.searchSelect);

      this.searchButton = document.createElement("button");
      this.searchButton.className = "gallery__button btn btn-primary";
      this.searchButton.innerText = "search";
      this.form.appendChild(this.searchButton);

      this.searchResults = document.createElement("div");
      this.searchResults.className = "gallery__result";
      this.container.appendChild(this.searchResults);
    }

    _initViewFunctionality() {
      this.form.addEventListener("submit", this._onUserSearch.bind(this));
    }
  }

  return ImageGallery;
})();