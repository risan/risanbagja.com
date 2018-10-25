const _ = require("lodash");
const {
  getConfig,
  getPagePath,
  mapConfigForContext
} = require("./markdown-collection-config");

/**
 * Create markdown collection list pages.
 *
 * @param {Object} collectionCount
 * @param {Function} createPage)
 * @return {Void}
 */
module.exports = (collectionCount, createPage) => {
  _.forIn(collectionCount, (total, collection) => {
    const { perPage, listTemplate } = getConfig(collection);
    const configContext = mapConfigForContext(collection);

    const totalPages = Math.ceil(total / perPage);

    _.range(1, totalPages + 1).forEach(page => {
      createPage({
        path: getPagePath(collection, page),
        component: listTemplate,
        context: {
          collection: collection,
          ...configContext,
          limit: perPage,
          skip: (page - 1) * perPage,
          previousPage: page === 1
            ? null
            : getPagePath(collection, page - 1),
          nextPage: page === totalPages
            ? null
            : getPagePath(collection, page + 1)
        }
      });
    });
  });
};
