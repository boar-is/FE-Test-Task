window.ImagesResolver = (function () {
  class ImagesResolver {
    #queryStrategies = {
      local: (query) => window.localDB
        // Strictly search through tags, case insensetive
        .filter(({ tags }) => tags.split(',').map(tag => tag.toLowerCase().trim()).includes(query))
        .map(({ id, previewURL, tags }) => ({ id, url: previewURL, tags }))
        .slice(0, 16),
      pixabay: (query, signal) => {
        const { apiKey, limit } = this.config.pixabay
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=all&per_page=${limit}`
        return fetch(url, { signal })
          .then(it => it.json())
          .then(({ hits }) => hits.map(({ id, previewURL, tags }) => ({ id, url: previewURL, tags })))
      }
    }

    constructor(config) {
      this.config = config
    }

    // This could be converted into an async function, getting rid of the `Promise.resolve()`
    // But the error must be thrown synchronously (Task 2), not rejected
    search({ query, searchModuleId, signal }) {
      const queryFn = this.#queryStrategies[searchModuleId]

      if (!queryFn) {
        throw new Error(`Unknown search module id: ${searchModuleId}`)
      }

      // Return no results on an empty query
      const invokeQuery = query ? queryFn : (() => [])

      return Promise.resolve(invokeQuery(query, signal)).then((images) => ({
        query,
        images
      }))
    }
  }

  return ImagesResolver;
})();